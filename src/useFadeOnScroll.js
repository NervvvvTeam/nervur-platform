import { useEffect } from "react";

export default function useFadeOnScroll(containerRef) {
  useEffect(() => {
    const root = containerRef?.current || document;
    const elements = root.querySelectorAll(".fade-section");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef]);
}
