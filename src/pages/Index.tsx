import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import GameCard from "@/components/GameCard";
import { Gamepad2, Zap, Shield, Clock, Tv2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AgeVerification from "@/components/AgeVerification";

const features = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "100% Secure" },
  { icon: Clock, label: "24/7 Support" },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [ottPlatforms, setOttPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem("age_verified") === "true";
  });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase.from("games").select("*").eq("active", true),
      supabase.from("ott_platforms").select("*").eq("active", true),
    ]).then(([g, o]) => {
      setGames(g.data || []);
      setOttPlatforms(o.data || []);
      setLoading(false);
    });
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem("age_verified", "true");
    setAgeVerified(true);
  };

  if (!ageVerified) {
    return <AgeVerification onVerified={handleAgeVerified} />;
  }

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

        {/* OTT Platforms */}
        {ottPlatforms.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Tv2 className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground tracking-wide">OTT PLATFORMS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ottPlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => navigate(`/ott/${platform.slug}`)}
                  className="relative overflow-hidden rounded-2xl aspect-video group text-left"
                >
                  {platform.image ? (
                    <img src={platform.image} alt={platform.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.color}`} />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-70`} />
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <span className="font-display text-sm font-bold text-white">{platform.name}</span>
                    {platform.description && <p className="text-white/70 text-xs truncate">{platform.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Game Top-Ups */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground tracking-wide">TOP UP NOW</h2>
          </div>


          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No games available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {games.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-border pt-8 pb-6 text-center">
          <p className="text-muted-foreground text-sm">© 2026 <span className="font-display text-primary">SUDURTOPUP</span>. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
