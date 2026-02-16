import Header from "@/components/Header";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const MyOrders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground text-sm">
            Order history will be available once you connect your account.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
