import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Package, Settings, Ticket, CreditCard, Bell, BellOff,
  Eye, Check, X, Plus, Trash2, Upload, Gamepad2, Users, Image,
  ChevronDown, ChevronUp, Tv2, Share2, Star, MessagesSquare, Link2,
  Camera, FileJson, AlertCircle, Clock, Receipt
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

type Tab = "orders" | "games" | "ott" | "payments" | "promos" | "banners" | "users" | "social" | "rewards" | "tickets";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("orders");
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [ottPlatforms, setOttPlatforms] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Form states
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", slug: "", currency: "Diamonds", imageUrl: "", color: "from-orange-500 to-red-600" });
  const [gameImageFile, setGameImageFile] = useState<File | null>(null);
  const [gameUploading, setGameUploading] = useState(false);
  const [pkgForm, setPkgForm] = useState<{ gameId: string; amount: string; price: string; label: string; emoji: string; popular: boolean } | null>(null);
  const [showJsonImport, setShowJsonImport] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");

  const [showOttForm, setShowOttForm] = useState(false);
  const [ottForm, setOttForm] = useState({ name: "", slug: "", description: "", imageUrl: "", color: "from-purple-500 to-pink-600" });
  const [ottImageFile, setOttImageFile] = useState<File | null>(null);
  const [ottPlanForm, setOttPlanForm] = useState<{ platformId: string; label: string; emoji: string; duration: string; price: string; popular: boolean } | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: "", iconFile: null as File | null, qrFile: null as File | null });

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", type: "discount" as "discount" | "bonus", value: "" });

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", imageFile: null as File | null, displayOrder: "0" });
  const [bannerUploading, setBannerUploading] = useState(false);

  const [showSocialForm, setShowSocialForm] = useState(false);
  const [socialForm, setSocialForm] = useState({ platform: "TikTok", url: "", label: "" });

  const [showRewardForm, setShowRewardForm] = useState(false);
  const [rewardForm, setRewardForm] = useState({ title: "", description: "", xpCost: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) return;
    loadData();
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    const [o, g, ott, pm, pc, b, p, sp, rw, tk] = await Promise.all([
      supabase.from("orders").select("*, games(name), game_packages(label), payment_methods(name)").order("created_at", { ascending: false }),
      supabase.from("games").select("*, game_packages(*)").order("created_at", { ascending: false }),
      supabase.from("ott_platforms").select("*, ott_plans(*)").order("created_at", { ascending: false }),
      supabase.from("payment_methods").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("hero_banners").select("*").order("display_order", { ascending: true }),
      supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }),
      supabase.from("social_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("rewards").select("*").order("xp_cost", { ascending: true }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setGames(g.data || []);
    setOttPlatforms(ott.data || []);
    setPaymentMethods(pm.data || []);
    setPromos(pc.data || []);
    setBanners(b.data || []);
    setUsers(p.data || []);
    setSocialProfiles(sp.data || []);
    setRewardsList(rw.data || []);
    setTickets(tk.data || []);
    setLoading(false);
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-4">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mb-6">Please sign in with an admin account</p>
          <button onClick={() => navigate("/auth")} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm">Sign In</button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <ShieldCheck className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  // ---- Action helpers ----
  const completeOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "completed" } : o));
    if (whatsappToggle) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const msg = encodeURIComponent(`✅ Your top-up (${order.game_packages?.label || order.order_type}) has been completed! Order: ${order.tracking_id}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      }
    }
  };

  const rejectOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "rejected" }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "rejected" } : o));
  };

  const deleteItem = async (table: string, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted successfully" });
    loadData();
  };

  const addGame = async () => {
    if (!gameForm.name || !gameForm.slug) return;
    setGameUploading(true);
    try {
      let imageUrl = gameForm.imageUrl;
      if (gameImageFile) imageUrl = await uploadToImgBB(gameImageFile);
      const { error } = await supabase.from("games").insert({ name: gameForm.name, slug: gameForm.slug, currency: gameForm.currency, image: imageUrl, color: gameForm.color });
      if (error) throw error;
      setShowGameForm(false);
      setGameForm({ name: "", slug: "", currency: "Diamonds", imageUrl: "", color: "from-orange-500 to-red-600" });
      setGameImageFile(null);
      loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setGameUploading(false); }
  };

  const addPackage = async () => {
    if (!pkgForm) return;
    const { error } = await supabase.from("game_packages").insert({
      game_id: pkgForm.gameId, amount: parseInt(pkgForm.amount) || 0, price: parseFloat(pkgForm.price), label: pkgForm.label, emoji: pkgForm.emoji, popular: pkgForm.popular
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPkgForm(null);
    loadData();
  };

  const importJsonPackages = async (gameId: string) => {
    try {
      const parsed = JSON.parse(jsonInput);
      const pkgs = Array.isArray(parsed) ? parsed : [parsed];
      for (const pkg of pkgs) {
        await supabase.from("game_packages").insert({
          game_id: gameId,
          label: pkg.label || pkg.name || "Package",
          amount: parseInt(pkg.amount) || 0,
          price: parseFloat(pkg.price) || 0,
          emoji: pkg.emoji || "💎",
          popular: pkg.popular || false,
        });
      }
      toast({ title: `Imported ${pkgs.length} package(s)!` });
      setShowJsonImport(null);
      setJsonInput("");
      loadData();
    } catch {
      toast({ title: "Invalid JSON", description: "Check your JSON format", variant: "destructive" });
    }
  };

  const addOttPlatform = async () => {
    if (!ottForm.name || !ottForm.slug) return;
    let imageUrl = ottForm.imageUrl;
    if (ottImageFile) {
      try { imageUrl = await uploadToImgBB(ottImageFile); } catch (err: any) { toast({ title: "Upload error", description: err.message, variant: "destructive" }); return; }
    }
    const { error } = await supabase.from("ott_platforms").insert({ name: ottForm.name, slug: ottForm.slug, description: ottForm.description, image: imageUrl, color: ottForm.color });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowOttForm(false);
    setOttForm({ name: "", slug: "", description: "", imageUrl: "", color: "from-purple-500 to-pink-600" });
    setOttImageFile(null);
    loadData();
  };

  const addOttPlan = async () => {
    if (!ottPlanForm) return;
    const { error } = await supabase.from("ott_plans").insert({
      platform_id: ottPlanForm.platformId, label: ottPlanForm.label, emoji: ottPlanForm.emoji, duration: ottPlanForm.duration, price: parseFloat(ottPlanForm.price), popular: ottPlanForm.popular
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setOttPlanForm(null);
    loadData();
  };

  const addPaymentMethod = async () => {
    if (!paymentForm.name) return;
    let iconUrl = null, qrUrl = null;
    try {
      if (paymentForm.iconFile) iconUrl = await uploadToImgBB(paymentForm.iconFile);
      if (paymentForm.qrFile) qrUrl = await uploadToImgBB(paymentForm.qrFile);
    } catch (err: any) { toast({ title: "Upload error", description: err.message, variant: "destructive" }); return; }
    const { error } = await supabase.from("payment_methods").insert({ name: paymentForm.name, icon_url: iconUrl, qr_image_url: qrUrl });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowPaymentForm(false);
    setPaymentForm({ name: "", iconFile: null, qrFile: null });
    loadData();
  };

  const addPromo = async () => {
    if (!promoForm.code || !promoForm.value) return;
    const { error } = await supabase.from("promo_codes").insert({ code: promoForm.code.toUpperCase(), type: promoForm.type, value: parseFloat(promoForm.value) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowPromoForm(false);
    setPromoForm({ code: "", type: "discount", value: "" });
    loadData();
  };

  const addBanner = async () => {
    if (!bannerForm.imageFile) { toast({ title: "Please select an image", variant: "destructive" }); return; }
    setBannerUploading(true);
    try {
      const imageUrl = await uploadToImgBB(bannerForm.imageFile);
      const { error } = await supabase.from("hero_banners").insert({ title: bannerForm.title, subtitle: bannerForm.subtitle, image_url: imageUrl, display_order: parseInt(bannerForm.displayOrder) || 0, active: true });
      if (error) throw error;
      setShowBannerForm(false);
      setBannerForm({ title: "", subtitle: "", imageFile: null, displayOrder: "0" });
      toast({ title: "Banner added!" });
      loadData();
    } catch (err: any) { toast({ title: "Upload error", description: err.message, variant: "destructive" }); }
    finally { setBannerUploading(false); }
  };

  const addSocialProfile = async () => {
    if (!socialForm.url) return;
    const { error } = await supabase.from("social_profiles").insert({ platform: socialForm.platform, url: socialForm.url, label: socialForm.label });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowSocialForm(false);
    setSocialForm({ platform: "TikTok", url: "", label: "" });
    loadData();
  };

  const addReward = async () => {
    if (!rewardForm.title || !rewardForm.xpCost) return;
    const { error } = await supabase.from("rewards").insert({ title: rewardForm.title, description: rewardForm.description, xp_cost: parseInt(rewardForm.xpCost) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowRewardForm(false);
    setRewardForm({ title: "", description: "", xpCost: "" });
    loadData();
  };

  const loadUserOrders = async (userId: string) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (userOrders[userId]) return;
    const { data } = await supabase.from("orders").select("*, games(name), game_packages(label), payment_methods(name)").eq("user_id", userId).order("created_at", { ascending: false });
    setUserOrders(prev => ({ ...prev, [userId]: data || [] }));
  };

  const shareToSocial = (platform: string, message: string) => {
    const encoded = encodeURIComponent(message);
    if (platform === "TikTok") window.open(`https://www.tiktok.com/`, "_blank");
    else if (platform === "Instagram") window.open(`https://www.instagram.com/`, "_blank");
    else window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const inputCls = "w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary";

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "orders", label: "Orders", icon: Package },
    { key: "games", label: "Games", icon: Gamepad2 },
    { key: "ott", label: "OTT", icon: Tv2 },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "promos", label: "Promos", icon: Ticket },
    { key: "banners", label: "Banners", icon: Image },
    { key: "users", label: "Users", icon: Users },
    { key: "social", label: "Social", icon: Share2 },
    { key: "rewards", label: "Rewards", icon: Star },
    { key: "tickets", label: "Tickets", icon: MessagesSquare },
  ];

  const statusColor = (status: string) =>
    status === "completed" ? "bg-primary/10 text-primary" :
    status === "rejected" ? "bg-destructive/10 text-destructive" :
    "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-strong border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">SUDURTOPUP ADMIN</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {whatsappToggle ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
          <button onClick={() => setWhatsappToggle(!whatsappToggle)}
            className={`relative w-10 h-5 rounded-full transition-colors ${whatsappToggle ? "bg-primary" : "bg-muted"}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${whatsappToggle ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto bg-card/30">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : (
          <>
            {/* ═══════════ ORDERS TAB ═══════════ */}
            {tab === "orders" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
                {orders.length === 0 ? <p className="text-muted-foreground text-center py-8">No orders yet.</p> :
                  orders.map(order => (
                    <div key={order.id} className="glass rounded-xl overflow-hidden">
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        {order.screenshot_url && (
                          <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer">
                            <img src={order.screenshot_url} alt="Proof" className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80" />
                          </a>
                        )}
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-foreground">{order.tracking_id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>{order.status.toUpperCase()}</span>
                            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{order.order_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {order.games?.name || order.order_type} • {order.game_packages?.label || ""} • Player: {order.player_id}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.created_at).toLocaleString()}</span>
                            {order.payment_methods?.name && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{order.payment_methods.name}</span>}
                            {order.transaction_id && <span className="flex items-center gap-1"><Receipt className="w-3 h-3" />TXN: {order.transaction_id}</span>}
                          </div>
                          <p className="text-sm font-semibold text-primary">NPR {order.total_price}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {order.status === "pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => completeOrder(order.id)} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-display font-bold">
                                <Check className="w-3 h-3" /> Complete
                              </button>
                              <button onClick={() => rejectOrder(order.id)} className="flex items-center gap-1 bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-xs font-display font-bold">
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs font-display font-bold px-3 py-1.5 rounded-full ${statusColor(order.status)}`}>
                              {order.status === "completed" ? "✅ Completed" : "❌ Rejected"}
                            </span>
                          )}
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="text-xs text-primary flex items-center gap-1 self-start"
                          >
                            <Eye className="w-3 h-3" /> {expandedOrder === order.id ? "Hide" : "Details"}
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                            <div className="p-4 space-y-3 bg-muted/20">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Order Details</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="text-muted-foreground">Order ID:</span><p className="text-foreground font-mono">{order.id}</p></div>
                                <div><span className="text-muted-foreground">User ID:</span><p className="text-foreground font-mono truncate">{order.user_id}</p></div>
                                <div><span className="text-muted-foreground">Player ID:</span><p className="text-foreground">{order.player_id}</p></div>
                                <div><span className="text-muted-foreground">Player Name:</span><p className="text-foreground">{order.player_name || "—"}</p></div>
                                <div><span className="text-muted-foreground">Payment:</span><p className="text-foreground">{order.payment_methods?.name || "—"}</p></div>
                                <div><span className="text-muted-foreground">Transaction:</span><p className="text-foreground">{order.transaction_id || "—"}</p></div>
                                <div><span className="text-muted-foreground">Amount:</span><p className="text-primary font-bold">NPR {order.total_price}</p></div>
                                <div><span className="text-muted-foreground">Date:</span><p className="text-foreground">{new Date(order.created_at).toLocaleString()}</p></div>
                              </div>
                              {order.screenshot_url && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Payment Screenshot:</p>
                                  <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer">
                                    <img src={order.screenshot_url} alt="Full screenshot" className="max-w-xs rounded-xl border border-border" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ═══════════ GAMES TAB ═══════════ */}
            {tab === "games" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setShowGameForm(!showGameForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                    <Plus className="w-4 h-4" /> Add Game
                  </button>
                </div>
                {showGameForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Game Name" value={gameForm.name} onChange={e => setGameForm({ ...gameForm, name: e.target.value })} className={inputCls} />
                    <input placeholder="Slug (e.g. free-fire)" value={gameForm.slug} onChange={e => setGameForm({ ...gameForm, slug: e.target.value })} className={inputCls} />
                    <input placeholder="Currency (e.g. Diamonds)" value={gameForm.currency} onChange={e => setGameForm({ ...gameForm, currency: e.target.value })} className={inputCls} />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Game Image (upload locally or paste URL)</label>
                      <input type="file" accept="image/*" onChange={e => setGameImageFile(e.target.files?.[0] || null)} className="text-sm text-foreground mb-2" />
                      <input placeholder="Or paste image URL" value={gameForm.imageUrl} onChange={e => setGameForm({ ...gameForm, imageUrl: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={addGame} disabled={gameUploading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold disabled:opacity-50">
                      {gameUploading ? "Uploading..." : "Save Game"}
                    </button>
                  </div>
                )}
                {games.map(game => (
                  <div key={game.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {game.image && <img src={game.image} alt={game.name} className="w-14 h-8 rounded object-cover" />}
                        <div>
                          <h3 className="font-display text-sm font-bold text-foreground">{game.name}</h3>
                          <p className="text-xs text-muted-foreground">{game.currency} • /{game.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowJsonImport(showJsonImport === game.id ? null : game.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1">
                          <FileJson className="w-3 h-3" /> Import JSON
                        </button>
                        <button onClick={() => deleteItem("games", game.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {showJsonImport === game.id && (
                      <div className="mb-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Paste JSON array: <code className="text-primary">[{"{"}"label":"100 Diamonds","amount":100,"price":50,"emoji":"💎",...{"}"}]</code></p>
                        <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} rows={4}
                          className="w-full bg-muted rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:ring-1 focus:ring-primary" placeholder='[{"label":"...","amount":100,"price":50,"emoji":"💎"}]' />
                        <button onClick={() => importJsonPackages(game.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold">Import</button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {game.game_packages?.map((pkg: any) => (
                        <div key={pkg.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
                          <span className="text-foreground">{pkg.emoji || "💎"} {pkg.label} — NPR {pkg.price}</span>
                          <button onClick={() => deleteItem("game_packages", pkg.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {pkgForm?.gameId === game.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <input placeholder="Emoji" value={pkgForm.emoji} onChange={e => setPkgForm({ ...pkgForm, emoji: e.target.value })}
                              className="w-16 bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Label" value={pkgForm.label} onChange={e => setPkgForm({ ...pkgForm, label: e.target.value })}
                              className="flex-1 min-w-[100px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Amount" type="number" value={pkgForm.amount} onChange={e => setPkgForm({ ...pkgForm, amount: e.target.value })}
                              className="w-24 bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Price" type="number" value={pkgForm.price} onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })}
                              className="w-24 bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                              <input type="checkbox" checked={pkgForm.popular} onChange={e => setPkgForm({ ...pkgForm, popular: e.target.checked })} />
                              Popular
                            </label>
                            <button onClick={addPackage} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">Add</button>
                            <button onClick={() => setPkgForm(null)} className="text-muted-foreground text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPkgForm({ gameId: game.id, amount: "", price: "", label: "", emoji: "💎", popular: false })}
                          className="text-primary text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Package</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ OTT TAB ═══════════ */}
            {tab === "ott" && (
              <div className="space-y-4">
                <button onClick={() => setShowOttForm(!showOttForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add OTT Platform
                </button>
                {showOttForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Platform Name (e.g. Netflix)" value={ottForm.name} onChange={e => setOttForm({ ...ottForm, name: e.target.value })} className={inputCls} />
                    <input placeholder="Slug (e.g. netflix)" value={ottForm.slug} onChange={e => setOttForm({ ...ottForm, slug: e.target.value })} className={inputCls} />
                    <input placeholder="Description" value={ottForm.description} onChange={e => setOttForm({ ...ottForm, description: e.target.value })} className={inputCls} />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Platform Image (local upload)</label>
                      <input type="file" accept="image/*" onChange={e => setOttImageFile(e.target.files?.[0] || null)} className="text-sm text-foreground mb-2" />
                      <input placeholder="Or paste image URL" value={ottForm.imageUrl} onChange={e => setOttForm({ ...ottForm, imageUrl: e.target.value })} className={inputCls} />
                    </div>
                    <select value={ottForm.color} onChange={e => setOttForm({ ...ottForm, color: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                      <option value="from-purple-500 to-pink-600">Purple → Pink</option>
                      <option value="from-red-600 to-orange-500">Red → Orange (Netflix)</option>
                      <option value="from-blue-600 to-cyan-500">Blue → Cyan (Disney)</option>
                      <option value="from-green-500 to-teal-600">Green → Teal (Prime)</option>
                      <option value="from-yellow-500 to-orange-600">Yellow → Orange</option>
                    </select>
                    <button onClick={addOttPlatform} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                  </div>
                )}
                {ottPlatforms.map(plat => (
                  <div key={plat.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {plat.image && <img src={plat.image} alt={plat.name} className="w-12 h-8 rounded object-cover" />}
                        <div>
                          <h3 className="font-display text-sm font-bold text-foreground">{plat.name}</h3>
                          <p className="text-xs text-muted-foreground">/{plat.slug} • {plat.description}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem("ott_platforms", plat.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {plat.ott_plans?.map((plan: any) => (
                        <div key={plan.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
                          <span className="text-foreground">{plan.emoji} {plan.label} ({plan.duration}) — NPR {plan.price}</span>
                          <button onClick={() => deleteItem("ott_plans", plan.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {ottPlanForm?.platformId === plat.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <input placeholder="Emoji" value={ottPlanForm.emoji} onChange={e => setOttPlanForm({ ...ottPlanForm, emoji: e.target.value })} className="w-16 bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Label" value={ottPlanForm.label} onChange={e => setOttPlanForm({ ...ottPlanForm, label: e.target.value })} className="flex-1 min-w-[100px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Duration" value={ottPlanForm.duration} onChange={e => setOttPlanForm({ ...ottPlanForm, duration: e.target.value })} className="flex-1 min-w-[80px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            <input placeholder="Price" type="number" value={ottPlanForm.price} onChange={e => setOttPlanForm({ ...ottPlanForm, price: e.target.value })} className="w-24 bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                              <input type="checkbox" checked={ottPlanForm.popular} onChange={e => setOttPlanForm({ ...ottPlanForm, popular: e.target.checked })} /> Popular
                            </label>
                            <button onClick={addOttPlan} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">Add</button>
                            <button onClick={() => setOttPlanForm(null)} className="text-muted-foreground text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setOttPlanForm({ platformId: plat.id, label: "", emoji: "📺", duration: "1 Month", price: "", popular: false })}
                          className="text-primary text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Plan</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ PAYMENTS TAB ═══════════ */}
            {tab === "payments" && (
              <div className="space-y-4">
                <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Payment Method
                </button>
                {showPaymentForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Payment Method Name" value={paymentForm.name} onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })} className={inputCls} />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Logo/Icon Image</label>
                      <input type="file" accept="image/*" onChange={e => setPaymentForm({ ...paymentForm, iconFile: e.target.files?.[0] || null })} className="text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">QR Code Image</label>
                      <input type="file" accept="image/*" onChange={e => setPaymentForm({ ...paymentForm, qrFile: e.target.files?.[0] || null })} className="text-sm text-foreground" />
                    </div>
                    <button onClick={addPaymentMethod} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                  </div>
                )}
                {paymentMethods.map(pm => (
                  <div key={pm.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    {pm.icon_url && <img src={pm.icon_url} alt={pm.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground">{pm.name}</h3>
                      {pm.qr_image_url && <a href={pm.qr_image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">View QR</a>}
                    </div>
                    <button onClick={() => deleteItem("payment_methods", pm.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ PROMOS TAB ═══════════ */}
            {tab === "promos" && (
              <div className="space-y-4">
                <button onClick={() => setShowPromoForm(!showPromoForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Promo Code
                </button>
                {showPromoForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Promo Code" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} className={inputCls} />
                    <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value as any })} className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                      <option value="discount">Percentage Discount</option>
                      <option value="bonus">Bonus % Currency</option>
                    </select>
                    <input placeholder="Value (%)" type="number" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} className={inputCls} />
                    <button onClick={addPromo} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                  </div>
                )}
                {promos.map(promo => (
                  <div key={promo.id} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="font-display text-sm font-bold text-primary">{promo.code}</span>
                      <p className="text-xs text-muted-foreground">{promo.type === "discount" ? `${promo.value}% off` : `${promo.value}% bonus`}</p>
                    </div>
                    <button onClick={() => deleteItem("promo_codes", promo.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ BANNERS TAB ═══════════ */}
            {tab === "banners" && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">💡 Use <strong className="text-foreground">16:9 images</strong> for best display. 4K (3840×2160) recommended.</p>
                </div>
                <button onClick={() => setShowBannerForm(!showBannerForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Banner
                </button>
                {showBannerForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Title (optional)" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className={inputCls} />
                    <input placeholder="Subtitle (optional)" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className={inputCls} />
                    <input placeholder="Display Order (0, 1, 2...)" type="number" value={bannerForm.displayOrder} onChange={e => setBannerForm({ ...bannerForm, displayOrder: e.target.value })} className={inputCls} />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Banner Image (16:9, 4K recommended)</label>
                      <input type="file" accept="image/*" onChange={e => setBannerForm({ ...bannerForm, imageFile: e.target.files?.[0] || null })} className="text-sm text-foreground" />
                    </div>
                    <button onClick={addBanner} disabled={bannerUploading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold disabled:opacity-50">
                      {bannerUploading ? "Uploading..." : "Save Banner"}
                    </button>
                  </div>
                )}
                {banners.map(banner => (
                  <div key={banner.id} className="glass rounded-xl overflow-hidden">
                    <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full aspect-video object-cover" />
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        {banner.title && <p className="font-display text-sm font-bold text-foreground">{banner.title}</p>}
                        <span className="text-xs text-muted-foreground">Order: {banner.display_order}</span>
                      </div>
                      <button onClick={() => deleteItem("hero_banners", banner.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ USERS TAB ═══════════ */}
            {tab === "users" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{users.length} registered users</p>
                {users.map(profile => {
                  const isExpanded = expandedUser === profile.user_id;
                  const profileOrders = userOrders[profile.user_id] || [];
                  return (
                    <div key={profile.id} className="glass rounded-xl overflow-hidden">
                      <button onClick={() => loadUserOrders(profile.user_id)} className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm font-bold text-foreground truncate">{profile.display_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{profile.user_id}</p>
                          <p className="text-xs text-muted-foreground/60">{new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {orders.filter(o => o.user_id === profile.user_id).length} orders
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order History</p>
                          {profileOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No orders.</p>
                          ) : profileOrders.map(order => (
                            <div key={order.id} className="bg-muted/50 rounded-lg px-3 py-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-display font-bold text-foreground">{order.tracking_id}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{order.games?.name || order.order_type} • {order.game_packages?.label || ""}</p>
                              <div className="flex justify-between text-xs">
                                <span className="text-primary font-bold">NPR {order.total_price}</span>
                                {order.payment_methods?.name && <span className="text-muted-foreground">{order.payment_methods.name}</span>}
                              </div>
                              {order.transaction_id && <p className="text-xs text-muted-foreground">TXN: {order.transaction_id}</p>}
                              {order.screenshot_url && (
                                <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                                  <Camera className="w-3 h-3" /> View Screenshot
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ═══════════ SOCIAL TAB ═══════════ */}
            {tab === "social" && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 space-y-3">
                  <h3 className="font-display text-sm font-bold text-foreground">Post to Social Media</h3>
                  <p className="text-xs text-muted-foreground">Share announcements or promotions</p>
                  {["TikTok", "Instagram", "WhatsApp"].map(platform => (
                    <button key={platform} onClick={() => shareToSocial(platform, `🎮 SudurTopup — Best game top-up platform! Visit us at sudurtopup.lovable.app`)}
                      className="w-full flex items-center gap-3 bg-muted rounded-lg px-4 py-3 hover:bg-muted/80 transition-colors text-left">
                      <Share2 className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Share on {platform}</p>
                        <p className="text-xs text-muted-foreground">Opens {platform} with a promo message</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-foreground">Social Profile Links</h3>
                    <button onClick={() => setShowSocialForm(!showSocialForm)} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  {showSocialForm && (
                    <div className="glass rounded-xl p-4 space-y-3">
                      <select value={socialForm.platform} onChange={e => setSocialForm({ ...socialForm, platform: e.target.value })} className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                        <option>TikTok</option>
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>YouTube</option>
                        <option>WhatsApp</option>
                        <option>Telegram</option>
                      </select>
                      <input placeholder="Profile URL" value={socialForm.url} onChange={e => setSocialForm({ ...socialForm, url: e.target.value })} className={inputCls} />
                      <input placeholder="Label (optional)" value={socialForm.label} onChange={e => setSocialForm({ ...socialForm, label: e.target.value })} className={inputCls} />
                      <button onClick={addSocialProfile} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                    </div>
                  )}
                  {socialProfiles.map(sp => (
                    <div key={sp.id} className="glass rounded-xl p-4 flex items-center gap-3">
                      <Link2 className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{sp.platform}</p>
                        <a href={sp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary truncate block hover:underline">{sp.url}</a>
                        {sp.label && <p className="text-xs text-muted-foreground">{sp.label}</p>}
                      </div>
                      <button onClick={() => deleteItem("social_profiles", sp.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════ REWARDS TAB ═══════════ */}
            {tab === "rewards" && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">💡 Users earn 1 XP per NPR 10 spent. Add rewards here that they can redeem.</p>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground">Rewards List</h3>
                  <button onClick={() => setShowRewardForm(!showRewardForm)} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
                    <Plus className="w-3 h-3" /> Add Reward
                  </button>
                </div>
                {showRewardForm && (
                  <div className="glass rounded-xl p-4 space-y-3">
                    <input placeholder="Reward Title (e.g. 5% Discount Coupon)" value={rewardForm.title} onChange={e => setRewardForm({ ...rewardForm, title: e.target.value })} className={inputCls} />
                    <input placeholder="Description" value={rewardForm.description} onChange={e => setRewardForm({ ...rewardForm, description: e.target.value })} className={inputCls} />
                    <input placeholder="XP Cost (e.g. 100)" type="number" value={rewardForm.xpCost} onChange={e => setRewardForm({ ...rewardForm, xpCost: e.target.value })} className={inputCls} />
                    <button onClick={addReward} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                  </div>
                )}
                {rewardsList.map(r => (
                  <div key={r.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    <Star className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold text-foreground">{r.title}</p>
                      {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      <p className="text-xs text-primary font-bold mt-1">{r.xp_cost} XP</p>
                    </div>
                    <button onClick={() => deleteItem("rewards", r.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════ TICKETS TAB ═══════════ */}
            {tab === "tickets" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{tickets.length} support tickets</p>
                {tickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No support tickets yet.</p>
                ) : tickets.map(ticket => (
                  <div key={ticket.id} className="glass rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${ticket.status === "open" ? "text-destructive" : "text-primary"}`} />
                        <span className="font-display text-sm font-bold text-foreground">{ticket.subject}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === "open" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    {ticket.order_id && <p className="text-xs text-muted-foreground">Order: {ticket.order_id}</p>}
                    <p className="text-sm text-foreground">{ticket.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</p>
                      <div className="flex gap-2">
                        {ticket.status === "open" && (
                          <button onClick={async () => { await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", ticket.id); loadData(); }}
                            className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg font-medium">
                            Mark Resolved
                          </button>
                        )}
                        <button onClick={() => deleteItem("support_tickets", ticket.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
