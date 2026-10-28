const cache = new Map();
const TTL = 5 * 60 * 1000;

async function cachedJson(key, url, ttl = TTL) {
  const previous = cache.get(key);
  if (previous && previous.expires > Date.now()) return previous.value;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: {
      "User-Agent":
        "AtmosWatch-Education/1.0 (school preparedness; contact via project repository)",
    },
  });
  if (!response.ok)
    throw Object.assign(new Error("A data provider is temporarily unavailable."), {
      status: 502,
      code: "PROVIDER_UNAVAILABLE",
    });
  const value = await response.json();
  cache.set(key, { value, expires: Date.now() + ttl });
  return value;
}

export async function getEarthquakes({ minMagnitude = 0, limit = 50, fromDate, toDate } = {}) {
  const queryUrl = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");
  queryUrl.search = new URLSearchParams({
    format: "geojson",
    starttime: `${fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}T00:00:00`,
    endtime: `${toDate || new Date().toISOString().slice(0, 10)}T23:59:59`,
    minmagnitude: String(minMagnitude),
    orderby: "time",
    limit: String(Math.min(1000, limit)),
  }).toString();
  const data = await cachedJson(`usgs-${queryUrl.search}`, queryUrl.toString());
  const from = fromDate ? new Date(`${fromDate}T00:00:00Z`).getTime() : -Infinity;
  const until = toDate ? new Date(`${toDate}T23:59:59.999Z`).getTime() : Infinity;
  return (data.features || [])
    .filter(
      (feature) =>
        Number(feature.properties?.mag || 0) >= minMagnitude &&
        Number(feature.properties?.time) >= from &&
        Number(feature.properties?.time) <= until
    )
    .slice(0, limit)
    .map((feature) => ({
      id: feature.id,
      hazard: "earthquake",
      title: feature.properties?.place || "Earthquake event",
      magnitude: feature.properties?.mag,
      occurredAt: feature.properties?.time ? new Date(feature.properties.time).toISOString() : null,
      updatedAt: feature.properties?.updated
        ? new Date(feature.properties.updated).toISOString()
        : null,
      coordinates: feature.geometry?.coordinates
        ? {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            depthKm: feature.geometry.coordinates[2],
          }
        : null,
      sourceUrl: feature.properties?.url,
      source: "USGS",
      severity:
        Number(feature.properties?.mag || 0) >= 6
          ? "high"
          : Number(feature.properties?.mag || 0) >= 4
            ? "moderate"
            : "information",
      dataType: "observation",
    }));
}

export async function getGdacsEvents({ type, alertLevel, limit = 50, fromDate, toDate } = {}) {
  const now = new Date();
  const from =
    fromDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = toDate || now.toISOString().slice(0, 10);
  const query = new URLSearchParams({
    eventlist: "EQ;TC;FL;VO;DR;WF",
    fromDate: from,
    toDate: to,
    alertlevel: "Green;Orange;Red",
    pageSize: "100",
    pageNumber: "1",
  });
  const data = await cachedJson(
    `gdacs-${from}-${to}`,
    `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?${query}`
  );
  const features = Array.isArray(data.features) ? data.features : [];
  const eventCodes = {
    earthquake: "EQ",
    cyclone: "TC",
    flood: "FL",
    volcano: "VO",
    drought: "DR",
    wildfire: "WF",
  };
  const requestedType = eventCodes[type?.toLowerCase()] || type?.toUpperCase();
  return features
    .filter((feature) => {
      const props = feature.properties || {};
      return (
        (!requestedType || props.eventtype?.toUpperCase() === requestedType) &&
        (!alertLevel || props.alertlevel?.toLowerCase() === alertLevel.toLowerCase())
      );
    })
    .slice(0, limit)
    .map((feature) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates;
      return {
        id: `gdacs-${props.eventid || props.eventtype + props.fromdate}`,
        hazard:
          {
            EQ: "earthquake",
            TC: "cyclone",
            FL: "flood",
            VO: "volcano",
            DR: "drought",
            WF: "wildfire",
          }[props.eventtype] || "other",
        title: props.name || props.eventname || `${props.eventtype || "Hazard"} event`,
        description:
          props.description ||
          props.alertleveldescription ||
          "See the original GDACS event page for current details.",
        occurredAt: props.fromdate || null,
        updatedAt: props.todate || props.datemodified || null,
        coordinates: Array.isArray(coords) ? { longitude: coords[0], latitude: coords[1] } : null,
        sourceUrl: props.url?.report || props.url?.geometry || "https://www.gdacs.org/",
        source: "GDACS",
        severity: props.alertlevel?.toLowerCase() || "information",
        dataType: "observation",
      };
    });
}

