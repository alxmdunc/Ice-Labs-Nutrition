# Ice Labs Nutrition Website

Custom Node.js rebuild of the Ice Labs Nutrition website.

## Run Locally

```bash
npm start
```

The site runs at:

```text
http://localhost:3000
```

Use a different port if needed:

```bash
PORT=8080 npm start
```

## Project Structure

- `server.js` serves the website and handles `POST /api/contact`.
- `public/index.html` contains the single-page site.
- `public/styles.css` contains the responsive visual design.
- `public/script.js` handles mobile navigation, contact form submission, and cookie acknowledgement.
- `public/assets/` contains local Ice Labs imagery pulled from the current site.

## Next Production Steps

- Connect `/api/contact` to email, a CRM, or a database.
- Replace placeholder store cards with real retailer names, addresses, and map links.
- Add ecommerce when online ordering is ready.
