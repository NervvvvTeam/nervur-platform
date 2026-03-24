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
    // Use @type + name for unique IDs (allows multiple SoftwareApplication entries)
    const suffix = (data["@type"] || "default") + (data["name"] ? "-" + data["name"].replace(/\s+/g, "-").toLowerCase() : "");
    script.id = "json-ld-" + suffix;
    // Remove existing one with same id to avoid duplicates
    const existing = document.getElementById(script.id);
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [data]);
}
