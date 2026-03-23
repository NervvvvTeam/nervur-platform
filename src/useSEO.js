import { useEffect } from "react";

const SITE = "https://nervur.fr";
const DEFAULT_IMAGE = SITE + "/og-image.png";

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * @param {string} title - Page title
 * @param {string} description - Meta description (max ~155 chars)
 * @param {object} [opts] - Optional overrides
 * @param {string} [opts.path] - URL path for canonical (e.g. "/contact")
 * @param {string} [opts.image] - OG image URL override
 * @param {string} [opts.type] - OG type override (default: "website")
 */
export default function useSEO(title, description, opts) {
  const path = opts?.path || "";
  const image = opts?.image || DEFAULT_IMAGE;
  const type = opts?.type || "website";

  useEffect(() => {
    const url = SITE + path;

    // Basic
    document.title = title;
    setMeta("name", "description", description);

    // Canonical
    setLink("canonical", url);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "NERVÜR");
    setMeta("property", "og:locale", "fr_FR");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
  }, [title, description, path, image, type]);
}
