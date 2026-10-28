import { Router } from "express";
import { XMLParser } from "fast-xml-parser";
import { load } from "cheerio";
import { getGdacsEvents } from "../../services/providers.js";

const router = Router();
const FEED_URL = "https://earthobservatory.nasa.gov/feeds/image-of-the-day.rss";
const CACHE_MS = 20 * 60 * 1000;
const hazardWords =
  /wildfire|fire|flood|cyclone|storm|hurricane|typhoon|drought|heatwave|landslide|earthquake|tsunami|disaster|volcano|extreme weather/i;
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  processEntities: false,
  maxNestedTags: 200,
});
let feedCache = null;
let lastSuccessfulRefresh = null;
let lastError = "";

function valueOf(value) {
  return typeof value === "object" && value !== null
    ? value.__cdata || value["#text"] || ""
    : String(value || "");
}

function cleanSummary(value) {
  const $ = load(valueOf(value));
  $("p").each((_, element) => {
    if (/the post .+ appeared first on/i.test($(element).text())) $(element).remove();
  });
  return $.text().replace(/\s+/g, " ").trim();
}

function safeGdacsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["gdacs.org", "www.gdacs.org"].includes(url.hostname)
      ? url.toString()
      : "https://www.gdacs.org/";
  } catch {
    return "https://www.gdacs.org/";
  }
}

function categoryFor(text) {
  const value = text.toLowerCase();
  if (/wildfire|fire|smoke/.test(value)) return "Wildfire and smoke";
  if (/flood/.test(value)) return "Flood";
  if (/cyclone|hurricane|typhoon|storm/.test(value)) return "Severe weather";
  if (/drought|water/.test(value)) return "Drought";
  if (/landslide/.test(value)) return "Landslide";
  if (/earthquake|tsunami/.test(value)) return "Geological";
  if (/heatwave|heat/.test(value)) return "Extreme heat";
  if (/volcano/.test(value)) return "Volcanic activity";
  return "Disaster science";
}

function safeImageFromItem(item) {
  const markup = valueOf(item["content:encoded"]);
  if (!markup) return { url: null, alt: "", credit: null };
  const $ = load(markup);
  const figure = $("figure")
    .filter((_, element) => $(element).find("img").length > 0)
    .first();
  const image = figure.find("img").first();
  const src = image.attr("src");
  let url = null;
  try {
    const parsed = new URL(src);
    if (
      parsed.protocol === "https:" &&
      [
        "science.nasa.gov",
        "assets.science.nasa.gov",
        "images-assets.nasa.gov",
        "earthobservatory.nasa.gov",
      ].includes(parsed.hostname)
    )
      url = parsed.toString();
  } catch {
    url = null;
  }
  const articleText = $("body").text().replace(/\s+/g, " ").trim();
  const articleCredit = articleText.match(
    /NASA Earth Observatory images? (?:and charts? )?by [^.]+\./i
  )?.[0];
  const credit =
    figure.find("figcaption").text().replace(/\s+/g, " ").trim() || articleCredit || null;
  return { url: credit ? url : null, alt: image.attr("alt") || "", credit };
}

export function normalizeNasaStories(xml) {
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  return items
    .map((item) => {
      const title = valueOf(item.title).trim();
      const description = cleanSummary(item.description);
      const categories = (
        Array.isArray(item.category) ? item.category : item.category ? [item.category] : []
      ).map(valueOf);
      const searchable = `${title} ${description} ${categories.join(" ")}`;
      if (!hazardWords.test(searchable)) return null;
      const originalUrl = valueOf(item.link).trim();
      if (!originalUrl.startsWith("https://science.nasa.gov/")) return null;
      const date = new Date(valueOf(item.pubDate));
      const image = safeImageFromItem(item);
      return {
        id: `nasa-${Buffer.from(originalUrl).toString("base64url").slice(-18)}`,
        title,
        summary: description,
        category: categoryFor(searchable),
        location: null,
        publishedAt: Number.isNaN(date.getTime()) ? null : date.toISOString(),
        eventAt: null,
        originalUrl,
        publisher: "NASA Earth Observatory",
        imageUrl: image.url,
        imageAlt: image.alt || `${title} — NASA Earth Observatory image`,
        imageCredit: image.credit,
        imageLicenseNote: image.url
          ? "Image and caption are reproduced from the linked NASA Earth Observatory story; review the original page for any third-party credits and rights."
          : null,
        sourceType: "published-story",
      };
    })
    .filter(Boolean)
    .slice(0, 12);
}

