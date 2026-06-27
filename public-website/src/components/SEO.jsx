import { useEffect, useState } from "react";
import API from "../api";

export default function SEO({ title, description, keywords, ogImage, imageAlt, page }) {
  const [dbSeo, setDbSeo] = useState(null);

  useEffect(() => {
    // Determine page identifier based on page prop or window pathname
    let activePage = page;
    if (!activePage) {
      const path = window.location.pathname;
      if (path === "/" || path === "") {
        activePage = "home";
      } else if (path.startsWith("/products")) {
        activePage = "products";
      } else if (path.startsWith("/digital")) {
        activePage = "digital";
      } else if (path.startsWith("/blog")) {
        activePage = "blogs";
      } else if (path.startsWith("/about")) {
        activePage = "about";
      } else if (path.startsWith("/contact")) {
        activePage = "contact";
      } else if (path.startsWith("/service")) {
        activePage = "service";
      } else if (path.startsWith("/terms")) {
        activePage = "terms";
      } else if (path.startsWith("/privacy")) {
        activePage = "privacy";
      } else if (path.startsWith("/refund")) {
        activePage = "refund";
      } else if (path.startsWith("/shipping")) {
        activePage = "shipping";
      } else if (path.startsWith("/cookies")) {
        activePage = "cookies";
      } else if (path.startsWith("/cart")) {
        activePage = "cart";
      } else if (path.startsWith("/checkout")) {
        activePage = "checkout";
      } else if (path.startsWith("/login")) {
        activePage = "login";
      } else if (path.startsWith("/profile")) {
        activePage = "profile";
      }
    }

    if (activePage) {
      API.get(`/seo/${activePage}`)
        .then((res) => {
          if (res.data) {
            setDbSeo(res.data);
          }
        })
        .catch((err) => {
          console.warn(`Dynamic SEO fetch failed for page "${activePage}", using static overrides:`, err);
        });
    }
  }, [page]);

  useEffect(() => {
    // Prioritise custom static props (e.g. for products), then database settings, then global design defaults
    const activeTitle = title || dbSeo?.title;
    const activeDesc = description || dbSeo?.meta_description;
    const activeKeywords = keywords || dbSeo?.keywords;
    const activeImage = ogImage || dbSeo?.og_image;
    const activeImageAlt = imageAlt || dbSeo?.image_alt;

    // 1. Update Title
    if (activeTitle) {
      document.title = activeTitle.includes("Olive Seeds") ? activeTitle : `${activeTitle} | Olive Seeds`;
    } else {
      document.title = "Olive Seeds Creative Studio | Premium Engravings & Digital Art";
    }

    // 2. Update Description Meta Tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      activeDesc || "Explore premium engraved gifts, acrylic keepsakes, laser-cut templates, Notion dashboards, React web apps, branding, and luxury creative technology designs."
    );

    // 3. Update Keywords Meta Tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute(
      "content",
      activeKeywords || "engraving, personalized gifts, laser cutting, digital art, Figma UI kits, React web dev, luxury design, Etsy store templates"
    );

    // 4. Update OpenGraph Social tags
    const ogTags = [
      { property: "og:title", value: activeTitle },
      { property: "og:description", value: activeDesc },
      { property: "og:image", value: activeImage },
      { property: "og:image:alt", value: activeImageAlt }
    ];

    ogTags.forEach(({ property, value }) => {
      if (!value) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    });

    // 5. Update Canonical Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", window.location.href);
  }, [dbSeo, title, description, keywords, ogImage, imageAlt]);

  return null;
}
