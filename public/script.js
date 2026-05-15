const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const storeSearch = document.querySelector("[data-store-search]");
const storeStatus = document.querySelector("[data-store-status]");
const storeResults = document.querySelector("[data-store-results]");
const storeMap = document.querySelector("[data-store-map]");
const mapCallout = document.querySelector("[data-map-callout]");
const signupForm = document.querySelector(".signup-form");
const STORE_RADIUS_MILES = 30;
const fallbackZipLocations = {
  "84003": { zip: "84003", state: "UT", lat: 40.39, lng: -111.79 },
  "84043": { zip: "84043", state: "UT", lat: 40.39, lng: -111.85 },
  "84045": { zip: "84045", state: "UT", lat: 40.34, lng: -111.91 },
  "84065": { zip: "84065", state: "UT", lat: 40.52, lng: -111.94 },
  "84070": { zip: "84070", state: "UT", lat: 40.58, lng: -111.9 },
  "84604": { zip: "84604", state: "UT", lat: 40.27, lng: -111.66 },
  "84653": { zip: "84653", state: "UT", lat: 40.05, lng: -111.67 }
};
const defaultStores = [
  {
    name: "Pioneer Market",
    address: "300 E Main St",
    city: "Lehi",
    state: "UT",
    zip: "84043",
    phone: "(801) 768-3578",
    lat: 40.3885,
    lng: -111.846
  },
  {
    name: "Day's Market",
    address: "3121 N Canyon Rd",
    city: "Provo",
    state: "UT",
    zip: "84604",
    phone: "(801) 375-7960",
    lat: 40.2684,
    lng: -111.6588
  },
  {
    name: "Southend Market",
    address: "820 N 700 E",
    city: "Provo",
    state: "UT",
    zip: "84604",
    phone: "(801) 374-4794",
    lat: 40.2443,
    lng: -111.6467
  },
  {
    name: "Peterson's Fresh Market",
    address: "1784 W 12600 S",
    city: "Riverton",
    state: "UT",
    zip: "84065",
    phone: "(801) 254-0761",
    lat: 40.5227,
    lng: -111.9391
  },
  {
    name: "Stoke's",
    address: "795 UT-198",
    city: "Salem",
    state: "UT",
    zip: "84653",
    phone: "(801) 504-6021",
    lat: 40.0472,
    lng: -111.6723
  },
  {
    name: "Meier's Meats & Fine Foods",
    address: "5521 UT-92 #133",
    city: "Highland",
    state: "UT",
    zip: "84003",
    phone: "(801) 642-2069",
    lat: 40.4318,
    lng: -111.7912
  },
  {
    name: "The Refinery Gym",
    address: "9507 670 W",
    city: "Sandy",
    state: "UT",
    zip: "84070",
    phone: "(801) 750-5021",
    lat: 40.5768,
    lng: -111.8955
  }
];
let stores = defaultStores;
let renderedStores = [];

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.addEventListener("click", event => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

updateHeader();
window.addEventListener("scroll", updateHeader);

contactForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  formStatus.textContent = "Sending wholesale inquiry...";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    formStatus.textContent = result.message;
    if (result.ok) contactForm.reset();
  } catch (error) {
    formStatus.textContent = "Unable to send right now. Please try again shortly.";
  }
});

const getDirectionsUrl = store => {
  const destination = `${store.name}, ${store.address}, ${store.city}, ${store.state} ${store.zip}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
};

const getMapUrl = store => {
  const destination = `${store.name}, ${store.address}, ${store.city}, ${store.state} ${store.zip}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;
};

const formatDistance = distance => {
  if (typeof distance !== "number") return "";
  return ` · ${distance.toFixed(distance < 10 ? 1 : 0)} mi`;
};

const updateMapStore = store => {
  if (!store) return;

  if (storeMap) {
    storeMap.src = getMapUrl(store);
    storeMap.title = `Map showing ${store.name}`;
  }

  if (mapCallout) {
    mapCallout.innerHTML = `
      <span>Closest store</span>
      <strong>${store.name}</strong>
      <p>${store.city}, ${store.state}${formatDistance(store.distance)}</p>
    `;
  }
};

const renderStores = (storesToRender, label = "Available now") => {
  if (!storeResults) return;
  renderedStores = storesToRender;

  if (!storesToRender.length) {
    renderedStores = [];
    storeResults.innerHTML = `
      <article>
        <span>Coming soon</span>
        <strong>No stores found nearby yet</strong>
        <p>Tell us where you want Ice Labs stocked next.</p>
      </article>
    `;
    return;
  }

  updateMapStore(storesToRender[0]);

  storeResults.innerHTML = storesToRender
    .map(
      (store, index) => `
        <article>
          <button class="store-result-button" type="button" data-store-index="${index}">
            <span>${label}</span>
            <strong>${store.name}</strong>
            <p>${store.address} · ${store.city}, ${store.state} ${store.zip}${formatDistance(store.distance)}</p>
          </button>
          <p>${store.phone} · <a class="store-directions" href="${getDirectionsUrl(store)}" target="_blank" rel="noopener">Get directions</a></p>
        </article>
      `
    )
    .join("");
};

storeResults?.addEventListener("click", event => {
  const button = event.target.closest("[data-store-index]");
  if (!(button instanceof HTMLButtonElement)) return;

  const store = renderedStores[Number(button.dataset.storeIndex)];
  updateMapStore(store);
});

const toRadians = degrees => (degrees * Math.PI) / 180;

