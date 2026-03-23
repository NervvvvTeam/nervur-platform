import { useEffect } from "react";

/**
 * Injects a JSON-LD script tag into <head>.
 * Removes it on unmount to avoid duplicates when navigating.
 * @param {object} data - The structured data object
 */
export default function useJsonLd(data) {
  useEffect(() => {
    if (!data) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.id = "json-ld-" + (data["@type"] || "default");
    // Remove existing one with same id to avoid duplicates
    const existing = document.getElementById(script.id);
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [data]);
}
