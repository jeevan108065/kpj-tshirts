import { useEffect } from "react";

const defaults = {
  siteName: "KPJ Garments",
  titleSuffix: " | KPJ Garments Visakhapatnam",
  baseUrl: "https://garments.kpj.app",
};

/**
 * Lightweight SEO head manager for SPA pages.
 * Updates document title, meta description, and canonical on mount.
 */
const SEO = ({ title, description, path, keywords }) => {
  useEffect(() => {
    document.title = title ? `${title}${defaults.titleSuffix}` : `KPJ T-Shirts Visakhapatnam | Custom Printed Garments & Uniforms`;

    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(name.startsWith("og:") ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description);
      setMeta("twitter:description", description);
    }
    if (title) {
      setMeta("og:title", `${title}${defaults.titleSuffix}`);
      setMeta("twitter:title", `${title}${defaults.titleSuffix}`);
    }
    if (keywords) setMeta("keywords", keywords);
    if (path) {
      const canonical = `${defaults.baseUrl}${path}`;
      setMeta("og:url", canonical);
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
      link.setAttribute("href", canonical);
    }
  }, [title, description, path, keywords]);

  return null;
};

export default SEO;
