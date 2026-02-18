import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import GameCard from "@/components/GameCard";
import { Gamepad2, Zap, Shield, Clock, Gift, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "100% Secure" },
  { icon: Clock, label: "24/7 Support" },
];

const categories = [
  {
    key: "gift-card",
    label: "Gift Cards",
    description: "Google Play, iTunes & More",
    icon: Gift,
    gradient: "from-violet-600 to-purple-700",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    slug: "gift-cards",
  },
  {
    key: "steam",
    label: "Steam Gift Cards",
    description: "Steam Wallet & Game Keys",
    icon: Monitor,
    gradient: "from-blue-600 to-cyan-600",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
    slug: "steam",
  },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        {/* Gift Card & Steam Categories */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground tracking-wide">GIFT CARDS</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => navigate(`/${cat.slug}`)}
                  className="relative overflow-hidden rounded-2xl h-32 sm:h-40 group text-left"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-75`} />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-white" />
                      <span className="font-display text-sm sm:text-base font-bold text-white">{cat.label}</span>
                    </div>
                    <p className="text-white/70 text-xs">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Game Top-Ups */}
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
