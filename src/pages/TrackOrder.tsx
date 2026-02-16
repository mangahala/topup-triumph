import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";

const TrackOrder = () => {
  const [trackId, setTrackId] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Search className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground text-sm mb-8">Enter your tracking ID to check order status</p>

          <div className="flex gap-2">
            <input
              placeholder="e.g. GT-A1B2C3"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value.toUpperCase())}
              className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-display tracking-widest"
            />
            <button
              onClick={() => setSearched(true)}
              disabled={!trackId}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display text-sm font-bold disabled:opacity-40"
            >
              Track
            </button>
          </div>

          {searched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass rounded-xl p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-display text-sm font-bold text-foreground">Processing</p>
                  <p className="text-xs text-muted-foreground">Your top-up is being processed</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">Order received</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                  <span className="text-sm text-warning">Payment verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span className="text-sm text-muted-foreground">Diamonds sent</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;
