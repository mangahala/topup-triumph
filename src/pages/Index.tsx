import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import GameCard from "@/components/GameCard";
import { games } from "@/lib/gameData";
import { Gamepad2, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "100% Secure" },
  { icon: Clock, label: "24/7 Support" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-10">
        <HeroSlider />

        {/* Features strip */}
        <div className="flex justify-center gap-8 flex-wrap">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground tracking-wide">
              TOP UP NOW
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {games.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-6 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 <span className="font-display text-primary">GAMETOP</span>. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