const getDistanceMiles = (origin, destination) => {
  const earthRadiusMiles = 3958.8;
  const latDifference = toRadians(destination.lat - origin.lat);
  const lngDifference = toRadians(destination.lng - origin.lng);
  const startLat = toRadians(origin.lat);
  const endLat = toRadians(destination.lat);

  const haversine =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDifference / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const getNearbyStores = location =>
  stores
    .filter(store => typeof store.lat === "number" && typeof store.lng === "number")
    .map(store => ({
      ...store,
      distance: getDistanceMiles(location, store)
    }))
    .filter(store => store.distance <= STORE_RADIUS_MILES)
    .sort((a, b) => a.distance - b.distance);

const getStoresInState = state =>
  stores.filter(store => store.state.toLowerCase() === state.toLowerCase());

const getClosestStoresInState = (location, state, limit = 3) =>
  getStoresInState(state)
    .filter(store => typeof store.lat === "number" && typeof store.lng === "number")
    .map(store => ({
      ...store,
      distance: getDistanceMiles(location, store)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

const getFallbackStateForZip = zip => {
  if (zip.startsWith("84")) return "UT";
  return "";
};

const getZipLocation = async zip => {
  if (fallbackZipLocations[zip]) return fallbackZipLocations[zip];

  const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!response.ok) throw new Error("ZIP lookup failed");

  const data = await response.json();
  const place = data.places?.[0];
  if (!place) throw new Error("ZIP not found");

  return {
    zip,
    state: place["state abbreviation"],
    lat: Number(place.latitude),
    lng: Number(place.longitude)
  };
};

const findStores = query => {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return stores;

  return stores.filter(store => {
    const searchable = `${store.name} ${store.address} ${store.city} ${store.state} ${store.zip}`.toLowerCase();
    return searchable.includes(cleanQuery);
  });
};

const searchStores = async query => {
  const cleanQuery = query.trim();
  const zipMatch = cleanQuery.match(/^\d{5}$/);

  if (!cleanQuery) {
    return {
      label: "Available now",
      stores: stores.map(store => ({ ...store, distance: undefined })),
      status: `Showing all ${stores.length} Ice Labs retailers.`
    };
  }

  if (zipMatch) {
    const fallbackState = getFallbackStateForZip(cleanQuery);
    if (fallbackState) {
      try {
        const location = await getZipLocation(cleanQuery);
        const closestStores = getClosestStoresInState(location, fallbackState);

        return {
          label: "Closest store",
          stores: closestStores,
          status: closestStores.length
            ? `Showing the closest ${closestStores.length} Ice Labs store${closestStores.length === 1 ? "" : "s"} to ${cleanQuery}.`
            : `No Ice Labs retailers found in ${fallbackState} yet.`
        };
      } catch (error) {
        const stateStores = getStoresInState(fallbackState).slice(0, 3);
        return {
          label: `${fallbackState} retailer`,
          stores: stateStores,
          status: stateStores.length
            ? `Showing ${stateStores.length} Ice Labs retailers in ${fallbackState}.`
            : `No Ice Labs retailers found in ${fallbackState} yet.`
        };
      }
    }

    try {
      const location = await getZipLocation(cleanQuery);
      const nearbyStores = getNearbyStores(location);

      if (nearbyStores.length) {
        return {
          label: `Within ${STORE_RADIUS_MILES} miles`,
          stores: nearbyStores,
          status: `Showing ${nearbyStores.length} store${nearbyStores.length === 1 ? "" : "s"} within ${STORE_RADIUS_MILES} miles of ${cleanQuery}.`
        };
      }

      const stateStores = getStoresInState(location.state);
      return {
        label: `${location.state} retailer`,
        stores: stateStores,
        status: stateStores.length
          ? `No stores found within ${STORE_RADIUS_MILES} miles of ${cleanQuery}. Showing Ice Labs retailers in ${location.state}.`
          : `No Ice Labs retailers found in ${location.state} yet.`
      };
    } catch (error) {
      const matches = findStores(cleanQuery);
      return {
        label: "Available now",
        stores: matches,
        status: matches.length
          ? `Showing ${matches.length} exact ZIP match${matches.length === 1 ? "" : "es"} for ${cleanQuery}.`
          : `We could not look up ${cleanQuery}. Try a city, state, or another ZIP.`
      };
    }
  }

  const matches = findStores(cleanQuery);
  return {
    label: "Available now",
    stores: matches,
    status: matches.length
      ? `Showing ${matches.length} store${matches.length === 1 ? "" : "s"} matching "${cleanQuery}".`
      : `No stores found for "${cleanQuery}" yet.`
  };
};

const loadStores = async () => {
  if (!storeResults) return;

  renderStores(stores.slice(0, 4));
  if (storeStatus) storeStatus.textContent = `${stores.length} Ice Labs retailers available in Utah.`;

  try {
    const response = await fetch("/stores.json");
    stores = await response.json();
    renderStores(stores.slice(0, 4));
    if (storeStatus) storeStatus.textContent = `${stores.length} Ice Labs retailers available in Utah.`;
  } catch (error) {
    renderStores(stores.slice(0, 4));
    if (storeStatus) storeStatus.textContent = `${stores.length} Ice Labs retailers available in Utah.`;
  }
};

storeSearch?.addEventListener("submit", async event => {
  event.preventDefault();
  const query = new FormData(storeSearch).get("zip");
  const cleanQuery = String(query || "").trim();

  if (storeStatus) storeStatus.textContent = cleanQuery ? `Searching near ${cleanQuery}...` : "Showing all stores...";

  const result = await searchStores(cleanQuery);
  renderStores(result.stores, result.label);
  if (storeStatus) storeStatus.textContent = result.status;
});

loadStores();

signupForm?.addEventListener("submit", event => {
  event.preventDefault();
  signupForm.reset();
});
