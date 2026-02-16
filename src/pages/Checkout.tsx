import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Download, Share2, Upload, Ticket } from "lucide-react";
import Header from "@/components/Header";
import { games, paymentMethods, type GamePackage } from "@/lib/gameData";

const steps = ["Player Info", "Payment", "Proof"];

const Checkout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = games.find((g) => g.slug === slug);

  const [step, setStep] = useState(0);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<GamePackage | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ type: "discount" | "bonus"; value: number } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied({ type: "discount", value: 10 });
    } else if (promoCode.toUpperCase() === "BONUS20") {
      setPromoApplied({ type: "bonus", value: 20 });
    } else {
      setPromoApplied(null);
    }
  };

  const finalPrice = useMemo(() => {
    if (!selectedPkg) return 0;
    if (promoApplied?.type === "discount") {
      return Math.round(selectedPkg.price * (1 - promoApplied.value / 100));
    }
    return selectedPkg.price;
  }, [selectedPkg, promoApplied]);

  const bonusText = useMemo(() => {
    if (!selectedPkg || !game || promoApplied?.type !== "bonus") return null;
    const bonus = Math.round(selectedPkg.diamonds * (promoApplied.value / 100));
    return `+${bonus} Free ${game.currency}!`;
  }, [selectedPkg, promoApplied, game]);

  const handleSubmit = () => {
    const id = "GT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setTrackingId(id);
    setSubmitted(true);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Please pay NPR ${finalPrice} for Order. Game: ${game.name}, Package: ${selectedPkg?.label}. Payment method: ${selectedPayment}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  const canProceedStep0 = playerId && playerName && selectedPkg;
  const canProceedStep1 = selectedPayment;
  const canSubmit = transactionId && screenshot;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
            <Check className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Order Submitted!</h1>
          <p className="text-muted-foreground mb-4">Your tracking ID:</p>
          <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-xl">
            <span className="font-display text-xl text-primary font-bold tracking-widest">{trackingId}</span>
            <button onClick={() => navigator.clipboard.writeText(trackingId)}>
              <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mt-6">We'll process your top-up shortly.</p>
          <button onClick={() => navigate("/")} className="mt-8 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-display text-sm font-semibold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back + Game title */}
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-xl font-bold text-foreground mb-6">
          {game.name} <span className="text-primary">Top Up</span>
        </h1>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Player Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Player Information</h3>
                <input
                  placeholder="Player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  placeholder="In-game Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Package selection */}
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Select Package</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {game.packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative rounded-lg p-3 text-center transition-all border ${
                        selectedPkg?.id === pkg.id
                          ? "border-primary bg-primary/10 neon-glow"
                          : "border-border bg-muted hover:border-primary/30"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full font-display">
                          POPULAR
                        </span>
                      )}
                      <div className="font-display text-sm font-bold text-foreground">{pkg.label}</div>
                      <div className="text-primary text-xs font-semibold mt-1">NPR {pkg.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo code */}
              <div className="glass rounded-xl p-5 space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> Promo Code
                </h3>
                <div className="flex gap-2">
                  <input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={applyPromo} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold font-display">
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary font-medium">
                    {promoApplied.type === "discount"
                      ? `🎉 ${promoApplied.value}% discount applied!`
                      : `🎉 ${promoApplied.value}% bonus ${game.currency} applied!`}
                  </motion.div>
                )}
              </div>

              {/* Price summary */}
              {selectedPkg && (
                <div className="glass rounded-xl p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Package</span>
                    <span className="text-foreground font-medium">{selectedPkg.label}</span>
                  </div>
                  {promoApplied?.type === "discount" && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-primary">-{promoApplied.value}%</span>
                    </div>
                  )}
                  {bonusText && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Bonus</span>
                      <span className="text-primary font-semibold">{bonusText}</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-3 pt-3 border-t border-border">
                    <span className="font-display text-sm font-semibold text-foreground">Total</span>
                    <span className="font-display text-lg font-bold text-primary">NPR {finalPrice}</span>
                  </div>
                </div>
              )}

              <button
                disabled={!canProceedStep0}
                onClick={() => setStep(1)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Select Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`rounded-lg p-4 text-center transition-all border ${
                        selectedPayment === pm.id
                          ? "border-primary bg-primary/10 neon-glow"
                          : "border-border bg-muted hover:border-primary/30"
                      }`}
                    >
                      <div className="text-2xl mb-1">{pm.icon}</div>
                      <div className="text-xs font-medium text-foreground">{pm.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 space-y-4">
                  <h3 className="font-display text-sm font-semibold text-foreground">Scan QR to Pay</h3>
                  <div className="flex justify-center">
                    <div className="bg-foreground/10 rounded-xl p-2">
                      <img
                        src={paymentMethods.find((p) => p.id === selectedPayment)?.qrImage}
                        alt="QR Code"
                        className="w-48 h-48 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount to Pay</span>
                    <span className="font-display font-bold text-primary">NPR {finalPrice}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-2 rounded-lg text-sm hover:bg-muted/80 transition-colors">
                      <Download className="w-4 h-4" /> Download QR
                    </button>
                    <button
                      onClick={shareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 bg-success/20 text-success py-2 rounded-lg text-sm hover:bg-success/30 transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share via WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 bg-muted text-foreground py-3 rounded-xl font-display font-bold text-sm">
                  Back
                </button>
                <button
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Proof */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Upload Payment Screenshot</h3>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-10 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {screenshot ? screenshot.name : "Click to upload screenshot"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground">Transaction ID</h3>
                <input
                  placeholder="Enter transaction ID from payment"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Summary */}
              <div className="glass rounded-xl p-5 space-y-2">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Order Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Game</span><span className="text-foreground">{game.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Player ID</span><span className="text-foreground">{playerId}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Package</span><span className="text-foreground">{selectedPkg?.label}</span></div>
                {bonusText && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Bonus</span><span className="text-primary font-semibold">{bonusText}</span></div>}
                <div className="flex justify-between text-sm pt-2 border-t border-border"><span className="font-display font-semibold text-foreground">Total</span><span className="font-display font-bold text-primary">NPR {finalPrice}</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-muted text-foreground py-3 rounded-xl font-display font-bold text-sm">
                  Back
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed animate-pulse-neon"
                >
                  Submit Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
