import { useEffect } from "react";

const SITE = "https://nervur.fr";
const DEFAULT_IMAGE = SITE + "/og-image.png";
const SITE_NAME = "NERVÜR";

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel, href, attrs = {}) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

/**
 * @param {string} title - Page title
 * @param {string} description - Meta description (max ~155 chars)
 * @param {object} [opts] - Optional overrides
 * @param {string} [opts.path] - URL path for canonical (e.g. "/contact")
 * @param {string} [opts.image] - OG image URL override
 * @param {string} [opts.type] - OG type override (default: "website")
 * @param {string} [opts.imageAlt] - Alt text for OG image
 * @param {string} [opts.author] - Author name
 * @param {string} [opts.publishedTime] - Article published time (ISO)
 * @param {string} [opts.modifiedTime] - Article modified time (ISO)
 * @param {string} [opts.keywords] - Comma-separated keywords
 */
export default function useSEO(title, description, opts) {
  const path = opts?.path || "";
  const image = opts?.image || DEFAULT_IMAGE;
  const type = opts?.type || "website";
  const imageAlt = opts?.imageAlt || title;
  const keywords = opts?.keywords || "";

  useEffect(() => {
    const url = SITE + path;

    // Basic
    document.title = title;
    setMeta("name", "description", description);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    }

    // Canonical
    setLink("canonical", url);

    // Alternate hreflang
    setLink("alternate", url, { hreflang: "fr" });

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", imageAlt);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "fr_FR");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", imageAlt);

    // Article-specific meta (for blog posts)
    if (opts?.publishedTime) {
      setMeta("property", "article:published_time", opts.publishedTime);
    }
    if (opts?.modifiedTime) {
      setMeta("property", "article:modified_time", opts.modifiedTime);
    }
    if (opts?.author) {
      setMeta("name", "author", opts.author);
    }

    // Robots
    setMeta("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = "NERVÜR — Éditeur de Nouvelles Technologies sur Mesure | Création de Sites & SaaS";
      setMeta("name", "description", "NERVÜR — Éditeur de nouvelles technologies sur mesure pour les entreprises. Création de sites web, développement d'outils SaaS, solutions digitales personnalisées.");
      setLink("canonical", SITE + "/");
      setMeta("property", "og:title", "NERVÜR — Éditeur de Nouvelles Technologies sur Mesure");
      setMeta("property", "og:description", "Éditeur de nouvelles technologies sur mesure. Création de sites web, outils SaaS, solutions digitales personnalisées pour les entreprises.");
      setMeta("property", "og:url", SITE + "/");
      setMeta("name", "twitter:title", "NERVÜR — Éditeur de Nouvelles Technologies sur Mesure");
      setMeta("name", "twitter:description", "Éditeur de nouvelles technologies sur mesure. Création de sites web, outils SaaS, solutions digitales personnalisées pour les entreprises.");
    };
  }, [title, description, path, image, type, imageAlt, keywords]);
}
