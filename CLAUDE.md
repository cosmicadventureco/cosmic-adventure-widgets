# Cosmic Adventure widgets (yogainzion.com + Zion Canyon Light)

`public/cosmic.js` is loaded by two Squarespace sites, chosen by the script tag's `data-site`:
`yoga` (yogainzion.com) and `zcl` (Zion Canyon Light). It draws the stargazing popup,
the inline card on the stargazing page (`<div data-cosmic-embed></div>`), and the floating
"Book here!" button.

To update content, edit the `EVENTS` / `SHARED` block at the top of `public/cosmic.js`; it shows on both sites.
Per-site looks, footers, links and popup behaviour are in `SITES`. A site's `content` overrides `SHARED` for that site only.
- Every event needs a `hideAfter` date (YYYY-MM-DD) so it drops off by itself when it ends.
- Strings are inserted as HTML; `<br>` is fine. Leave the rest of the file alone unless the design needs changing.
- Check it with `npx wrangler dev` and open /preview.html, /popup.html?cosmic-popup, /zcl-preview.html and /zcl-popup.html?cosmic-popup.
- Deploy: push to `main` (Cloudflare Workers Builds deploys it), or run `npx wrangler deploy`.
- Changes reach visitors within about 5 minutes (Cache-Control max-age=300 in `public/_headers`).
- `squarespace/` holds the older paste-in Code Block versions (they copy their content from each site's popup).
  They are only a fallback for when the hosted script isn't installed; the hosted script replaces them.
