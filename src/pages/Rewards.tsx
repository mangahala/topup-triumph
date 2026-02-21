import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Zap, Gift, Trophy, ArrowLeft, Sparkles, Users } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Rewards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [xpData, setXpData] = useState<{ xp_points: number; total_earned: number } | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [recentWinners, setRecentWinners] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("user_xp").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("rewards").select("*").eq("active", true).order("xp_cost"),
    ]).then(([x, r]) => {
      setXpData(x.data || { xp_points: 0, total_earned: 0 });
      setRewards(r.data || []);
      setLoading(false);
    });
  }, [user]);

  const spinWheel = () => {
    if (spinning || rewards.length === 0) return;
    setSpinning(true);
    setWinner(null);

    // Random winner algorithm - weighted by xp_cost (cheaper = higher chance)
    const maxCost = Math.max(...rewards.map(r => r.xp_cost));
    const weights = rewards.map(r => maxCost - r.xp_cost + 10);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) {
        selectedIdx = i;
        break;
      }
    }

    // Simulate spinning delay
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * rewards.length);
      setWinner(rewards[randomIdx].title);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const finalWinner = rewards[selectedIdx].title;
        setWinner(finalWinner);
        setRecentWinners(prev => [finalWinner, ...prev.slice(0, 4)]);
        setSpinning(false);
        toast({ title: "🎉 Prize Result!", description: `${finalWinner} was selected!` });
      }
    }, 120);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">XP Rewards</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your XP and rewards</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-sm">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />
      <div className="w-full px-4 py-6 max-w-2xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">XP <span className="text-primary">Rewards</span></h1>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* XP Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Current XP Balance</p>
                  <p className="font-display text-3xl font-bold text-primary">{xpData?.xp_points || 0} <span className="text-lg">XP</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-current text-primary" />
                <span>Total Earned: {xpData?.total_earned || 0} XP</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 bg-muted/50 rounded-lg p-3">
                💡 Earn XP with every purchase! You get 1 XP for every NPR 10 spent.
              </p>
            </motion.div>

            {/* Lucky Draw / Random Winner */}
            {rewards.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg font-bold text-foreground">Lucky Draw</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Try your luck! Spin to see which prize gets highlighted. Contact support to claim.</p>

                <div className="text-center mb-4">
                  <div className={`inline-block rounded-2xl px-8 py-4 min-w-[200px] ${spinning ? "bg-primary/10 animate-pulse" : winner ? "bg-primary/20" : "bg-muted/50"}`}>
                    <p className={`font-display text-lg font-bold ${winner ? "text-primary" : "text-muted-foreground"}`}>
                      {winner || "🎰 Spin to Play"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={spinWheel}
                  disabled={spinning}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm disabled:opacity-50 transition-opacity"
                >
                  {spinning ? "🎰 Spinning..." : "🎲 Spin Now"}
                </button>

                {recentWinners.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Recent Results:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentWinners.map((w, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Rewards List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">Available Rewards</h2>
              </div>
              {rewards.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rewards available yet. Check back soon!</p>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward, i) => {
                    const canRedeem = (xpData?.xp_points || 0) >= reward.xp_cost;
                    return (
                      <motion.div key={reward.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`glass rounded-xl p-4 flex items-center gap-4 ${canRedeem ? "border-primary/30" : ""}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canRedeem ? "bg-primary/20" : "bg-muted"}`}>
                          <Gift className={`w-6 h-6 ${canRedeem ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-sm font-bold text-foreground">{reward.title}</h3>
                          {reward.description && <p className="text-xs text-muted-foreground">{reward.description}</p>}
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-current text-primary" />
                            <span className="text-xs font-bold text-primary">{reward.xp_cost} XP</span>
                          </div>
                        </div>
                        <button
                          disabled={!canRedeem}
                          onClick={() => toast({ title: "Contact support to redeem!", description: `Reward: ${reward.title}` })}
                          className={`px-4 py-2 rounded-lg text-xs font-display font-bold transition-colors ${canRedeem ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                        >
                          {canRedeem ? "Redeem" : "Need XP"}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
