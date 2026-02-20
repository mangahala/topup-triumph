import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, MapPin, LogIn, LogOut, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="SudurTopup" className="h-10 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-72">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search games..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link to="/my-orders" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden lg:inline">Orders</span>
              </Link>
              <Link to="/rewards" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="hidden lg:inline">XP</span>
              </Link>
            </>
          )}
          <button onClick={() => navigate("/track")}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity font-display tracking-wide">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Track</span>
          </button>
          {user ? (
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
