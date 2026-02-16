import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Package, Settings, Ticket, CreditCard, Bell, BellOff, Eye, Check, X } from "lucide-react";

// Mock orders
const mockOrders = [
  { id: "GT-A1B2C3", game: "Free Fire", playerId: "98765432", pkg: "520 💎", price: 580, status: "pending", promo: null, screenshot: "https://via.placeholder.com/100x100?text=SS" },
  { id: "GT-D4E5F6", game: "PUBG Mobile", playerId: "12345678", pkg: "660 UC", price: 899, status: "pending", promo: { type: "bonus", value: 20 }, screenshot: "https://via.placeholder.com/100x100?text=SS" },
  { id: "GT-G7H8I9", game: "Mobile Legends", playerId: "55555555", pkg: "257 💎", price: 387, status: "completed", promo: { type: "discount", value: 10 }, screenshot: "https://via.placeholder.com/100x100?text=SS" },
];

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"orders" | "games" | "payments" | "promos">("orders");
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [orders, setOrders] = useState(mockOrders);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-1">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter password to continue</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password && setAuthenticated(true)}
            className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary mb-4"
          />
          <button
            onClick={() => password && setAuthenticated(true)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm"
          >
            Login
          </button>
        </motion.div>
      </div>
    );
  }

  const completeOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o)));
    if (whatsappToggle) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const msg = encodeURIComponent(`✅ Your ${order.game} top-up (${order.pkg}) has been completed! Order: ${order.id}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      }
    }
  };

  const tabs = [
    { key: "orders" as const, label: "Orders", icon: Package },
    { key: "games" as const, label: "Games", icon: Settings },
    { key: "payments" as const, label: "Payments", icon: CreditCard },
    { key: "promos" as const, label: "Promos", icon: Ticket },
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
            <button
              onClick={() => setWhatsappToggle(!whatsappToggle)}
              className={`relative w-10 h-5 rounded-full transition-colors ${whatsappToggle ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${whatsappToggle ? "left-5.5 translate-x-0" : "left-0.5"}`} />
            </button>
            <span className="text-muted-foreground text-xs hidden sm:block">WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-4 py-6">
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <img src={order.screenshot} alt="Payment proof" className="w-16 h-16 rounded-lg object-cover cursor-pointer" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground">{order.id}</span>
                    {order.promo && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.promo.type === "bonus" ? "bg-primary/20 text-primary" : "bg-info/20 text-info"
                      }`}>
                        {order.promo.type === "bonus" ? `+${order.promo.value}% BONUS` : `${order.promo.value}% OFF`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{order.game} • {order.pkg} • Player: {order.playerId}</p>
                  <p className="text-sm font-semibold text-primary">NPR {order.price}</p>
                </div>
                <div>
                  {order.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-display font-bold"
                      >
                        <Check className="w-3 h-3" /> Complete
                      </button>
                      <button className="flex items-center gap-1 bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-xs font-display font-bold">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-display font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "games" && (
          <div className="glass rounded-xl p-6 text-center">
            <Settings className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Game & Package management will be available with backend integration.</p>
          </div>
        )}

        {tab === "payments" && (
          <div className="glass rounded-xl p-6 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Payment method & QR management will be available with backend integration.</p>
          </div>
        )}

        {tab === "promos" && (
          <div className="glass rounded-xl p-6 text-center">
            <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Promo code management will be available with backend integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
