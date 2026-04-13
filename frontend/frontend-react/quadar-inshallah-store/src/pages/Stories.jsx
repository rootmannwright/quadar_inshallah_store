/**
 * Stories.jsx — Quadar
 * Editorial page: brand stories, videos, lookbooks
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/stories.css";

// ─── Mock data — substitua pelos seus dados reais ─────────────────────────────

const FEATURED = {
  id: 1,
  tag: "BRAND FILM",
  title: "A Quadar Inshallah\nCo. & Records",
  subtitle: "SS 2026",
  description:
    "Entre o sagrado e o urbano, entre Guarulhos e o mundo — Quadar nasceu da convicção de que moda é intenção. Esta é a história da nossa primeira coleção.",
  videoSrc: null,           // substitua por URL real
  videoPoster: null,        // substitua por URL de thumbnail
  date: "ABRIL 2026",
};

const STORIES = [
  {
    id: 2,
    tag: "LOOKBOOK",
    title: "Desert Frequency",
    date: "MARÇO 2026",
    image: null,
    excerpt: "Texturas áridas, silhuetas amplas. A coleção encontra sua voz no vazio.",
  },
  {
    id: 3,
    tag: "PROCESSO",
    title: "Como fazemos cada peça",
    date: "FEVEREIRO 2026",
    image: null,
    excerpt: "Da matéria-prima ao caixote: transparência em cada etapa de produção.",
  },
  {
    id: 4,
    tag: "CULTURA",
    title: "Inshallah — mais que uma palavra",
    date: "JANEIRO 2026",
    image: null,
    excerpt: "A filosofia por trás do nome que carregamos em cada coleção.",
  },
  {
    id: 5,
    tag: "COLLAB",
    title: "DOM × KEVINTHECREEP × MF KHAOS",
    date: "DEZEMBRO 2025",
    image: null,
    excerpt: "Três vozes, uma frequência. O projeto musical que acompanha o lançamento.",
  },
];

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="s-video-wrap" onClick={toggle}>
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="s-video"
          playsInline
          onEnded={() => setPlaying(false)}
        />
      ) : (
        /* Placeholder quando não há vídeo ainda */
        <div className="s-video-placeholder">
          <div className="s-video-grain" />
          <div className="s-video-lines">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="s-video-line" />
            ))}
          </div>
          <span className="s-video-label">QUADAR · SS 2026</span>
        </div>
      )}

      <AnimatePresence>
        {!playing && (
          <motion.div
            className="s-play-btn"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StoryCard ────────────────────────────────────────────────────────────────

function StoryCard({ story, index }) {
  return (
    <motion.article
      className="s-card"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      {/* Image area */}
      <div className="s-card-img-wrap">
        {story.image ? (
          <img src={story.image} alt={story.title} className="s-card-img" />
        ) : (
          <div className="s-card-img-placeholder">
            <div className="s-placeholder-grain" />
            <span className="s-placeholder-index">
              {String(index + 2).padStart(2, "0")}
            </span>
          </div>
        )}
        <span className="s-card-tag">{story.tag}</span>
      </div>

      {/* Text */}
      <div className="s-card-body">
        <p className="s-card-date">{story.date}</p>
        <h3 className="s-card-title">{story.title}</h3>
        <p className="s-card-excerpt">{story.excerpt}</p>
        <button className="s-card-link">
          LER MAIS
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
            <path d="M2 8h12M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </motion.article>
  );
}

// ─── Stories (root) ───────────────────────────────────────────────────────────

export default function Stories() {
  return (
    <div className="s-page">

      {/* ── Page intro ── */}
      <motion.div
        className="s-intro"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="s-intro-eyebrow">QUADAR STORIES</span>
        <h1 className="s-intro-title">
          Cada peça<br />
          <em>tem uma história</em>
        </h1>
        <p className="s-intro-sub">
          Cultura, processo e intenção — o universo por trás da marca.
        </p>
        <div className="s-intro-rule" />
      </motion.div>

      {/* ── Featured story ── */}
      <section className="s-featured">
        <div className="s-featured-meta">
          <motion.span
            className="s-featured-tag"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {FEATURED.tag}
          </motion.span>
          <motion.span
            className="s-featured-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {FEATURED.date}
          </motion.span>
        </div>

        <div className="s-featured-body">
          {/* Left: text */}
          <motion.div
            className="s-featured-text"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            <p className="s-featured-subtitle">{FEATURED.subtitle}</p>
            <h2 className="s-featured-title">
              {FEATURED.title.split("\n").map((line, i) => (
                <span key={i} className="s-title-line">{line}</span>
              ))}
            </h2>
            <p className="s-featured-desc">{FEATURED.description}</p>
            <button className="s-watch-btn">
              ASSISTIR AGORA
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                <path d="M2 8h12M9 4l4 4-4 4" />
              </svg>
            </button>
          </motion.div>

          {/* Right: video */}
          <motion.div
            className="s-featured-video"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            <iframe width="1100" height="800" src="https://www.youtube.com/embed/SLZW9MCB_Bs?list=RDF4-n8E3gX4M" title="yung vegan - assata shakur (visualizer)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="s-section-divider">
        <span>MAIS HISTÓRIAS</span>
      </div>

      {/* ── Story grid ── */}
      <section className="s-grid-section">
        <div className="s-grid">
          {STORIES.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <motion.section
        className="s-cta"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="s-cta-label">NOVA COLEÇÃO</p>
        <h2 className="s-cta-title">SS 2026 — disponível agora</h2>
        <button className="s-cta-btn">VER PRODUTOS</button>
      </motion.section>

    </div>
  );
}