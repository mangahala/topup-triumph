import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, MessageCircle, User, FileText } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

const cardTypes = ["Steam Wallet", "Google Play", "iTunes", "PlayStation", "Xbox"];

const GiftCards = () => {
  const [cardType, setCardType] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientWhatsapp, setRecipientWhatsapp] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("payment_methods").select("*").eq("active", true)
      .then(({ data }) => setPaymentMethods(data || []));
  }, []);

  const handleSubmit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!screenshot) { toast({ title: "Upload payment screenshot", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const screenshotUrl = await uploadToImgBB(screenshot);
      const tid = "GT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: order, error } = await supabase.from("orders").insert({
        tracking_id: tid,
        user_id: user.id,
        player_id: recipientWhatsapp,
        player_name: recipientName,
        total_price: parseFloat(amount),
        order_type: "giftcard",
        payment_method_id: selectedPayment,
        screenshot_url: screenshotUrl,
        transaction_id: transactionId,
      }).select().single();

      if (error) throw error;

      await supabase.from("gift_card_orders").insert({
        order_id: order.id,
        recipient_name: recipientName,
        recipient_whatsapp: recipientWhatsapp,
        personal_message: personalMessage,
        card_type: cardType,
      });

      setTrackingId(tid);
      setStep(3);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Gift Cards</h1>
          <p className="text-muted-foreground mb-6">Please sign in to purchase gift cards</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-sm">Sign In</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Gift Card Order Submitted!</h1>
          <p className="text-muted-foreground mb-4">Tracking ID: <span className="text-primary font-display font-bold">{trackingId}</span></p>
          <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-sm">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">
          <Gift className="inline w-6 h-6 text-primary mr-2" />Gift <span className="text-primary">Cards</span>
        </h1>

        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass rounded-xl p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Select Card Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {cardTypes.map(type => (
                  <button key={type} onClick={() => setCardType(type)}
                    className={`rounded-lg p-3 text-sm font-medium border transition-all ${cardType === type ? "border-primary bg-primary/10 text-foreground" : "border-border bg-muted text-muted-foreground hover:border-primary/30"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Amount (NPR)</h3>
              <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="glass rounded-xl p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Recipient Details</h3>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input placeholder="Recipient Name" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                  className="w-full bg-muted rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input placeholder="Recipient WhatsApp Number" value={recipientWhatsapp} onChange={e => setRecipientWhatsapp(e.target.value)}
                  className="w-full bg-muted rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea placeholder="Personal Message (optional)" value={personalMessage} onChange={e => setPersonalMessage(e.target.value)}
                  className="w-full bg-muted rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary min-h-[80px]" />
              </div>
            </div>
            <button disabled={!cardType || !amount || !recipientName || !recipientWhatsapp} onClick={() => setStep(1)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-40">
              Continue to Payment
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass rounded-xl p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Select Payment Method</h3>
              {paymentMethods.length === 0 ? (
                <p className="text-muted-foreground text-sm">No payment methods available. Admin needs to add them.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                      className={`rounded-lg p-4 text-center border transition-all ${selectedPayment === pm.id ? "border-primary bg-primary/10 neon-glow" : "border-border bg-muted hover:border-primary/30"}`}>
                      {pm.icon_url ? <img src={pm.icon_url} alt={pm.name} className="w-8 h-8 mx-auto mb-1 rounded" /> : <div className="text-2xl mb-1">💳</div>}
                      <div className="text-xs font-medium text-foreground">{pm.name}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedPayment && (() => {
                const pm = paymentMethods.find(p => p.id === selectedPayment);
                return pm?.qr_image_url ? (
                  <div className="text-center space-y-3">
                    <img src={pm.qr_image_url} alt="QR" className="w-48 h-48 mx-auto rounded-lg" />
                    <p className="text-sm text-muted-foreground">Amount: <span className="text-primary font-bold">NPR {amount}</span></p>
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
      </div>
    </div>
  );
};

export default GiftCards;
