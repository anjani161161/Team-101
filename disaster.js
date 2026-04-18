const scrollProgress = document.getElementById("scroll-progress");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const logoutButton = document.getElementById("logout-btn");

const earthquakeCount = document.getElementById("detail-earthquake-count");
const wildfireCount = document.getElementById("detail-wildfire-count");
const stormCount = document.getElementById("detail-storm-count");
const otherCount = document.getElementById("detail-other-count");

const disasterSections = [
  {
    key: "wildfires",
    title: "Wildfires",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=wildfires&status=open&limit=12",
    gridId: "wildfires-grid",
    countTarget: wildfireCount
  },
  {
    key: "severeStorms",
    title: "Severe storms",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=severeStorms&status=open&limit=12",
    gridId: "storms-grid",
    countTarget: stormCount
  },
  {
    key: "volcanoes",
    title: "Volcanoes",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=volcanoes&status=open&limit=12",
    gridId: "volcanoes-grid"
  },
  {
    key: "landslides",
    title: "Landslides",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=landslides&status=open&limit=12",
    gridId: "landslides-grid"
  },
  {
    key: "drought",
    title: "Drought",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=drought&status=open&limit=12",
    gridId: "drought-grid"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  setupRevealObserver();
  setupNavigation();
  bindEvents();
  updateScrollProgress();
  loadDisasterFeeds();
});

function bindEvents() {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  });

  window.addEventListener("scroll", updateScrollProgress);
}

function setupNavigation() {
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function loadDisasterFeeds() {
  await Promise.all([loadEarthquakes(), ...disasterSections.map((section) => loadEonetSection(section))]);
}

async function loadEarthquakes() {
  const grid = document.getElementById("earthquakes-grid");

  try {
    const data = await fetchJson("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
    const features = data.features || [];

    grid.innerHTML = features.length
      ? features
          .slice(0, 12)
          .map((feature) => {
            const [lon, lat, depth] = feature.geometry.coordinates;
            return `
              <article class="detail-incident-card">
                <p class="panel-kicker">Earthquake event</p>
                <h3>${escapeHtml(feature.properties.place || "Unknown location")}</h3>
                <p>Magnitude ${roundValue(feature.properties.mag)} recorded with source-backed seismic details.</p>
                <div class="detail-meta">
                  <span>${new Date(feature.properties.time).toLocaleString()}</span>
                  <span>Depth ${roundValue(depth)} km</span>
                  <span>Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}</span>
                </div>
                <a href="${feature.properties.url}" target="_blank" rel="noreferrer">Open official source</a>
              </article>
            `;
          })
          .join("")
      : '<article class="detail-incident-card">No earthquake incidents were returned.</article>';

    animateNumber(earthquakeCount, features.length);
  } catch (error) {
    grid.innerHTML = '<article class="detail-incident-card">Earthquake feed is unavailable right now.</article>';
    earthquakeCount.textContent = "0";
  }
}

async function loadEonetSection(section) {
  const grid = document.getElementById(section.gridId);

  try {
    const data = await fetchJson(section.endpoint);
    const events = data.features || [];

    grid.innerHTML = events.length
      ? events.map((event) => renderEonetCard(event)).join("")
      : `<article class="detail-incident-card">No open ${section.title.toLowerCase()} incidents were returned.</article>`;

    if (section.countTarget) {
      animateNumber(section.countTarget, events.length);
    }

    if (!section.countTarget) {
      accumulateOtherCount(events.length);
    }
  } catch (error) {
    grid.innerHTML = `<article class="detail-incident-card">${section.title} feed is unavailable right now.</article>`;
    if (section.countTarget) {
      section.countTarget.textContent = "0";
    }
  }
}

function renderEonetCard(event) {
  const properties = event.properties || {};
  const geometry = event.geometry || {};
  const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  const lon = typeof coordinates[0] === "number" ? coordinates[0].toFixed(2) : "--";
  const lat = typeof coordinates[1] === "number" ? coordinates[1].toFixed(2) : "--";
  const eventDate = properties.date || properties.closed || new Date().toISOString();
  const source = properties.sources?.[0];

  return `
    <article class="detail-incident-card">
      <p class="panel-kicker">Live incident</p>
      <h3>${escapeHtml(properties.title || "Open event")}</h3>
      <p>${escapeHtml(properties.description || "Open event under active monitoring from NASA EONET.")}</p>
      <div class="detail-meta">
        <span>${new Date(eventDate).toLocaleDateString()}</span>
        <span>Lat ${lat}, Lon ${lon}</span>
      </div>
      ${
        source?.url
          ? `<a href="${source.url}" target="_blank" rel="noreferrer">Open source update</a>`
          : ""
      }
    </article>
  `;
}

function animateNumber(element, target) {
  const duration = 900;
  const start = Number(element.textContent.replace(/\D/g, "")) || 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    element.textContent = `${value}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function accumulateOtherCount(value) {
  const current = Number(otherCount.textContent.replace(/\D/g, "")) || 0;
  otherCount.textContent = `${current + value}`;
}

function roundValue(value) {
  return Number(value || 0).toFixed(1);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
