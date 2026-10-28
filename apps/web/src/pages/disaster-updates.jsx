import { useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  Image,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Wind,
} from "lucide-react";
import { api, useRequest } from "../lib/api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "../components/ui.jsx";

function formatDate(value) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not provided"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date) + " UTC";
}

function ArticleSourceBadge({ name }) {
  return <span className="article-source-badge">{name}</span>;
}

function PublicationTimestamp({ publishedAt }) {
  return (
    <span className="article-timestamp">
      <Clock3 size={14} /> Published {formatDate(publishedAt)}
    </span>
  );
}

function ImageAttribution({ article }) {
  if (!article.imageUrl || !article.imageCredit) return null;
  return <span className="image-attribution">Image credit: {article.imageCredit}</span>;
}

function DisasterArticleCard({ article }) {
  return (
    <article className="disaster-article-card">
      <a
        href={article.originalUrl}
        target="_blank"
        rel="noreferrer"
        className="article-image-link"
        aria-label={`Open original story: ${article.title}`}
      >
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.imageAlt || article.title} loading="lazy" />
        ) : (
          <span className="article-image-placeholder">
            <Image size={26} />
            <span>Image not provided by source</span>
          </span>
        )}
        <StatusBadge tone="blue">{article.category}</StatusBadge>
      </a>
      <div className="disaster-article-content">
        <div className="article-source-line">
          <ArticleSourceBadge name={article.publisher} />
          <PublicationTimestamp publishedAt={article.publishedAt} />
        </div>
        <h2>
          <a href={article.originalUrl} target="_blank" rel="noreferrer">
            {article.title}
          </a>
        </h2>
        <p>{article.summary}</p>
        {article.location && (
          <span className="article-location">
            <MapPin size={14} /> {article.location}
          </span>
        )}
        <ImageAttribution article={article} />
        {article.imageLicenseNote && (
          <small className="article-license-note">{article.imageLicenseNote}</small>
        )}
        <a
          className="article-original-link"
          href={article.originalUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read original story <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}

function DisasterEventRow({ event }) {
  return (
    <article className="disaster-event-row">
      <span className="event-type-icon">
        <Wind size={18} />
      </span>
      <div className="event-row-main">
        <span className="disaster-kicker">
          {event.hazard?.replaceAll("-", " ") || "Reported event"} · {event.source}
        </span>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <span className="article-timestamp">
          Event date {formatDate(event.occurredAt)}
          {event.updatedAt ? ` · Updated ${formatDate(event.updatedAt)}` : ""}
        </span>
      </div>
      <div className="event-row-meta">
        <StatusBadge
          tone={
            event.severity === "red" || event.severity === "high"
              ? "red"
              : event.severity === "orange" || event.severity === "moderate"
                ? "amber"
                : "blue"
          }
        >
          {event.severity || "Information"}
        </StatusBadge>
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${event.source} event`}
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </article>
  );
}

function NewsFeedStatus({ data, onRefresh, loading }) {
  return (
    <div className="news-feed-status">
      <div>
        <span className={`feed-status-mark ${data?.stale ? "stale" : ""}`} />
        {data?.stale
          ? "Showing cached source data"
          : data?.partial
            ? "Some sources are temporarily unavailable"
            : "Sources checked successfully"}
        <span className="news-updated">
          Last successful update: {formatDate(data?.lastSuccessfulUpdate)}
        </span>
      </div>
      <button
        type="button"
        className="icon-button news-refresh"
        title="Refresh disaster updates"
        aria-label="Refresh disaster updates"
        disabled={loading}
        onClick={onRefresh}
      >
        <RefreshCw size={17} className={loading ? "spin" : ""} />
      </button>
    </div>
  );
}

export function DisasterUpdatesPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const { data, loading, error, refresh } = useRequest(() => {
    const params = new URLSearchParams({ limit: "12" });
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    return api(`/public/disaster-updates?${params.toString()}`);
  }, [query, category]);
  const categories = useMemo(
    () => [...new Set((data?.stories || []).map((story) => story.category))],
    [data?.stories]
  );

  return (
    <main className="public-content disaster-updates-page">
      <PageHeader
        eyebrow="PUBLIC · RECENTLY PUBLISHED REPORTS"
        title="Disaster Watch"
        description="Photo stories and event updates from NASA Earth Observatory and GDACS. A published story is not a live camera or an official local warning."
      />
      <NewsFeedStatus data={data} onRefresh={refresh} loading={loading} />
      <div className="disaster-news-sources">
        {(
          data?.sources || [
            { name: "NASA Earth Observatory", status: "waiting" },
            { name: "GDACS", status: "waiting" },
          ]
        ).map((source) => (
          <span key={source.name}>
            <strong>{source.name}</strong>
            <StatusBadge
              tone={
                source.status === "available"
                  ? "green"
                  : source.status === "waiting"
                    ? "gray"
                    : "amber"
              }
            >
              {source.status}
            </StatusBadge>
          </span>
        ))}
      </div>
      {data?.error && (
        <p className="news-source-warning" role="status">
          {data.error} The feed shows only data from sources that responded successfully.
        </p>
      )}
      <section className="disaster-news-section">
        <div className="disaster-news-heading">
          <div>
            <span className="disaster-kicker">NASA EARTH OBSERVATORY</span>
            <h2>Latest published disaster stories</h2>
            <p>
              Article publication dates are shown separately from any event dates stated by the
              publisher.
            </p>
          </div>
          <span className="news-story-count">{data?.total ?? 0} stories</span>
        </div>
        <form
          className="disaster-news-filters"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
          }}
        >
          <label className="disaster-search">
            <Search size={17} />
            <span className="sr-only">Search disaster stories</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stories"
            />
          </label>
          <button className="button button-outline" type="submit">
            Search
          </button>
          <label className="disaster-select">
            <span className="sr-only">Filter stories by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All story categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </form>
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading && !data ? (
          <LoadingState label="Loading published disaster stories" />
        ) : data?.stories?.length ? (
          <div className="disaster-article-grid">
            {data.stories.map((article) => (
              <DisasterArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldAlert}
            title="No matching disaster stories"
            description="The selected source has no recent story matching this search. Try another term or open the publisher's official page."
            action={
              <a
                href="https://earthobservatory.nasa.gov/"
                className="button button-outline"
                target="_blank"
                rel="noreferrer"
              >
                Open NASA Earth Observatory <ArrowRight size={15} />
              </a>
            }
          />
        )}
      </section>
      <section className="disaster-news-section disaster-live-events">
        <div className="disaster-news-heading">
          <div>
            <span className="disaster-kicker">GDACS EVENT DATA</span>
            <h2>Recently updated disaster events</h2>
            <p>
              Event metadata only. GDACS is an international situational-awareness source, not a
              local emergency authority.
            </p>
          </div>
          <span className="news-story-count">{data?.events?.length || 0} events</span>
        </div>
        {loading && !data ? (
          <LoadingState label="Loading GDACS events" />
        ) : data?.events?.length ? (
          <div className="disaster-event-list">
            {data.events.slice(0, 12).map((event) => (
              <DisasterEventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No current events returned"
            description="The source returned no events for its configured recent window."
          />
        )}
      </section>
      <p className="news-feed-disclaimer">
        AtmosWatch republishes article metadata and credited source imagery; follow the linked
        publisher for full reporting, image-specific credits and context. Do not use this page to
        make emergency decisions. Follow NDMA, IMD, local authorities, and institutional plans.
      </p>
    </main>
  );
}
