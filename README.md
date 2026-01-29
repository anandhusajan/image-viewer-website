# Miguelito's Ice Cream – Single-Page Website

Next.js single-page site for Miguelito's Ice Cream: hero, about (flyer), menu (images 01–06 in order), and location/CTA.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Structure

- **Hero:** Shop name and slogan (One Day. One Thousand Smiles.)
- **About:** Inauguration flyer image and key details (30-01-2026, 4PM, Rambo Mart, FREE 1000 CUPS*)
- **Menu:** Six menu images from `public/img/01.jpeg` through `06.jpeg` in order
- **Visit Us:** Golden Plaza, Abu Hamour, Qatar; “Get directions” links to Google Maps

Images are served from `public/` and optimized with `next/image`.