export async function searchWeather(location) {
  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.search = new URLSearchParams({
    name: location,
    count: "1",
    language: "en",
    format: "json",
  }).toString();
  const geo = await cachedJson(`geo-${location.toLowerCase()}`, geoUrl);
  const place = geo.results?.[0];
  if (!place)
    throw Object.assign(new Error("Location was not found. Try a city or district name."), {
      status: 404,
      code: "LOCATION_NOT_FOUND",
    });
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: "5",
    timezone: "auto",
  });
  const [weather, air] = await Promise.all([
    cachedJson(
      `weather-${place.latitude}-${place.longitude}`,
      `https://api.open-meteo.com/v1/forecast?${params}`
    ),
    cachedJson(
      `air-${place.latitude}-${place.longitude}`,
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}&hourly=pm10,pm2_5,ozone,european_aqi&forecast_days=1&timezone=auto`
    ),
  ]);
  const referenceTime = new Date(weather.current?.time || Date.now()).getTime();
  const airIndex = (air.hourly?.time || []).reduce((closest, time, index, values) => {
    if (closest < 0) return index;
    return Math.abs(new Date(time).getTime() - referenceTime) <
      Math.abs(new Date(values[closest]).getTime() - referenceTime)
      ? index
      : closest;
  }, -1);
  return {
    location: {
      name: place.name,
      admin1: place.admin1,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: weather.timezone,
    },
    current: weather.current,
    daily: weather.daily,
    airQuality:
      airIndex >= 0
        ? {
            time: air.hourly.time?.[airIndex],
            pm10: air.hourly.pm10?.[airIndex],
            pm25: air.hourly.pm2_5?.[airIndex],
            ozone: air.hourly.ozone?.[airIndex],
            europeanAqi: air.hourly.european_aqi?.[airIndex],
          }
        : null,
    sources: [
      { name: "Open-Meteo Weather Forecast API", url: "https://open-meteo.com/en/docs" },
      { name: "Open-Meteo Air Quality API", url: "https://open-meteo.com/en/docs/air-quality-api" },
    ],
    dataType: "forecast-and-modelled-observation",
    updatedAt: weather.current?.time || null,
  };
}

export const sourceCatalog = [
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Hazards Program",
    type: "live-observation",
    hazards: ["earthquake"],
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    attribution: "USGS",
    credentials: false,
  },
  {
    id: "gdacs",
    name: "Global Disaster Alert and Coordination System",
    type: "live-observation",
    hazards: ["earthquake", "cyclone", "flood", "volcano", "drought", "wildfire"],
    url: "https://www.gdacs.org/gdacsapi/swagger/index.html",
    attribution: "Global Disaster Awareness and Coordination System, GDACS",
    credentials: false,
  },
  {
    id: "open-meteo-weather",
    name: "Open-Meteo Weather Forecast API",
    type: "forecast",
    hazards: ["weather", "heat", "wind", "precipitation"],
    url: "https://open-meteo.com/en/docs",
    attribution: "Open-Meteo; provider model sources vary by location",
    credentials: false,
  },
  {
    id: "open-meteo-air",
    name: "Open-Meteo Air Quality API",
    type: "forecast",
    hazards: ["air-quality", "smoke"],
    url: "https://open-meteo.com/en/docs/air-quality-api",
    attribution: "Open-Meteo and its underlying model sources",
    credentials: false,
  },
  {
    id: "nasa-firms",
    name: "NASA FIRMS Active Fire Data",
    type: "satellite-detection",
    hazards: ["wildfire"],
    url: "https://firms.modaps.eosdis.nasa.gov/content/active_fire/",
    attribution: "NASA FIRMS",
    credentials: true,
    configured: false,
    integrationStatus: "not-integrated",
  },
];
