import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import GameCard from "@/components/GameCard";
import { Gamepad2, Zap, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "100% Secure" },
  { icon: Clock, label: "24/7 Support" },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("games").select("*").eq("active", true)
      .then(({ data }) => { setGames(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-10">
        <HeroSlider />
        <div className="flex justify-center gap-8 flex-wrap">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground tracking-wide">TOP UP NOW</h2>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No games available yet. Admin needs to add games.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {games.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          )}
        </section>
        <footer className="border-t border-border pt-8 pb-6 text-center">
          <p className="text-muted-foreground text-sm">© 2026 <span className="font-display text-primary">GAMETOP</span>. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
