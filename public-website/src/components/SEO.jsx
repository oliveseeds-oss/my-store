import { useEffect, useState } from "react";
import API from "../api";

export default function SEO({ title, description, keywords, ogImage, imageAlt, page, isProduct = false, productData = null }) {
  const [dbSeo, setDbSeo] = useState(null);

  useEffect(() => {
    let activePage = page;
    if (!activePage) {
      const path = window.location.pathname;
      if (path === "/" || path === "") activePage = "home";
      else if (path.startsWith("/products")) activePage = "products";
      else if (path.startsWith("/digital")) activePage = "digital";
      else if (path.startsWith("/blog")) activePage = "blogs";
      else if (path.startsWith("/about")) activePage = "about";
      else if (path.startsWith("/contact")) activePage = "contact";
      else if (path.startsWith("/faq")) activePage = "faq";
    }

    if (activePage) {
      API.get(`/seo/${activePage}`)
        .then((res) => {
          if (res.data) setDbSeo(res.data);
        })
        .catch(() => {});
    }
  }, [page]);

  useEffect(() => {
    const siteUrl = (process.env.SITE_URL || process.env.REACT_APP_SITE_URL || window.location.origin).replace(/\/$/, "");
    const currentUrl = `${siteUrl}${window.location.pathname}${window.location.search}`;

    const activeTitle = title || dbSeo?.title || "Olive Seeds Studio — Custom Printed Products & Digital Downloads";
    const activeDesc = description || dbSeo?.meta_description || "Custom printed products including t-shirts, mugs, canvas prints and digital downloads. Ships worldwide to 17 countries.";
    const activeKeywords = keywords || dbSeo?.keywords || "custom t-shirts, personalized mugs, canvas prints, digital download art, custom gifts";
    const activeImage = ogImage || dbSeo?.og_image || `${siteUrl}/logo192.png`;

    // 1. Title
    document.title = activeTitle.includes("Olive Seeds") ? activeTitle : `${activeTitle} | Olive Seeds Studio`;

    // Helper for Meta Tags
    const setMeta = (attrName, attrValue, contentValue) => {
      if (!contentValue) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentValue);
    };

    // Helper for Link Tags
    const setLink = (rel, href, attributes = {}) => {
      let el = document.querySelector(`link[rel="${rel}"][href="${href}"]`) || document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
      Object.keys(attributes).forEach(k => el.setAttribute(k, attributes[k]));
    };

    // PART 1: UNIVERSAL META TAGS
    setMeta("name", "robots", "index, follow, max-image-preview:large");
    setMeta("name", "googlebot", "index, follow");
    setMeta("name", "bingbot", "index, follow");
    setMeta("name", "theme-color", "#6B7C3F");
    setMeta("name", "description", activeDesc);
    setMeta("name", "keywords", activeKeywords);
    setLink("canonical", currentUrl);

    // Search Engine & Social Verification Codes (.env)
    const envVars = {
      "google-site-verification": process.env.REACT_APP_GOOGLE_VERIFY_CODE || process.env.GOOGLE_VERIFY_CODE,
      "msvalidate.01": process.env.REACT_APP_BING_VERIFY_CODE || process.env.BING_VERIFY_CODE,
      "yandex-verification": process.env.REACT_APP_YANDEX_VERIFY_CODE || process.env.YANDEX_VERIFY_CODE,
      "baidu-site-verification": process.env.REACT_APP_BAIDU_VERIFY_CODE || process.env.BAIDU_VERIFY_CODE,
      "naver-site-verification": process.env.REACT_APP_NAVER_VERIFY_CODE || process.env.NAVER_VERIFY_CODE,
      "p:domain_verify": process.env.REACT_APP_PINTEREST_VERIFY_CODE || process.env.PINTEREST_VERIFY_CODE,
    };
    Object.entries(envVars).forEach(([name, val]) => {
      if (val) setMeta("name", name, val);
    });

    if (process.env.REACT_APP_BAIDU_VERIFY_CODE || process.env.BAIDU_VERIFY_CODE) {
      setMeta("name", "applicable-device", "pc,mobile");
      setMeta("name", "mobile-agent", "format=html5");
    }

    // OPEN GRAPH TAGS
    setMeta("property", "og:site_name", "Olive Seeds Studio");
    setMeta("property", "og:type", isProduct ? "product" : "website");
    setMeta("property", "og:title", activeTitle);
    setMeta("property", "og:description", activeDesc);
    setMeta("property", "og:image", activeImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:locale", "en_US");

    // FEED 5: OPEN GRAPH PRODUCT SPECIFIC TAGS
    if (isProduct && productData) {
      setMeta("property", "product:price:amount", String(productData.price || "0"));
      setMeta("property", "product:price:currency", "INR");
      setMeta("property", "product:availability", (productData.stock === 0 || productData.stock === "0") ? "out of stock" : "in stock");
      setMeta("property", "product:brand", "Olive Seeds Studio");
      if (productData.category) {
        setMeta("property", "product:category", productData.category);
      }
    }

    // TWITTER / X CARDS
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", process.env.REACT_APP_TWITTER_HANDLE || "@oliveseeds");
    setMeta("name", "twitter:title", activeTitle);
    setMeta("name", "twitter:description", activeDesc);
    setMeta("name", "twitter:image", activeImage);

    // PART 6: HREFLANG TAGS
    const regions = ["en", "en-AU", "en-CA", "en-GB", "en-IN", "en-SG", "en-MY", "en-NZ", "en-US", "x-default"];
    const path = window.location.pathname;
    regions.forEach(lang => {
      let linkEl = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.setAttribute("rel", "alternate");
        linkEl.setAttribute("hreflang", lang);
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute("href", `${siteUrl}${path}`);
    });

    // PART 5: PRECONNECT & DNS-PREFETCH
    setLink("preconnect", "https://fonts.googleapis.com");
    setLink("preconnect", "https://fonts.gstatic.com", { crossorigin: "anonymous" });
    setLink("dns-prefetch", "https://checkout.razorpay.com");
    setLink("dns-prefetch", "https://www.paypal.com");

    // PART 2: BREADCRUMB SCHEMA (INNER PAGES)
    if (path !== "/" && path !== "") {
      const pageName = title || path.split("/").filter(Boolean).pop().replace(/-/g, " ");
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": pageName, "item": currentUrl }
        ]
      };

      let scriptEl = document.querySelector("#breadcrumb-schema");
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = "breadcrumb-schema";
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(breadcrumbSchema);
    }
  }, [dbSeo, title, description, keywords, ogImage, imageAlt, isProduct]);

  return null;
}
