# Cosmic Adventure widgets

Stargazing widgets for **yogainzion.com** and **Zion Canyon Light**, served from a Cloudflare Worker.
One script, `public/cosmic.js`, draws on both sites:

- the timed stargazing-events popup,
- the inline events card on the stargazing page (sized to match the Stargazing Calendar beside it),
- the floating "Book here!" button.

Events are shared by both sites and each one drops off by itself after its `hideAfter` date.

## Updating

Edit the `EVENTS` / `SHARED` block at the top of `public/cosmic.js` and push to `main`.
Cloudflare redeploys automatically and visitors see the change within about 5 minutes.

## One-time Cloudflare setup

1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**.
2. Pick `cosmicadventureco/cosmic-adventure-widgets`. Leave the build command empty; the deploy
   command is `npx wrangler deploy`.
3. Deploy. The script is then at `https://cosmic-adventure-widgets.<your-subdomain>.workers.dev/cosmic.js`.

## One-time Squarespace setup

**Settings → Advanced → Code Injection → Footer**, replacing the old popup and Book button code.

yogainzion.com:

```html
<script src="https://cosmic-adventure-widgets.YOUR-SUBDOMAIN.workers.dev/cosmic.js" data-site="yoga" defer></script>
```

Zion Canyon Light:

```html
<script src="https://cosmic-adventure-widgets.YOUR-SUBDOMAIN.workers.dev/cosmic.js" data-site="zcl" defer></script>
```

On each stargazing page, replace the events Code Block with:

```html
<div data-cosmic-embed></div>
```

Add `?cosmic-popup` to any page URL to see the popup straight away (skips the delay and cooldown).

## Previewing locally

```bash
npx wrangler dev
```

Then open `/preview.html`, `/popup.html?cosmic-popup`, `/zcl-preview.html` and `/zcl-popup.html?cosmic-popup`.
