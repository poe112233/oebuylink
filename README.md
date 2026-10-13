# oebuylink

SEO guide site network for six buying platforms (OOPBUY / KAKOBUY / UIDBUY / HIPOBUY / LITBUY / BOONBUY).

- `main/` — oebuylink.com: guide hub, best sellers, full sitemap (sitemap.html + sitemap.xml)
- `oopbuy/` `kakobuy/` `uidbuy/` `hipobuy/` `litbuy/` `boonbuy/` — one Cloudflare Pages project per folder, bound to the matching subdomain; each is a product-focused SEO landing page (zh + en) that references the main store's catalog at ores.cc and links back to it

Product data snapshot: `_data_prods.json` / `_data_cats.json` (from the ores.cc data plane). Regenerate with `fetch_data.py`, then `build.py`, then `push_gh.py`. Pure static, zero dependencies. No tracking, no third-party scripts.

Note: the private Weidian link-converter tool is NOT part of this site (it lives separately).
