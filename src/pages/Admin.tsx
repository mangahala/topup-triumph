import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Package, Settings, Ticket, CreditCard, Bell, BellOff, Eye, Check, X, Plus, Trash2, Upload, Gamepad2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<"orders" | "games" | "payments" | "promos" | "steam">("orders");
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [steamAccounts, setSteamAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", slug: "", currency: "Diamonds", image: "", color: "from-orange-500 to-red-600" });
  const [pkgForm, setPkgForm] = useState<{ gameId: string; amount: string; price: string; label: string; popular: boolean } | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: "", iconFile: null as File | null, qrFile: null as File | null });

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", type: "discount" as "discount" | "bonus", value: "" });

  const [showSteamForm, setShowSteamForm] = useState(false);
  const [steamForm, setSteamForm] = useState({ title: "", description: "", price: "", details: "", imageFile: null as File | null });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) return;
    loadData();
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    const [o, g, pm, pc, sa] = await Promise.all([
      supabase.from("orders").select("*, games(name), game_packages(label), promo_codes(code, type, value)").order("created_at", { ascending: false }),
      supabase.from("games").select("*, game_packages(*)").order("created_at", { ascending: false }),
      supabase.from("payment_methods").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("steam_accounts").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setGames(g.data || []);
    setPaymentMethods(pm.data || []);
    setPromos(pc.data || []);
    setSteamAccounts(sa.data || []);
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
    let imageUrl = gameForm.image;
    const { error } = await supabase.from("games").insert({ name: gameForm.name, slug: gameForm.slug, currency: gameForm.currency, image: imageUrl, color: gameForm.color });
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

  const addSteamAccount = async () => {
    if (!steamForm.title || !steamForm.price) return;
    let imageUrl = null;
    try {
      if (steamForm.imageFile) imageUrl = await uploadToImgBB(steamForm.imageFile);
    } catch (err: any) { toast({ title: "Upload error", description: err.message, variant: "destructive" }); return; }
    const { error } = await supabase.from("steam_accounts").insert({
      title: steamForm.title, description: steamForm.description, price: parseFloat(steamForm.price), details: steamForm.details, image_url: imageUrl
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowSteamForm(false);
    setSteamForm({ title: "", description: "", price: "", details: "", imageFile: null });
    loadData();
  };

  const deleteItem = async (table: "games" | "game_packages" | "payment_methods" | "promo_codes" | "steam_accounts", id: string) => {
    await supabase.from(table).delete().eq("id", id);
    loadData();
  };

  const tabs = [
    { key: "orders" as const, label: "Orders", icon: Package },
    { key: "games" as const, label: "Games", icon: Gamepad2 },
    { key: "payments" as const, label: "Payments", icon: CreditCard },
    { key: "promos" as const, label: "Promos", icon: Ticket },
    { key: "steam" as const, label: "Steam", icon: Gift },
  ];

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
                    <input placeholder="Game Name" value={gameForm.name} onChange={e => setGameForm({ ...gameForm, name: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input placeholder="Slug (e.g. free-fire)" value={gameForm.slug} onChange={e => setGameForm({ ...gameForm, slug: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input placeholder="Currency (e.g. Diamonds)" value={gameForm.currency} onChange={e => setGameForm({ ...gameForm, currency: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input placeholder="Image URL" value={gameForm.image} onChange={e => setGameForm({ ...gameForm, image: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
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
                    <input placeholder="Payment Method Name" value={paymentForm.name} onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
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
                    <input placeholder="Promo Code" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value as any })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                      <option value="discount">Percentage Discount</option>
                      <option value="bonus">Bonus % Currency</option>
                    </select>
                    <input placeholder="Value (%)" type="number" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
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

            {/* STEAM TAB */}
            {tab === "steam" && (
              <div className="space-y-4">
                <button onClick={() => setShowSteamForm(!showSteamForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-display font-bold">
                  <Plus className="w-4 h-4" /> Add Steam Account
                </button>
                {showSteamForm && (
                  <div className="glass rounded-xl p-5 space-y-3">
                    <input placeholder="Title" value={steamForm.title} onChange={e => setSteamForm({ ...steamForm, title: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input placeholder="Description" value={steamForm.description} onChange={e => setSteamForm({ ...steamForm, description: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input placeholder="Price (NPR)" type="number" value={steamForm.price} onChange={e => setSteamForm({ ...steamForm, price: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <textarea placeholder="Account Details (private, shown after purchase)" value={steamForm.details} onChange={e => setSteamForm({ ...steamForm, details: e.target.value })}
                      className="w-full bg-muted rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary min-h-[80px]" />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Account Image</label>
                      <input type="file" accept="image/*" onChange={e => setSteamForm({ ...steamForm, imageFile: e.target.files?.[0] || null })} className="text-sm text-foreground" />
                    </div>
                    <button onClick={addSteamAccount} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-display font-bold">Save</button>
                  </div>
                )}
                {steamAccounts.map(sa => (
                  <div key={sa.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    {sa.image_url && <img src={sa.image_url} alt={sa.title} className="w-16 h-16 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground">{sa.title}</h3>
                      <p className="text-xs text-muted-foreground">NPR {sa.price} • {sa.status}</p>
                    </div>
                    <button onClick={() => deleteItem("steam_accounts", sa.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
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
