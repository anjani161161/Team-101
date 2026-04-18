const WEATHER_API_KEY = "53606528706ed18cf17cbdb6b1493766";
const DEFAULT_LOCATION = "New Delhi, IN";
const HOME_FEED_LIMIT = 4;

const weatherForm = document.getElementById("weather-form");
const locationInput = document.getElementById("location-input");
const searchStatus = document.getElementById("search-status");
const geoButton = document.getElementById("geo-btn");
const logoutButton = document.getElementById("logout-btn");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const scrollProgress = document.getElementById("scroll-progress");

const weatherLocation = document.getElementById("weather-location");
const weatherDescription = document.getElementById("weather-description");
const weatherTemp = document.getElementById("weather-temp");
const weatherRange = document.getElementById("weather-range");
const weatherUpdated = document.getElementById("weather-updated");
const weatherIcon = document.getElementById("weather-icon");
const weatherTags = document.getElementById("weather-tags");
const forecastCaption = document.getElementById("forecast-caption");
const forecastCards = document.getElementById("forecast-cards");

const metricFeelsLike = document.getElementById("metric-feels-like");
const metricHumidity = document.getElementById("metric-humidity");
const metricWind = document.getElementById("metric-wind");
const metricVisibility = document.getElementById("metric-visibility");
const metricPressure = document.getElementById("metric-pressure");
const metricClouds = document.getElementById("metric-clouds");

const airQualityTitle = document.getElementById("air-quality-title");
const airQualityBadge = document.getElementById("air-quality-badge");
const airQualityText = document.getElementById("air-quality-text");
const airPm25 = document.getElementById("air-pm25");
const airPm10 = document.getElementById("air-pm10");
const airO3 = document.getElementById("air-o3");

const earthquakeList = document.getElementById("earthquake-list");
const wildfireList = document.getElementById("wildfire-list");
const stormList = document.getElementById("storm-list");

const earthquakeCount = document.getElementById("earthquake-count");
const wildfireCount = document.getElementById("wildfire-count");
const stormCount = document.getElementById("storm-count");

const snapshotLocation = document.getElementById("snapshot-location");
const snapshotImpact = document.getElementById("snapshot-impact");
const snapshotEarthquake = document.getElementById("snapshot-earthquake");
const snapshotWildfire = document.getElementById("snapshot-wildfire");
const snapshotStorm = document.getElementById("snapshot-storm");

const AQI_LABELS = {
  1: { label: "Good", text: "Air quality is clean for most people.", className: "aqi-1" },
  2: { label: "Fair", text: "Sensitive groups should stay aware of changing pollution levels.", className: "aqi-2" },
  3: { label: "Moderate", text: "People with breathing issues may need to limit long outdoor exposure.", className: "aqi-3" },
  4: { label: "Poor", text: "Reduce outdoor activity and consider a mask if smoke or haze is visible.", className: "aqi-4" },
  5: { label: "Very Poor", text: "Health impacts are likely. Outdoor activity should be kept minimal.", className: "aqi-5" }
};

document.addEventListener("DOMContentLoaded", () => {
  setupRevealObserver();
  setupAccordions();
  setupNavigation();
  setupQuickSearches();
  bindEvents();
  updateScrollProgress();
  loadAllFeeds();
  searchWeatherByQuery(DEFAULT_LOCATION);
});

function bindEvents() {
  weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = locationInput.value.trim();
    if (!query) {
      setStatus("Enter a city, state, or country to search.", "error");
      return;
    }
    await searchWeatherByQuery(query);
  });

  geoButton.addEventListener("click", useCurrentLocation);

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
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

function setupQuickSearches() {
  document.querySelectorAll(".chip[data-location]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.location;
      locationInput.value = query;
      searchWeatherByQuery(query);
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
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function setupAccordions() {
  document.querySelectorAll(".accordion-card").forEach((card) => {
    const trigger = card.querySelector(".accordion-trigger");
    const content = card.querySelector(".accordion-content");

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      content.classList.toggle("is-open", !isOpen);
    });
  });
}

function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
}

