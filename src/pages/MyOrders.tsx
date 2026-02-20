import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle, XCircle, Upload, MessageSquare, Camera, X, Star } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { uploadToImgBB } from "@/lib/imgbb";

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofs, setProofs] = useState<any[]>([]);
  const [showTicket, setShowTicket] = useState<string | null>(null);
  const [showProofUpload, setShowProofUpload] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("orders").select("*, games(name), game_packages(label)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("order_proofs").select("*").eq("user_id", user.id),
    ]).then(([o, p]) => {
      setOrders(o.data || []);
      setProofs(p.data || []);
      setLoading(false);
    });
  }, [user]);

  const submitTicket = async (orderId: string, trackingId: string) => {
    if (!user || !ticketMessage) return;
    setSubmitting(true);
    try {
      await supabase.from("support_tickets").insert({
        user_id: user.id,
        order_id: trackingId,
        subject: ticketSubject || `Issue with order ${trackingId}`,
        message: ticketMessage,
      });
      toast({ title: "Ticket submitted!", description: "Our team will review it shortly." });
      setShowTicket(null);
      setTicketSubject("");
      setTicketMessage("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const submitProof = async (order: any) => {
    if (!user || !proofFile) return;
    setSubmitting(true);
    try {
      const proofUrl = await uploadToImgBB(proofFile);
      await supabase.from("order_proofs").insert({
        user_id: user.id,
        order_tracking_id: order.tracking_id,
        proof_url: proofUrl,
        game_name: order.games?.name || order.order_type || "",
        visible: true,
      });
      toast({ title: "Proof uploaded!", description: "Your proof is now visible to the community." });
      setShowProofUpload(null);
      setProofFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

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

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-primary" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />
      <div className="w-full px-4 py-6 max-w-2xl mx-auto">
        <h1 className="font-display text-xl font-bold text-foreground mb-1">My Orders</h1>
        <p className="text-muted-foreground text-xs mb-5">Track and manage your purchases</p>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const hasProof = proofs.some(p => p.order_tracking_id === order.tracking_id);
              return (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {statusIcon(order.status)}
                        <span className="font-display text-sm font-bold text-primary">{order.tracking_id}</span>
                      </div>
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
                      {order.order_type === "ott" && <>OTT Plan</>}
                      {order.order_type === "giftcard" && <>Gift Card</>}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">NPR {order.total_price}</span>
                      <span className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleString()}</span>
                    </div>

                    {order.status === "pending" && (
                      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        ⏳ Please wait <strong className="text-foreground">30–40 minutes</strong>. If not received, upload proof and make a ticket below.
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setShowTicket(showTicket === order.id ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs bg-muted text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Support Ticket
                      </button>
                      {order.status === "completed" && !hasProof && (
                        <button
                          onClick={() => setShowProofUpload(showProofUpload === order.id ? null : order.id)}
                          className="flex items-center gap-1.5 text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30"
                        >
                          <Camera className="w-3.5 h-3.5" /> Upload Proof
                        </button>
                      )}
                      {hasProof && (
                        <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                          <Star className="w-3.5 h-3.5" /> Proof Shared
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Support Ticket Form */}
                  <AnimatePresence>
                    {showTicket === order.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                        <div className="p-4 space-y-3 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submit Support Ticket</p>
                            <button onClick={() => setShowTicket(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                          </div>
                          <input placeholder="Subject (optional)" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
                            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                          <textarea rows={3} placeholder="Describe your issue..." value={ticketMessage} onChange={e => setTicketMessage(e.target.value)}
                            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
                          <button disabled={!ticketMessage || submitting} onClick={() => submitTicket(order.id, order.tracking_id)}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-display font-bold disabled:opacity-40">
                            {submitting ? "Submitting..." : "Submit Ticket"}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Proof Upload */}
                    {showProofUpload === order.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                        <div className="p-4 space-y-3 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Share Purchase Proof</p>
                            <button onClick={() => setShowProofUpload(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                          </div>
                          <p className="text-xs text-muted-foreground">Your proof will be visible to other users as social proof of successful top-up.</p>
                          <label className="flex flex-col items-center border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:border-primary/50">
                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">{proofFile ? proofFile.name : "Click to upload screenshot"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                          </label>
                          <button disabled={!proofFile || submitting} onClick={() => submitProof(order)}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-display font-bold disabled:opacity-40">
                            {submitting ? "Uploading..." : "Share Proof"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
