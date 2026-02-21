import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Tv2, Star, Phone } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

const OttCheckout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [platform, setPlatform] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from("ott_platforms").select("*").eq("slug", slug).single();
      if (p) {
        setPlatform(p);
        const { data: pl } = await supabase.from("ott_plans").select("*").eq("platform_id", p.id);
        setPlans(pl || []);
      }
      const { data: pms } = await supabase.from("payment_methods").select("*").eq("active", true);
      setPaymentMethods(pms || []);
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleSubmit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!screenshot || !whatsappNumber) return;
    setSubmitting(true);
    try {
      const screenshotUrl = await uploadToImgBB(screenshot);
      const tid = "GT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("orders").insert({
        tracking_id: tid,
        user_id: user.id,
        player_id: whatsappNumber,
        total_price: selectedPlan.price,
        order_type: "ott",
        payment_method_id: selectedPayment,
        screenshot_url: screenshotUrl,
        transaction_id: transactionId,
        whatsapp_number: whatsappNumber,
      });
      if (error) throw error;

      // Award XP
      const xpGain = Math.floor(selectedPlan.price / 10);
      const { data: existing } = await supabase.from("user_xp").select("*").eq("user_id", user.id).single();
      if (existing) {
        await supabase.from("user_xp").update({ xp_points: existing.xp_points + xpGain, total_earned: existing.total_earned + xpGain, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      } else {
        await supabase.from("user_xp").insert({ user_id: user.id, xp_points: xpGain, total_earned: xpGain });
      }

      setTrackingId(tid);
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!platform) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Platform not found.</p></div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
            <Check className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Order Submitted!</h1>
          <p className="text-muted-foreground mb-2">Your OTT credentials will be sent to your WhatsApp.</p>
          <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-xl mb-6">
            <span className="font-display text-xl text-primary font-bold">{trackingId}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current text-primary" />
            <span className="text-primary">+{Math.floor(selectedPlan?.price / 10)} XP earned!</span>
          </div>
          <p className="text-muted-foreground text-sm bg-muted/50 rounded-xl p-4 max-w-sm mx-auto">
            ⏳ Please wait 30–40 min for delivery. We'll send the email & password to your WhatsApp: <strong className="text-foreground">{whatsappNumber}</strong>
          </p>
          <button onClick={() => navigate("/")} className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-display text-sm font-semibold">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <Tv2 className="w-6 h-6 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">{platform.name} <span className="text-primary">Plans</span></h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Choose a Plan</h3>
                {plans.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No plans available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map(plan => (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                        className={`relative rounded-xl p-4 text-left transition-all border ${selectedPlan?.id === plan.id ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/30"}`}>
                        {plan.popular && <span className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{plan.emoji}</span>
                          <span className="font-display text-sm font-bold text-foreground">{plan.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{plan.duration}</p>
                        <p className="font-display text-primary font-bold">NPR {plan.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="glass rounded-xl p-5 space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Your WhatsApp Number
                </h3>
                <p className="text-xs text-muted-foreground">We'll send the OTT email & password to this WhatsApp number.</p>
                <input placeholder="e.g. 9800000000" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <button disabled={!selectedPlan || !whatsappNumber} onClick={() => setStep(1)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-40">
                Continue to Payment
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Select Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                      className={`rounded-lg p-4 text-center border transition-all ${selectedPayment === pm.id ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/30"}`}>
                      {pm.icon_url ? <img src={pm.icon_url} alt={pm.name} className="w-8 h-8 mx-auto mb-1 rounded" /> : <div className="text-2xl mb-1">💳</div>}
                      <div className="text-xs font-medium text-foreground">{pm.name}</div>
                    </button>
                  ))}
                </div>
                {selectedPayment && (() => {
                  const pm = paymentMethods.find(p => p.id === selectedPayment);
                  return pm?.qr_image_url ? (
                    <div className="text-center">
                      <img src={pm.qr_image_url} alt="QR" className="w-48 h-48 mx-auto rounded-lg" />
                      <p className="text-sm text-muted-foreground mt-2">Amount: <span className="text-primary font-bold">NPR {selectedPlan?.price}</span></p>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Payment Proof</h3>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/50">
                  <span className="text-sm text-muted-foreground">{screenshot ? screenshot.name : "Upload payment screenshot"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
                </label>
                <input placeholder="Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 bg-muted text-foreground py-3 rounded-xl font-display font-bold text-sm">Back</button>
                <button disabled={!selectedPayment || !screenshot || !transactionId || submitting} onClick={handleSubmit}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-40">
                  {submitting ? "Submitting..." : "Submit Order"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OttCheckout;