function setStatus(message, type = "success") {
  searchStatus.textContent = message;
  searchStatus.classList.remove("status-success", "status-error");
  searchStatus.classList.add(type === "error" ? "status-error" : "status-success");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function searchWeatherByQuery(query) {
  try {
    setStatus(`Searching live weather for ${query}...`);
    locationInput.value = query;

    const geoResults = await fetchJson(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (!geoResults.length) {
      throw new Error("Location not found");
    }

    const match = geoResults[0];
    const displayName = formatLocation(match.name, match.state, match.country);

    await loadWeatherByCoordinates(match.lat, match.lon, displayName);
    setStatus(`Live weather updated for ${displayName}.`);
  } catch (error) {
    setStatus("Weather search failed. Try a different location name.", "error");
    weatherLocation.textContent = "Location not available";
    weatherDescription.textContent = error.message;
  }
}

async function loadWeatherByCoordinates(lat, lon, displayName) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;

  const [current, forecast, air] = await Promise.all([
    fetchJson(currentUrl),
    fetchJson(forecastUrl),
    fetchJson(airUrl)
  ]);

  renderCurrentWeather(current, displayName);
  renderForecast(forecast);
  renderAirQuality(air);
  renderLocationSnapshot(current, displayName);
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported by this browser.", "error");
    return;
  }

  setStatus("Requesting your current location...");

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const reverseGeo = await fetchJson(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1&appid=${WEATHER_API_KEY}`
        );

        const place = reverseGeo[0];
        const displayName = place
          ? formatLocation(place.name, place.state, place.country)
          : `Lat ${coords.latitude.toFixed(2)}, Lon ${coords.longitude.toFixed(2)}`;

        locationInput.value = displayName;
        await loadWeatherByCoordinates(coords.latitude, coords.longitude, displayName);
        setStatus(`Live weather updated for your current location.`);
      } catch (error) {
        setStatus("Could not load weather for your current location.", "error");
      }
    },
    () => {
      setStatus("Location access was blocked. You can still search manually.", "error");
    }
  );
}

function renderCurrentWeather(data, displayName) {
  const weather = data.weather?.[0] || {};
  const iconUrl = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : "";
  const tags = buildWeatherTags(data);

  weatherLocation.textContent = displayName;
  weatherDescription.textContent = capitalizeWords(weather.description || "No description available");
  weatherTemp.textContent = `${Math.round(data.main.temp)} deg C`;
  weatherRange.textContent = `High ${Math.round(data.main.temp_max)} deg / Low ${Math.round(data.main.temp_min)} deg`;
  weatherUpdated.textContent = `Updated ${new Date(data.dt * 1000).toLocaleString([], { hour: "numeric", minute: "2-digit" })}`;

  metricFeelsLike.textContent = `${Math.round(data.main.feels_like)} deg C`;
  metricHumidity.textContent = `${data.main.humidity}%`;
  metricWind.textContent = `${data.wind.speed.toFixed(1)} m/s`;
  metricVisibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  metricPressure.textContent = `${data.main.pressure} hPa`;
  metricClouds.textContent = `${data.clouds.all}%`;

  weatherIcon.src = iconUrl;
  weatherIcon.alt = weather.description || "Weather icon";
  weatherIcon.hidden = !iconUrl;

  weatherTags.innerHTML = tags.map((tag) => `<span class="weather-tag">${tag}</span>`).join("");
}

function buildWeatherTags(data) {
  const tags = [];

  if (data.wind.speed >= 10) {
    tags.push("Strong winds");
  } else {
    tags.push("Calmer wind pattern");
  }

  if (data.main.humidity >= 80) {
    tags.push("High humidity");
  }

  if (data.weather?.[0]?.main === "Rain" || data.weather?.[0]?.main === "Thunderstorm") {
    tags.push("Rain impact likely");
  }

  if (data.main.temp >= 35) {
    tags.push("Heat stress watch");
  } else if (data.main.temp <= 10) {
    tags.push("Cold conditions");
  } else {
    tags.push("Comfortable range");
  }

  return tags.slice(0, 4);
}

function renderForecast(data) {
  const dailyForecasts = pickDailyForecasts(data.list || []);
  forecastCaption.textContent = `5 day trend for ${data.city?.name || "this location"}`;

  forecastCards.innerHTML = dailyForecasts
    .map((item) => {
      const date = new Date(item.dt * 1000);
      const label = date.toLocaleDateString([], { weekday: "short" });
      const time = date.toLocaleTimeString([], { hour: "numeric" });
      return `
        <article class="forecast-card">
          <span>${label}</span>
          <strong>${Math.round(item.main.temp)} deg C</strong>
          <p>${capitalizeWords(item.weather?.[0]?.description || "Weather update")}</p>
          <span>${time}</span>
        </article>
      `;
    })
    .join("");
}

function pickDailyForecasts(list) {
  const byDate = new Map();

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0];
    const hourDelta = Math.abs(date.getHours() - 12);
    const existing = byDate.get(dayKey);

    if (!existing || hourDelta < existing.hourDelta) {
      byDate.set(dayKey, { item, hourDelta });
    }
  });

  return Array.from(byDate.values())
    .slice(0, 5)
    .map((entry) => entry.item);
}

function renderAirQuality(data) {
  const air = data.list?.[0];
  if (!air) {
    airQualityTitle.textContent = "Air quality unavailable";
    airQualityText.textContent = "The air quality feed did not return live values.";
    return;
  }

  const aqi = AQI_LABELS[air.main.aqi] || AQI_LABELS[1];
  airQualityTitle.textContent = `${aqi.label} air quality`;
  airQualityBadge.textContent = air.main.aqi;
  airQualityBadge.className = `air-badge ${aqi.className}`;
  airQualityText.textContent = aqi.text;
  airPm25.textContent = `PM2.5 ${roundValue(air.components.pm2_5)} ug/m3`;
  airPm10.textContent = `PM10 ${roundValue(air.components.pm10)} ug/m3`;
  airO3.textContent = `O3 ${roundValue(air.components.o3)} ug/m3`;
}

function renderLocationSnapshot(data, displayName) {
  const risk = determineWeatherRisk(data);
  snapshotLocation.textContent = displayName;
  snapshotImpact.textContent = risk.message;
}

function determineWeatherRisk(data) {
  const condition = data.weather?.[0]?.main || "";
  const wind = data.wind.speed || 0;
  const temp = data.main.temp || 0;

  if (condition === "Thunderstorm" || wind >= 15) {
    return {
      level: "high",
      message: "High caution: strong wind or storm signals suggest disruptions are possible."
    };
  }

  if (condition === "Rain" || condition === "Snow" || temp >= 35 || temp <= 5) {
    return {
      level: "medium",
      message: "Moderate caution: local weather may affect travel, outdoor work, or response planning."
    };
  }

  return {
    level: "low",
    message: "Lower current weather risk: conditions look relatively stable right now."
  };
}

async function loadAllFeeds() {
  await Promise.all([loadEarthquakeFeed(), loadEonetFeed("wildfires"), loadEonetFeed("severeStorms")]);
}

async function loadEarthquakeFeed() {
  try {
    const data = await fetchJson("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
    const quakes = (data.features || []).slice(0, HOME_FEED_LIMIT);

    earthquakeList.innerHTML = quakes
      .map((quake) => {
        const [lon, lat] = quake.geometry.coordinates;
        return `
          <li class="feed-item">
            <strong>${escapeHtml(quake.properties.place || "Unknown location")}</strong>
            <p>Magnitude ${roundValue(quake.properties.mag)} event recorded in the latest 24-hour seismic feed.</p>
            <div class="feed-meta">
              <span>${new Date(quake.properties.time).toLocaleString()}</span>
              <span>Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}</span>
              <a href="${quake.properties.url}" target="_blank" rel="noreferrer">Details</a>
            </div>
          </li>
        `;
      })
      .join("");

    animateNumber(earthquakeCount, data.features.length);
    snapshotEarthquake.textContent = classifyEarthquakePressure(data.features);
  } catch (error) {
    earthquakeList.innerHTML = '<li class="placeholder-item">Earthquake feed is unavailable right now.</li>';
    snapshotEarthquake.textContent = "Feed unavailable";
  }
}

async function loadEonetFeed(category) {
  const targetList = category === "wildfires" ? wildfireList : stormList;
  const targetCount = category === "wildfires" ? wildfireCount : stormCount;
  const targetSnapshot = category === "wildfires" ? snapshotWildfire : snapshotStorm;

  try {
    const data = await fetchJson(
      `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=${category}&status=open&limit=${HOME_FEED_LIMIT}`
    );

    const events = data.features || [];
    targetList.innerHTML = events.length
      ? events
          .map((event) => {
            const properties = event.properties || {};
            const geometry = event.geometry || {};
            const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
            const lon = typeof coordinates[0] === "number" ? coordinates[0].toFixed(2) : "--";
            const lat = typeof coordinates[1] === "number" ? coordinates[1].toFixed(2) : "--";
            const source = properties.sources?.[0];
            const eventDate = properties.date || properties.closed || new Date().toISOString();

            return `
              <li class="feed-item">
                <strong>${escapeHtml(properties.title || "Open event")}</strong>
                <p>${escapeHtml(properties.description || "Active event under monitoring. Open the full disaster page for expanded coverage and more categories.")}</p>
                <div class="feed-meta">
                  <span>${new Date(eventDate).toLocaleDateString()}</span>
                  <span>Lat ${lat}, Lon ${lon}</span>
                  ${
                    source?.url
                      ? `<a href="${source.url}" target="_blank" rel="noreferrer">Source update</a>`
                      : ""
                  }
                </div>
              </li>
            `;
          })
          .join("")
      : '<li class="placeholder-item">No open events were returned for this category.</li>';

    animateNumber(targetCount, events.length);
    targetSnapshot.textContent = classifyEventPressure(events.length, category);
  } catch (error) {
    targetList.innerHTML = '<li class="placeholder-item">This live feed is temporarily unavailable.</li>';
    targetSnapshot.textContent = "Feed unavailable";
  }
}

function classifyEarthquakePressure(features) {
  const count = features.length;
  const highMagnitude = features.some((feature) => (feature.properties.mag || 0) >= 6);

  if (highMagnitude || count >= 250) {
    return "Elevated activity";
  }
  if (count >= 100) {
    return "Active";
  }
  return "Steady";
}

function classifyEventPressure(count, category) {
  if (count >= 6) {
    return category === "wildfires" ? "High wildfire pressure" : "High storm pressure";
  }
  if (count >= 3) {
    return category === "wildfires" ? "Moderate wildfire pressure" : "Moderate storm pressure";
  }
  return category === "wildfires" ? "Limited wildfire activity" : "Limited storm activity";
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

function formatLocation(name, state, country) {
  return [name, state, country].filter(Boolean).join(", ");
}

function capitalizeWords(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function roundValue(value) {
  return Number(value).toFixed(1);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
