# Nuremberg Explorer 🗺️

A mobile-friendly city guide for Nuremberg. Find cafes, attractions, historic places and shops near you — then build a walking route to open directly in Google Maps or DB Navigator.

## Features

- **Live location** — detects where you are in the city
- **4 categories** — Food & Drink, Attractions, History, Shopping
- **Smart filters** — cuisine type, budget (€/€€/€€€), free/paid entry, distance radius
- **Interactive map** — tap any place to see details
- **Route builder** — pick multiple stops and open the full route in:
  - **Google Maps** (walking or driving)
  - **DB Navigator** (public transport / U-Bahn / S-Bahn)
- **All data free** — places come from OpenStreetMap, no API fees

---

## Setup (first time)

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version). This gives you `npm`.

### 2. Get a Mapbox token (free)
1. Go to [account.mapbox.com](https://account.mapbox.com) and sign up
2. Copy your **Default public token**

### 3. Create your `.env` file
In the project folder, create a file called `.env` (no extension) and paste:

```
VITE_MAPBOX_TOKEN=paste_your_token_here
```

### 4. Install and run
Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment (GitHub Pages)

The app deploys automatically when you push to `main`. You only need to do this once:

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add a secret named `VITE_MAPBOX_TOKEN` with your Mapbox token
3. Go to **Settings → Pages** → Source: **GitHub Actions**

Every `git push` to `main` will trigger a build and publish the site.

---

## How to use

1. Tap **Locate Me** to share your location
2. Choose a category (Food, Attractions, History, Shopping)
3. Set filters (type, distance, budget)
4. Tap **Find Places** — markers appear on the map
5. Tap a **+** button on any place to add it to your route
6. Tap **My Route** in the top bar to see your stops
7. Open in **Google Maps** or **DB Navigator**

---

## Tech Stack

- Vite + React
- Mapbox GL JS (map display)
- OpenStreetMap / Overpass API (place data — free, no key needed)
- Tailwind CSS (styling)
