import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Package, Settings, Ticket, CreditCard, Bell, BellOff,
  Eye, Check, X, Plus, Trash2, Upload, Gamepad2, Gift, Users, Image, ChevronDown, ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<"orders" | "games" | "payments" | "promos" | "banners" | "users">("orders");
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Form states
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", slug: "", currency: "Diamonds", image: "", color: "from-orange-500 to-red-600" });
  const [pkgForm, setPkgForm] = useState<{ gameId: string; amount: string; price: string; label: string; popular: boolean } | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: "", iconFile: null as File | null, qrFile: null as File | null });

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", type: "discount" as "discount" | "bonus", value: "" });

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", imageFile: null as File | null, displayOrder: "0" });
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) return;
    loadData();
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    const [o, g, pm, pc, b, p] = await Promise.all([
      supabase.from("orders").select("*, games(name), game_packages(label), promo_codes(code, type, value)").order("created_at", { ascending: false }),
      supabase.from("games").select("*, game_packages(*)").order("created_at", { ascending: false }),
      supabase.from("payment_methods").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("hero_banners").select("*").order("display_order", { ascending: true }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setGames(g.data || []);
    setPaymentMethods(pm.data || []);
    setPromos(pc.data || []);
    setBanners(b.data || []);
    setUsers(p.data || []);
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

  const completeOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "completed" } : o));
    if (whatsappToggle) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const msg = encodeURIComponent(`✅ Your ${order.games?.name || ""} top-up (${order.game_packages?.label || order.order_type}) has been completed! Order: ${order.tracking_id}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      }
    }
  };

  const rejectOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "rejected" }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "rejected" } : o));
  };

  const addGame = async () => {
    if (!gameForm.name || !gameForm.slug) return;
    const { error } = await supabase.from("games").insert({ name: gameForm.name, slug: gameForm.slug, currency: gameForm.currency, image: gameForm.image, color: gameForm.color });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowGameForm(false);
    setGameForm({ name: "", slug: "", currency: "Diamonds", image: "", color: "from-orange-500 to-red-600" });
    loadData();
  };

  const addPackage = async () => {
    if (!pkgForm) return;
    const { error } = await supabase.from("game_packages").insert({
      game_id: pkgForm.gameId, amount: parseInt(pkgForm.amount), price: parseFloat(pkgForm.price), label: pkgForm.label, popular: pkgForm.popular
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPkgForm(null);
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
      const { error } = await supabase.from("hero_banners").insert({
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        image_url: imageUrl,
        display_order: parseInt(bannerForm.displayOrder) || 0,
        active: true,
      });
      if (error) throw error;
      setShowBannerForm(false);
      setBannerForm({ title: "", subtitle: "", imageFile: null, displayOrder: "0" });
      toast({ title: "Banner added!" });
      loadData();
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("hero_banners").delete().eq("id", id);
    loadData();
  };

  const deleteItem = async (table: "games" | "game_packages" | "payment_methods" | "promo_codes", id: string) => {
    await supabase.from(table).delete().eq("id", id);
    loadData();
  };

  const loadUserOrders = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (userOrders[userId]) return; // already loaded
    const { data } = await supabase
      .from("orders")
      .select("*, games(name), game_packages(label)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setUserOrders(prev => ({ ...prev, [userId]: data || [] }));
  };

  const tabs = [
    { key: "orders" as const, label: "Orders", icon: Package },
    { key: "games" as const, label: "Games", icon: Gamepad2 },
    { key: "payments" as const, label: "Payments", icon: CreditCard },
    { key: "promos" as const, label: "Promos", icon: Ticket },
    { key: "banners" as const, label: "Banners", icon: Image },
    { key: "users" as const, label: "Users", icon: Users },
  ];

  const inputCls = "w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-strong border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {whatsappToggle ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            <button onClick={() => setWhatsappToggle(!whatsappToggle)}
              className={`relative w-10 h-5 rounded-full transition-colors ${whatsappToggle ? "bg-primary" : "bg-muted"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${whatsappToggle ? "left-5" : "left-0.5"}`} />
            </button>
            <span className="text-muted-foreground text-xs hidden sm:block">WhatsApp</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : (
          <>
            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? <p className="text-muted-foreground text-center py-8">No orders yet.</p> :
                  orders.map(order => (
                    <div key={order.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      {order.screenshot_url && (
                        <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <img src={order.screenshot_url} alt="Payment proof" className="w-16 h-16 rounded-lg object-cover cursor-pointer" />
                        </a>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-sm font-bold text-foreground">{order.tracking_id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{order.order_type}</span>
                          {order.promo_codes && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.promo_codes.type === "bonus" ? "bg-primary/20 text-primary" : "bg-info/20 text-foreground"}`}>
                              {order.promo_codes.type === "bonus" ? `+${order.promo_codes.value}% BONUS` : `${order.promo_codes.value}% OFF`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{order.games?.name || order.order_type} • {order.game_packages?.label || ""} • Player: {order.player_id}</p>
                        <p className="text-sm font-semibold text-primary">NPR {order.total_price}</p>
                      </div>
                      <div>
                        {order.status === "pending" ? (
                          <div className="flex gap-2">
                            <button onClick={() => completeOrder(order.id)}
                              className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-display font-bold">
                              <Check className="w-3 h-3" /> Complete
                            </button>
                            <button onClick={() => rejectOrder(order.id)}
                              className="flex items-center gap-1 bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-xs font-display font-bold">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-display font-bold px-3 py-1.5 rounded-full ${order.status === "completed" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}>
                            {order.status === "completed" ? "✅ Completed" : "❌ Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* GAMES TAB */}
            {tab === "games" && (
              <div className="space-y-4">
                <button onClick={() => setShowGameForm(!showGameForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Game
                </button>
                {showGameForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Game Name" value={gameForm.name} onChange={e => setGameForm({ ...gameForm, name: e.target.value })} className={inputCls} />
                    <input placeholder="Slug (e.g. free-fire)" value={gameForm.slug} onChange={e => setGameForm({ ...gameForm, slug: e.target.value })} className={inputCls} />
                    <input placeholder="Currency (e.g. Diamonds)" value={gameForm.currency} onChange={e => setGameForm({ ...gameForm, currency: e.target.value })} className={inputCls} />
                    <input placeholder="Image URL" value={gameForm.image} onChange={e => setGameForm({ ...gameForm, image: e.target.value })} className={inputCls} />
                    <button onClick={addGame} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save Game</button>
                  </div>
                )}
                {games.map(game => (
                  <div key={game.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {game.image && <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <h3 className="font-display text-sm font-bold text-foreground">{game.name}</h3>
                          <p className="text-xs text-muted-foreground">{game.currency} • /{game.slug}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem("games", game.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {game.game_packages?.map((pkg: any) => (
                        <div key={pkg.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
                          <span className="text-foreground">{pkg.label} - NPR {pkg.price}</span>
                          <button onClick={() => deleteItem("game_packages", pkg.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {pkgForm?.gameId === game.id ? (
                        <div className="flex gap-2 flex-wrap">
                          <input placeholder="Amount" value={pkgForm.amount} onChange={e => setPkgForm({ ...pkgForm, amount: e.target.value })}
                            className="flex-1 min-w-[80px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                          <input placeholder="Price" value={pkgForm.price} onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })}
                            className="flex-1 min-w-[80px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                          <input placeholder="Label" value={pkgForm.label} onChange={e => setPkgForm({ ...pkgForm, label: e.target.value })}
                            className="flex-1 min-w-[80px] bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                          <button onClick={addPackage} className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-bold">Add</button>
                        </div>
                      ) : (
                        <button onClick={() => setPkgForm({ gameId: game.id, amount: "", price: "", label: "", popular: false })}
                          className="text-primary text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Package</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAYMENTS TAB */}
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
                      {pm.qr_image_url && <a href={pm.qr_image_url} target="_blank" className="text-xs text-primary">View QR</a>}
                    </div>
                    <button onClick={() => deleteItem("payment_methods", pm.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* PROMOS TAB */}
            {tab === "promos" && (
              <div className="space-y-4">
                <button onClick={() => setShowPromoForm(!showPromoForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Promo Code
                </button>
                {showPromoForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Promo Code" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} className={inputCls} />
                    <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value as any })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
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
                      <p className="text-xs text-muted-foreground">{promo.type === "discount" ? `${promo.value}% off` : `${promo.value}% bonus`} • {promo.active ? "Active" : "Inactive"}</p>
                    </div>
                    <button onClick={() => deleteItem("promo_codes", promo.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* BANNERS TAB */}
            {tab === "banners" && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">💡 Upload your own hero slider images. For best quality, use <strong className="text-foreground">4K images (3840×2160)</strong> in landscape format.</p>
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
                      <label className="text-xs text-muted-foreground mb-1 block">Banner Image (recommended: 4K landscape)</label>
                      <input type="file" accept="image/*" onChange={e => setBannerForm({ ...bannerForm, imageFile: e.target.files?.[0] || null })} className="text-sm text-foreground" />
                    </div>
                    <button onClick={addBanner} disabled={bannerUploading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold disabled:opacity-50 flex items-center gap-2">
                      {bannerUploading ? <><Upload className="w-4 h-4 animate-bounce" /> Uploading...</> : "Save Banner"}
                    </button>
                  </div>
                )}
                {banners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No banners yet. Add your first featured image above.</p>
                ) : (
                  banners.map(banner => (
                    <div key={banner.id} className="glass rounded-xl overflow-hidden">
                      <div className="relative">
                        <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-3">
                          <div className="flex-1">
                            {banner.title && <p className="font-display text-sm font-bold text-foreground">{banner.title}</p>}
                            {banner.subtitle && <p className="text-xs text-muted-foreground">{banner.subtitle}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-muted-foreground">Order: {banner.display_order} • {banner.active ? "Active" : "Inactive"}</span>
                        <button onClick={() => deleteBanner(banner.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* USERS TAB */}
            {tab === "users" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users yet.</p>
                ) : (
                  users.map(profile => {
                    const isExpanded = expandedUser === profile.user_id;
                    const profileOrders = userOrders[profile.user_id] || [];
                    return (
                      <div key={profile.id} className="glass rounded-xl overflow-hidden">
                        <button
                          onClick={() => loadUserOrders(profile.user_id)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-bold text-foreground truncate">{profile.display_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile.whatsapp || "No WhatsApp"}</p>
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
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Order History</p>
                            {profileOrders.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No orders from this user.</p>
                            ) : (
                              profileOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                                  <div>
                                    <span className="text-xs font-display font-bold text-foreground">{order.tracking_id}</span>
                                    <p className="text-xs text-muted-foreground">{order.games?.name || order.order_type} • {order.game_packages?.label || ""}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-semibold text-primary">NPR {order.total_price}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      order.status === "completed" ? "bg-primary/20 text-primary" :
                                      order.status === "rejected" ? "bg-destructive/20 text-destructive" :
                                      "bg-muted text-muted-foreground"
                                    }`}>{order.status}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
