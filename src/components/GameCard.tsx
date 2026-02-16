import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Game } from "@/lib/gameData";

interface GameCardProps {
  game: Game;
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
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display text-sm font-bold text-foreground tracking-wide">
              {game.name}
            </h3>
            <p className="text-primary text-xs mt-1 font-medium">{game.currency}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                Instant
              </span>
              <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                24/7
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
