import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    image: string | null;
    color: string | null;
  };
  index: number;
}

const GameCard = ({ game, index }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/checkout/${game.slug}`}>
        <div className="group relative glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:neon-glow hover:border-primary/50">
          {/* 16:9 aspect ratio */}
          <div className="aspect-video overflow-hidden">
            <img
              src={game.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop"}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
          <div className="p-3">
            <h3 className="font-display text-xs font-bold text-foreground tracking-wide truncate">{game.name}</h3>
            <p className="text-primary text-xs mt-0.5 font-medium">{game.currency}</p>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Instant</span>
              <span className="text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">24/7</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
