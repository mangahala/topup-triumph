import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*, games(name), game_packages(label)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your orders</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-sm">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Orders</h1>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-primary">{order.tracking_id}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.status === "completed" ? "bg-primary/20 text-primary" :
                    order.status === "rejected" ? "bg-destructive/20 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status === "completed" ? "✅ Completed" : order.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.order_type === "topup" && <>{order.games?.name} • {order.game_packages?.label}</>}
                  {order.order_type === "steam" && <>Steam Account • {order.player_name}</>}
                  {order.order_type === "giftcard" && <>Gift Card</>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NPR {order.total_price}</span>
                  <span className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