async function refreshFeed() {
  if (feedCache && Date.now() - feedCache.refreshedAt < CACHE_MS) return feedCache;
  const [storiesResult, eventsResult] = await Promise.allSettled([
    (async () => {
      const response = await fetch(FEED_URL, {
        headers: { "User-Agent": "AtmosWatch-Education/1.0 (disaster learning hub)" },
        signal: AbortSignal.timeout(9000),
      });
      if (!response.ok) throw new Error(`NASA feed returned HTTP ${response.status}`);
      const xml = await response.text();
      if (xml.length > 5_000_000) throw new Error("NASA feed response exceeded the size limit");
      return normalizeNasaStories(xml);
    })(),
    getGdacsEvents({ limit: 24 }),
  ]);
  const stories = storiesResult.status === "fulfilled" ? storiesResult.value : null;
  const events =
    eventsResult.status === "fulfilled"
      ? eventsResult.value.map((event) => ({ ...event, sourceUrl: safeGdacsUrl(event.sourceUrl) }))
      : null;
  const sourceErrors = [
    storiesResult.status === "rejected"
      ? {
          source: "NASA Earth Observatory",
          message: storiesResult.reason?.message || "Source unavailable",
        }
      : null,
    eventsResult.status === "rejected"
      ? { source: "GDACS", message: eventsResult.reason?.message || "Source unavailable" }
      : null,
  ].filter(Boolean);
  lastError = sourceErrors.map(({ source, message }) => `${source}: ${message}`).join("; ");
  if (!stories && !events) {
    lastError = `Disaster story and event providers are temporarily unavailable. ${lastError}`;
    if (feedCache)
      return { ...feedCache, stale: true, partial: true, error: lastError, sourceErrors };
    throw Object.assign(new Error(lastError), { status: 502, code: "DISASTER_FEED_UNAVAILABLE" });
  }
  lastSuccessfulRefresh = new Date().toISOString();
  feedCache = {
    stories: stories || feedCache?.stories || [],
    events: events || feedCache?.events || [],
    refreshedAt: Date.now(),
    fetchedAt: lastSuccessfulRefresh,
    partial: !stories || !events,
    sourceErrors,
  };
  return feedCache;
}

router.get("/disaster-updates", async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(50, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(24, Number.parseInt(req.query.limit, 10) || 12));
    const query = String(req.query.q || "")
      .trim()
      .slice(0, 100)
      .toLowerCase();
    const category = String(req.query.category || "")
      .trim()
      .toLowerCase();
    const data = await refreshFeed();
    const filtered = data.stories.filter((story) => {
      const matchesQuery =
        !query ||
        `${story.title} ${story.summary} ${story.category} ${story.publisher}`
          .toLowerCase()
          .includes(query);
      return matchesQuery && (!category || story.category.toLowerCase() === category);
    });
    res.set("Cache-Control", "public, max-age=120");
    res.json({
      stories: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page,
      limit,
      events: data.events,
      lastSuccessfulUpdate: data.fetchedAt,
      stale: Boolean(data.stale),
      partial: Boolean(data.partial),
      error: data.error || null,
      sourceErrors: data.sourceErrors || [],
      sources: [
        {
          name: "NASA Earth Observatory",
          url: "https://earthobservatory.nasa.gov/",
          status: data.sourceErrors.some((error) => error.source === "NASA Earth Observatory")
            ? "unavailable"
            : data.stories.length
              ? "available"
              : "no-matching-stories",
        },
        {
          name: "GDACS",
          url: "https://www.gdacs.org/",
          status: data.sourceErrors.some((error) => error.source === "GDACS")
            ? "unavailable"
            : data.events.length
              ? "available"
              : "no-current-events",
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

router.get("/disaster-sources/status", (_req, res) => {
  res.json({
    lastSuccessfulUpdate: lastSuccessfulRefresh,
    cacheAgeSeconds: feedCache ? Math.round((Date.now() - feedCache.refreshedAt) / 1000) : null,
    stale: Boolean(feedCache && Date.now() - feedCache.refreshedAt >= CACHE_MS),
    lastError: lastError || null,
    sources: [
      { name: "NASA Earth Observatory RSS", configured: true, url: FEED_URL },
      {
        name: "GDACS events API",
        configured: true,
        url: "https://www.gdacs.org/gdacsapi/swagger/index.html",
      },
      {
        name: "ReliefWeb reports API",
        configured: false,
        reason: "Read API integration requires an approved appname; none is configured.",
        url: "https://apidoc.reliefweb.int/",
      },
    ],
  });
});

export default router;
