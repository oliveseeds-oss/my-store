import { useEffect, useState } from "react";
import API from "../api";

export default function SEO({ title, description, keywords, ogImage, imageAlt, page, isProduct = false, productData = null }) {
  const [dbSeo, setDbSeo] = useState(null);
  const [globalSeo, setGlobalSeo] = useState({});

  useEffect(() => {
    // Fetch global SEO defaults
    API.get("/seo/global")
      .then(res => setGlobalSeo(res.data || {}))
      .catch(() => {});

    let activePage = page;
    if (!activePage) {
      const path = window.location.pathname;
      if (path === "/" || path === "") activePage = "home";
      else if (path.startsWith("/products")) activePage = "products";
      else if (path.startsWith("/product/")) {
        const pid = path.split("/").pop();
        activePage = `product_${pid}`;
      }
      else if (path.startsWith("/blog/")) {
        const bid = path.split("/").pop();
        activePage = `blog_${bid}`;
      }
      else if (path.startsWith("/blog")) activePage = "blog";
      else if (path.startsWith("/faq")) activePage = "faq";
      else if (path.startsWith("/bulk-order")) activePage = "bulk-order";
      else if (path.startsWith("/about")) activePage = "about";
      else if (path.startsWith("/contact")) activePage = "contact";
    }

    if (activePage) {
      let endpoint = `/seo/page/${activePage}`;
      if (activePage.startsWith("product_")) endpoint = `/seo/product/${activePage.replace("product_", "")}`;
      else if (activePage.startsWith("blog_")) endpoint = `/seo/blog/${activePage.replace("blog_", "")}`;

      API.get(endpoint)
        .then((res) => {
          if (res.data && res.data.page_key) setDbSeo(res.data);
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

    const siteName = globalSeo.site_name || "Olive Seeds Studio";
    const separator = globalSeo.title_separator || "|";

    const rawTitle = dbSeo?.meta_title || title || "Custom Printed Products & Digital Downloads";
    const activeTitle = rawTitle.includes(siteName) ? rawTitle : `${rawTitle} ${separator} ${siteName}`;

    const activeDesc = dbSeo?.meta_description || description || globalSeo.default_meta_description || "Custom printed products including t-shirts, mugs, canvas prints and digital downloads. Ships worldwide to 17 countries.";
    const activeKeywords = dbSeo?.keywords || keywords || "custom t-shirts, personalized mugs, canvas prints, digital download art, custom gifts";
    const activeImage = dbSeo?.og_image || ogImage || globalSeo.default_og_image || `${siteUrl}/logo192.png`;
    const isNoIndex = dbSeo?.no_index;

    // 1. Title
    document.title = activeTitle;

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
    if (isNoIndex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow, max-image-preview:large");
    }
    setMeta("name", "googlebot", isNoIndex ? "noindex, nofollow" : "index, follow");
    setMeta("name", "bingbot", isNoIndex ? "noindex, nofollow" : "index, follow");
    setMeta("name", "description", activeDesc);
    setMeta("name", "keywords", activeKeywords);
    setLink("canonical", dbSeo?.canonical_url || currentUrl);

    // Search Engine Verification Codes (Global DB Settings & .env fallback)
    const verificationCodes = {
      "google-site-verification": globalSeo.google_verify_code || process.env.REACT_APP_GOOGLE_VERIFY_CODE || process.env.GOOGLE_VERIFY_CODE,
      "msvalidate.01": globalSeo.bing_verify_code || process.env.REACT_APP_BING_VERIFY_CODE || process.env.BING_VERIFY_CODE,
      "yandex-verification": globalSeo.yandex_verify_code || process.env.REACT_APP_YANDEX_VERIFY_CODE || process.env.YANDEX_VERIFY_CODE,
      "baidu-site-verification": globalSeo.baidu_verify_code || process.env.REACT_APP_BAIDU_VERIFY_CODE || process.env.BAIDU_VERIFY_CODE,
      "naver-site-verification": globalSeo.naver_verify_code || process.env.REACT_APP_NAVER_VERIFY_CODE || process.env.NAVER_VERIFY_CODE,
      "p:domain_verify": globalSeo.pinterest_verify_code || process.env.REACT_APP_PINTEREST_VERIFY_CODE || process.env.PINTEREST_VERIFY_CODE,
    };
    Object.entries(verificationCodes).forEach(([name, val]) => {
      if (val) setMeta("name", name, val);
    });

    // OPEN GRAPH TAGS
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:type", isProduct ? "product" : "website");
    setMeta("property", "og:title", dbSeo?.og_title || activeTitle);
    setMeta("property", "og:description", dbSeo?.og_description || activeDesc);
    setMeta("property", "og:image", activeImage);
    setMeta("property", "og:url", dbSeo?.canonical_url || currentUrl);

    // TWITTER / X CARDS
    setMeta("name", "twitter:card", dbSeo?.twitter_card || "summary_large_image");
    setMeta("name", "twitter:title", dbSeo?.twitter_title || dbSeo?.og_title || activeTitle);
    setMeta("name", "twitter:description", dbSeo?.twitter_description || dbSeo?.og_description || activeDesc);
    setMeta("name", "twitter:image", dbSeo?.twitter_image || activeImage);

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
