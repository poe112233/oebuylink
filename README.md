# oebuylink

Link-conversion landing site for six buying platforms (OOPBUY / KAKOBUY / UIDBUY / HIPOBUY / LITBUY / BOONBUY).

- `main/` — oebuylink.com (converter + hub + sitemap)
- `oopbuy/` `kakobuy/` `uidbuy/` `hipobuy/` `litbuy/` `boonbuy/` — one Cloudflare Pages project per folder, bound to the matching subdomain

Regenerate with `python3 build.py` (sources: `content.py`, `assets/`). Pure static, zero dependencies.
