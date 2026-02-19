import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  display_order: number;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("hero_banners").select("*").eq("active", true).order("display_order", { ascending: true })
      .then(({ data }) => { setSlides(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) return <div className="w-full aspect-video rounded-2xl bg-muted animate-pulse" />;

  if (slides.length === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center px-4">No featured banners yet — add some from the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img src={slides[current].image_url} alt={slides[current].title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          {(slides[current].title || slides[current].subtitle) && (
            <div className="absolute bottom-8 left-8">
              {slides[current].title && (
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground neon-text">{slides[current].title}</h2>
              )}
              {slides[current].subtitle && (
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">{slides[current].subtitle}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-full p-2 hover:bg-primary/20 transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-full p-2 hover:bg-primary/20 transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-muted-foreground/40 w-2"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
