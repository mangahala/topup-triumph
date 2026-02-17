import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SteamAccount {
  id: string;
  title: string;
  description: string | null;
  price: number;
  details: string | null;
  image_url: string | null;
  status: string;
}

const SteamStore = () => {
  const [accounts, setAccounts] = useState<SteamAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("steam_accounts").select("*").eq("status", "available")
      .then(({ data }) => { setAccounts(data || []); setLoading(false); });
  }, []);

  const handleBuy = async (account: SteamAccount) => {
    if (!user) { navigate("/auth"); return; }
    if (!whatsapp.trim()) { toast({ title: "Enter WhatsApp number", variant: "destructive" }); return; }

    const trackingId = "GT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("orders").insert({
      tracking_id: trackingId,
      user_id: user.id,
      player_id: whatsapp,
      player_name: account.title,
      total_price: account.price,
      order_type: "steam",
      status: "pending",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Mark account as reserved
    await supabase.from("steam_accounts").update({ status: "reserved" }).eq("id", account.id);

    toast({ title: "Order placed!", description: `Tracking ID: ${trackingId}` });
    setBuying(null);
    setAccounts(prev => prev.filter(a => a.id !== account.id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Steam <span className="text-primary">Accounts</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Browse and purchase Steam accounts</p>

        {loading ? (
          <p className="text-muted-foreground text-center py-16">Loading...</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No accounts available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, i) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl overflow-hidden"
              >
                {account.image_url && (
                  <img src={account.image_url} alt={account.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-display text-lg font-bold text-foreground">{account.title}</h3>
                  {account.description && <p className="text-sm text-muted-foreground">{account.description}</p>}
                  <p className="font-display text-xl font-bold text-primary">NPR {account.price}</p>

                  {buying === account.id ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          placeholder="Your WhatsApp number"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full bg-muted rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setBuying(null)} className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-display font-bold">Cancel</button>
                        <button onClick={() => handleBuy(account)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-display font-bold">Confirm</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { if (!user) navigate("/auth"); else setBuying(account.id); }}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm"
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SteamStore;
