import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clapperboard, ExternalLink, Image, Pencil, Plus, Save, Trash2, Video, X } from "lucide-react";
import { api, useRequest } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Panel, SectionTitle, StatusBadge } from "../components/ui.jsx";

const categories = [
  "Earthquake",
  "Flood",
  "Cyclone and storms",
  "Wildfire",
  "Landslide",
  "Extreme heat",
  "Tsunami",
  "Chemical safety",
  "General preparedness",
];

const blankForm = {
  title: "",
  description: "",
  category: "General preparedness",
  mediaType: "animation",
  mediaUrl: "",
  altText: "",
  sourceName: "AtmosWatch",
  sourceUrl: "",
  status: "published",
};

function youtubeEmbed(value) {
  try {
    const url = new URL(value);
    if (["youtu.be"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (["vimeo.com", "www.vimeo.com"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

function VisualMedia({ item }) {
  const safeEmbed = item.mediaType === "video" ? youtubeEmbed(item.mediaUrl) : null;
  const isDirectVideo = /\.(mp4|webm|ogv)(?:[?#]|$)/i.test(item.mediaUrl);
  if (safeEmbed) {
    return (
      <div className="visual-media visual-embed">
        <iframe
          src={safeEmbed}
          title={item.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  if (item.mediaType === "video" || isDirectVideo) {
    return (
      <div className="visual-media">
        <video controls preload="metadata" aria-label={item.title}>
          <source src={item.mediaUrl} />
          Your browser does not support embedded video.
        </video>
      </div>
    );
  }
  return (
    <div className="visual-media">
      <img
        src={item.mediaUrl}
        alt={item.altText || item.title}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      {item.mediaType === "animation" && <span className="visual-type-pill"><Clapperboard size={13} /> Animation / GIF</span>}
    </div>
  );
}

function VisualCard({ item, canManage, onEdit, onDelete }) {
  const Icon = item.mediaType === "video" ? Video : item.mediaType === "image" ? Image : Clapperboard;
  return (
    <article className="visual-card">
      <VisualMedia item={item} />
      <div className="visual-card-body">
        <div className="visual-card-topline">
          <span className="visual-category">{item.category}</span>
          <StatusBadge tone={item.status === "published" ? "green" : "amber"}>
            {item.status === "published" ? "Published" : "Draft"}
          </StatusBadge>
        </div>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        <div className="visual-card-meta"><Icon size={14} /> {item.mediaType} · {item.sourceName || "AtmosWatch"}</div>
        <div className="visual-card-actions">
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              Source <ExternalLink size={13} />
            </a>
          )}
          {canManage && item.canEdit && (
            <div className="visual-editor-actions">
              <button type="button" className="button button-outline button-small" onClick={() => onEdit(item)}>
                <Pencil size={13} /> Edit
              </button>
              <button type="button" className="button button-outline button-small danger-outline" onClick={() => onDelete(item)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function VisualLibraryPage() {
  const { user } = useAuth();
  const canManage = ["ADMIN", "INSTRUCTOR"].includes(user?.role);
  const visuals = useRequest(() => api("/visuals"), []);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "General preparedness",
      mediaType: item.mediaType || "animation",
      mediaUrl: item.mediaUrl || "",
      altText: item.altText || "",
      sourceName: item.sourceName || "AtmosWatch",
      sourceUrl: item.sourceUrl || "",
      status: item.status || "draft",
    });
    setMessage("");
    setError("");
    document.getElementById("visual-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId("");
    setForm(blankForm);
    setError("");
    setMessage("");
  }

  async function saveVisual(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      );
      const result = await api(editingId ? `/visuals/${editingId}` : "/visuals", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      setMessage(editingId ? "Visual updated." : "Visual added to the library.");
      setEditingId("");
      setForm(blankForm);
      await visuals.refresh();
    } catch (err) {
      setError(err.message || "The visual could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVisual(item) {
    if (!window.confirm(`Delete “${item.title}” from the visual library?`)) return;
    setError("");
    setMessage("");
    try {
      await api(`/visuals/${item.id}`, { method: "DELETE" });
      setMessage("Visual deleted.");
      if (editingId === item.id) cancelEdit();
      await visuals.refresh();
    } catch (err) {
      setError(err.message || "The visual could not be deleted.");
    }
  }

  const items = visuals.data?.items || [];
  const publishedCount = items.filter((item) => item.status === "published").length;

  return (
    <div className="visual-library-page">
      <PageHeader
        eyebrow="Visual learning studio"
        title="Visual learning library"
        description="Explore animated safety lessons, short videos, and credited visual explainers. Instructors manage their institution's materials; administrators can manage platform-wide content."
        actions={
          <Link className="button button-primary" to="/learning/disasters">
            <Clapperboard size={16} /> Open animated lessons <ArrowRight size={15} />
          </Link>
        }
      />

      <section className="visual-featured">
        <div className="visual-featured-icon"><Clapperboard size={25} /></div>
        <div className="visual-featured-copy">
          <span className="visual-eyebrow">ORIGINAL ATMOSWATCH SCENARIOS</span>
          <h2>Practice the right action before an emergency</h2>
          <p>Fourteen hazard pathways include animated decision scenarios, captions, accessible transcripts, and learning checkpoints. Student progress is saved to the learner's account.</p>
          <div className="visual-featured-stats">
            <span><CheckCircle2 size={15} /> 14 hazard topics</span>
            <span><Clapperboard size={15} /> 70 animated scenarios</span>
          </div>
        </div>
        <Link className="button button-outline" to="/learning/disasters">
          Explore lessons <ArrowRight size={15} />
        </Link>
      </section>

      {error && <ErrorState message={error} />}
      {message && <div className="visual-notice" role="status">{message}</div>}
      {visuals.error && <ErrorState message={visuals.error} onRetry={visuals.refresh} />}

      {canManage && (
        <div id="visual-editor"><Panel className="visual-editor-panel">
          <SectionTitle
            title={editingId ? "Edit visual content" : "Add visual content"}
            description={user?.role === "ADMIN"
              ? "Publish platform-wide visual content or target an institution."
              : "New content is scoped to your assigned institution."}
          />
          <form className="visual-editor-form" onSubmit={saveVisual}>
            <label className="field">
              <span>Title</span>
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} required minLength={3} maxLength={120} placeholder="e.g. Flood evacuation animation" />
            </label>
            <label className="field">
              <span>Hazard category</span>
              <select value={form.category} onChange={(event) => setField("category", event.target.value)}>
                {categories.map((category) => <option value={category} key={category}>{category}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Media type</span>
              <select value={form.mediaType} onChange={(event) => setField("mediaType", event.target.value)}>
                <option value="animation">Animation / GIF</option>
                <option value="video">Video</option>
                <option value="image">Image / infographic</option>
              </select>
            </label>
            <label className="field">
              <span>HTTPS media URL</span>
              <input type="url" value={form.mediaUrl} onChange={(event) => setField("mediaUrl", event.target.value)} required placeholder="https://…" />
              <small>Use an HTTPS image/GIF URL, direct MP4/WebM URL, or YouTube/Vimeo link.</small>
            </label>
            <label className="field visual-editor-wide">
              <span>Description</span>
              <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} maxLength={1800} rows={3} placeholder="What should learners notice or practise?" />
            </label>
            <label className="field">
              <span>Accessible image description</span>
              <input value={form.altText} onChange={(event) => setField("altText", event.target.value)} maxLength={250} placeholder="Describe the key visual information" />
            </label>
            <label className="field">
              <span>Source / creator</span>
              <input value={form.sourceName} onChange={(event) => setField("sourceName", event.target.value)} maxLength={120} placeholder="Organization or creator" />
            </label>
            <label className="field">
              <span>Source page (optional)</span>
              <input type="url" value={form.sourceUrl} onChange={(event) => setField("sourceUrl", event.target.value)} placeholder="https://…" />
            </label>
            <label className="field">
              <span>Publication status</span>
              <select value={form.status} onChange={(event) => setField("status", event.target.value)}>
                <option value="draft">Save as draft</option>
                <option value="published">Publish for students</option>
              </select>
            </label>
            <div className="visual-editor-buttons visual-editor-wide">
              <Button type="submit" disabled={saving}>
                <Save size={15} /> {saving ? "Saving…" : editingId ? "Save changes" : "Add visual"}
              </Button>
              {editingId && <Button type="button" variant="secondary" onClick={cancelEdit}><X size={15} /> Cancel edit</Button>}
            </div>
          </form>
        </Panel></div>
      )}

      <section className="visual-gallery-section">
        <div className="visual-gallery-heading">
          <div>
            <span className="visual-eyebrow">CURATED MEDIA</span>
            <h2>Visual resources</h2>
            <p>{canManage ? "Manage your available drafts and published visual learning resources." : "Published visual resources selected for your learning workspace."}</p>
          </div>
          <span className="visual-gallery-count">{canManage ? `${publishedCount} published · ${items.length} total` : `${items.length} resources`}</span>
        </div>
        {visuals.loading ? (
          <LoadingState label="Loading visual learning resources" />
        ) : items.length ? (
          <div className="visual-card-grid">
            {items.map((item) => (
              <VisualCard key={item.id} item={item} canManage={canManage} onEdit={startEdit} onDelete={deleteVisual} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clapperboard}
            title={canManage ? "No extra visual resources yet" : "New visual resources are coming"}
            description={canManage
              ? "Add a credited image, animation, GIF, or video above. Publish it to make it visible to students."
              : "Your animated disaster scenarios are ready in the Disaster Learning Hub. New published visuals from your instructor will appear here."}
            action={<Link className="button button-outline" to="/learning/disasters">Open animated disaster lessons <ArrowRight size={15} /></Link>}
          />
        )}
      </section>
    </div>
  );
}
