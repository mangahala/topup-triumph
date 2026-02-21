import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, ShoppingBag, Star, Clock, CheckCircle, XCircle, ArrowLeft, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [xp, setXp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("orders").select("*, games(name), game_packages(label)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_xp").select("*").eq("user_id", user.id).maybeSingle(),
    ]).then(([p, o, x]) => {
      setProfile(p.data);
      setOrders(o.data || []);
      setXp(x.data);
      setLoading(false);
    });
  }, [user]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
      const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      toast({ title: "Profile photo updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your profile</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-sm">Sign In</button>
        </div>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-primary" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />
      <div className="w-full px-4 py-6 max-w-2xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:opacity-80">
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadAvatar(f);
                }} />
              </label>
              {uploading && <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center"><span className="text-xs text-primary">...</span></div>}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-foreground">{profile?.display_name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {xp && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-4 h-4 text-primary fill-primary/30" />
                  <span className="text-sm font-semibold text-primary">{xp.xp_points} XP</span>
                  <span className="text-xs text-muted-foreground">({xp.total_earned} total)</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => navigate("/my-orders")} className="glass rounded-xl p-3 text-center hover:border-primary/30 border border-transparent transition-all">
            <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">All Orders</span>
          </button>
          <button onClick={() => navigate("/rewards")} className="glass rounded-xl p-3 text-center hover:border-primary/30 border border-transparent transition-all">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">Rewards</span>
          </button>
          <button onClick={() => navigate("/track")} className="glass rounded-xl p-3 text-center hover:border-primary/30 border border-transparent transition-all">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="text-xs text-foreground font-medium">Track Order</span>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-foreground">Recent Orders</h3>
            {orders.length > 5 && (
              <button onClick={() => navigate("/my-orders")} className="text-xs text-primary font-semibold">View All</button>
            )}
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8 text-sm">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcon(order.status)}
                      <span className="font-display text-sm font-bold text-primary">{order.tracking_id}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === "completed" ? "bg-primary/20 text-primary" :
                      order.status === "rejected" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {order.status === "completed" ? "✅ Done" : order.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {order.order_type === "topup" && <>{order.games?.name} • {order.game_packages?.label}</>}
                      {order.order_type === "ott" && <>OTT Plan</>}
                      {order.order_type === "giftcard" && <>Gift Card</>}
                    </span>
                    <span className="text-primary font-semibold">NPR {order.total_price}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
