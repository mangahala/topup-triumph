import { motion } from "framer-motion";
import { Zap, ShieldCheck } from "lucide-react";

interface AgeVerificationProps {
  onVerified: () => void;
}

const AgeVerification = ({ onVerified }: AgeVerificationProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 max-w-sm w-full text-center space-y-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Age Verification</h1>
          <p className="text-muted-foreground text-sm">
            This platform is intended for users aged <span className="text-foreground font-bold">12 and above</span>. Please confirm your age to continue.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onVerified}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            I am 12 or older — Enter
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-muted text-muted-foreground py-3 rounded-xl font-display font-bold text-sm"
          >
            I am under 12 — Exit
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60">
          By entering, you confirm you meet the minimum age requirement.
        </p>
      </motion.div>
    </div>
  );
};

export default AgeVerification;
