import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  CloudLightning,
  DoorOpen,
  Factory,
  Flame,
  FlaskConical,
  Mountain,
  Play,
  Pause,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";
import { api, useRequest } from "../lib/api.js";
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
  SectionTitle,
  StatusBadge,
} from "../components/ui.jsx";

const iconMap = {
  activity: Activity,
  waves: Waves,
  flame: Flame,
  "cloud-lightning": CloudLightning,
  mountain: Mountain,
  sun: Sun,
  "flask-conical": FlaskConical,
  "shield-plus": ShieldPlus,
  factory: Factory,
  "door-open": DoorOpen,
};

export function DisasterLearningHubPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [level, setLevel] = useState("All levels");
  const { data, loading, error, refresh } = useRequest(() => api("/learning/disasters"), []);
  const topics = data?.items || [];
  const categories = ["All topics", ...new Set(topics.map((topic) => topic.category))];
  const filtered = topics.filter((topic) => {
    const matchesText = `${topic.title} ${topic.overview} ${topic.category}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return (
      matchesText &&
      (category === "All topics" || topic.category === category) &&
      (level === "All levels" || topic.level === level)
    );
  });
  const completed = topics.filter((topic) => topic.progress.percent === 100).length;
  const continueTopic =
    topics.find((topic) => topic.progress.percent > 0 && topic.progress.percent < 100) ||
    topics.find((topic) => topic.progress.percent < 100);
  const recommended = topics.filter((topic) => topic.progress.percent < 100).slice(0, 3);

  return (
    <div className="disaster-hub-page">
      <PageHeader
        eyebrow="Authenticated learning"
        title="Disaster Learning Hub"
        description="Practical, sourced learning for safer decisions before, during, and after emergencies. Use local authority guidance and your institution's approved plan for real incidents."
        actions={
          continueTopic && (
            <Link
              to={`/learning/disasters/${continueTopic.slug}`}
              className="button button-primary"
            >
              <BookOpenCheck size={16} /> Continue learning
            </Link>
          )
        }
      />
      <div className="disaster-progress-overview">
        <div>
          <span className="disaster-kicker">YOUR LEARNING</span>
          <strong>
            {completed} of {topics.length} topics complete
          </strong>
          <ProgressBar
            label="Disaster topic progress"
            value={topics.length ? (completed / topics.length) * 100 : 0}
          />
        </div>
        <div className="disaster-progress-meta">
          <span>
            <CheckCircle2 size={17} />
            {topics.reduce((sum, topic) => sum + topic.progress.completed, 0)} lessons and scenarios
            complete
          </span>
          <span>
            <Activity size={17} />
            {topics.filter((topic) => topic.progress.quizScore !== null).length} topic checks
            recorded
          </span>
        </div>
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      {loading ? (
        <LoadingState label="Loading disaster topics" />
      ) : !topics.length ? (
        <EmptyState
          title="Learning topics are unavailable"
          description="Please retry in a moment."
          action={<Button onClick={refresh}>Retry</Button>}
        />
      ) : (
        <>
          {recommended.length > 0 && (
            <section className="disaster-recommended">
              <SectionTitle
                title="Recommended next"
                description="Continue a topic you have started, or begin a core safety pathway."
              />
              <div className="disaster-recommendation-list">
                {recommended.map((topic) => (
                  <Link
                    key={topic.slug}
                    to={`/learning/disasters/${topic.slug}`}
                    className="disaster-recommendation"
                  >
                    <span className="disaster-topic-icon">
                      <BookOpenCheck size={18} />
                    </span>
                    <span>
                      <strong>{topic.title}</strong>
                      <small>
                        {topic.progress.percent
                          ? `${topic.progress.percent}% complete`
                          : `${topic.scenarios.length} animated scenario lessons`}
                      </small>
                    </span>
                    <ArrowRight size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="disaster-library" aria-labelledby="disaster-library-title">
            <div className="disaster-library-heading">
              <div>
                <h2 id="disaster-library-title">Browse the library</h2>
                <p>Fourteen topic pathways, each with five original animated learning scenarios.</p>
              </div>
              <div className="disaster-library-count">{filtered.length} topics</div>
            </div>
            <div className="disaster-filter-bar">
              <label className="disaster-search">
                <Search size={17} />
                <span className="sr-only">Search disaster topics</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search hazards or guidance"
                />
              </label>
              <label className="disaster-select">
                <span className="sr-only">Filter by hazard category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </label>
              <div className="disaster-segment" role="group" aria-label="Filter by learning level">
                {["All levels", "Beginner", "Advanced"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={level === item}
                    className={level === item ? "selected" : ""}
                    onClick={() => setLevel(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length ? (
              <div className="disaster-topic-list">
                {filtered.map((topic) => (
                  <DisasterTopicRow key={topic.slug} topic={topic} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matching topics"
                description="Try a different keyword or category."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function DisasterTopicRow({ topic }) {
  const Icon = iconMap[topic.icon] || ShieldCheck;
  return (
    <Link to={`/learning/disasters/${topic.slug}`} className="disaster-topic-row">
      <span className="disaster-topic-icon">
        <Icon size={19} />
      </span>
      <span className="disaster-topic-copy">
        <span className="disaster-topic-eyebrow">
          {topic.category} · {topic.level}
        </span>
        <strong>{topic.title}</strong>
        <span>{topic.overview}</span>
        <span className="disaster-topic-meta">
          <span>
            <BookOpenCheck size={14} /> {topic.lessons.length} lessons
          </span>
          <span>
            <Sparkles size={14} /> {topic.scenarios.length} animations
          </span>
          <span>
            <Clock3 size={14} /> {topic.progress.completed}/{topic.progress.total} complete
          </span>
        </span>
        <ProgressBar label={`${topic.title} progress`} value={topic.progress.percent} />
      </span>
      <span className="disaster-topic-right">
        <StatusBadge
          tone={topic.progress.percent === 100 ? "green" : topic.progress.percent ? "blue" : "gray"}
        >
          {topic.progress.percent === 100
            ? "Complete"
            : topic.progress.percent
              ? "In progress"
              : "Not started"}
        </StatusBadge>
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}

export function DisasterTopicPage() {
  const { slug } = useParams();
  const { data, loading, error, refresh } = useRequest(
    () => api(`/learning/disasters/${slug}`),
    [slug]
  );
  if (loading) return <LoadingState label="Loading disaster learning topic" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  const topic = data?.item;
  if (!topic)
    return (
      <EmptyState
        title="This topic is unavailable"
        description="Return to the disaster library to choose another pathway."
        action={
          <Link className="button button-outline" to="/learning/disasters">
            Disaster Learning Hub
          </Link>
        }
      />
    );
  return <DisasterTopicContent key={topic.slug} topic={topic} refresh={refresh} />;
}

function DisasterTopicContent({ topic, refresh }) {
  const completedIds = topic.progress?.completedLessons || [];
  const [saving, setSaving] = useState(false);
  const [quizChoice, setQuizChoice] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [error, setError] = useState("");
  const completedCount = completedIds.length;
  const total = topic.lessons.length + topic.scenarios.length;

  async function completeLesson(lessonId) {
    if (completedIds.includes(lessonId)) return;
    setSaving(true);
    setError("");
    try {
      await api(`/learning/progress/${topic.id}`, {
        method: "PUT",
        body: JSON.stringify({
          completedLessons: [...completedIds.filter((id) => !id.startsWith("scenario:")), lessonId],
        }),
      });
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitQuiz(event) {
    event.preventDefault();
    if (!quizChoice) return;
    setQuizBusy(true);
    setQuizResult(null);
    setError("");
    try {
      const result = await api(`/learning/disasters/${topic.slug}/quiz`, {
        method: "POST",
        body: JSON.stringify({ choiceId: quizChoice }),
      });
      setQuizResult(result);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setQuizBusy(false);
    }
  }

  return (
    <article className="disaster-topic-detail">
      <Link className="back-link" to="/learning/disasters">
        <ArrowLeft size={15} /> Back to Disaster Learning Hub
      </Link>
      <PageHeader
        eyebrow={`${topic.category} · ${topic.level} pathway`}
        title={topic.title}
        description={topic.overview}
        actions={
          <StatusBadge tone="blue">
            {completedCount} / {total} complete
          </StatusBadge>
        }
      />
      <div className="disaster-detail-progress">
        <div>
          <strong>Your topic progress</strong>
          <span>
            {topic.progress?.quizScore == null
              ? "Knowledge check not attempted"
              : `Latest knowledge check: ${topic.progress.quizScore}%`}
          </span>
        </div>
        <ProgressBar
          label={`${topic.title} learning progress`}
          value={total ? (completedCount / total) * 100 : 0}
        />
      </div>
      <section className="disaster-content-section">
        <SectionTitle
          title="Understand the hazard"
          description="Causes, warning signs, local context, and a common misconception."
        />
        <div className="disaster-understanding-grid">
          <ContentBlock title="How it happens" text={topic.causes} />
          <ContentBlock title="Warning signs" text={topic.signs} />
          <ContentBlock title="Regional context" text={topic.context} />
          <ContentBlock title="Common misconception" text={topic.myth} />
        </div>
      </section>
      <section className="disaster-content-section">
        <SectionTitle
          title="Learn the response"
          description="Work through the learning steps and save completion to your own account."
        />
        <div className="disaster-phase-list">
          {topic.lessons.map((lesson, index) => (
            <section className="disaster-phase" key={lesson.id}>
              <div className="disaster-phase-index">
                {completedIds.includes(lesson.id) ? (
                  <Check size={17} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </div>
              <div className="disaster-phase-content">
                <h3>{lesson.title}</h3>
                <p>{lesson.content}</p>
                <Button
                  variant={completedIds.includes(lesson.id) ? "outline" : "primary"}
                  disabled={saving || completedIds.includes(lesson.id)}
                  onClick={() => completeLesson(lesson.id)}
                >
                  {completedIds.includes(lesson.id) ? (
                    <>
                      <CheckCircle2 size={15} /> Completed
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Mark lesson complete
                    </>
                  )}
                </Button>
              </div>
            </section>
          ))}
        </div>
      </section>
      <section className="disaster-content-section">
        <SectionTitle
          title="Protective actions"
          description="Use this hazard-specific guidance together with current local instructions."
        />
        <div className="disaster-guidance-columns">
          <GuidanceList title="Before" items={topic.before} tone="before" />
          <GuidanceList title="During" items={topic.during} tone="during" />
          <GuidanceList title="After" items={topic.after} tone="after" />
        </div>
        <div className="disaster-evacuation-note">
          <ShieldAlert size={19} />
          <div>
            <strong>Evacuation and shelter</strong>
            <p>{topic.evacuation}</p>
          </div>
        </div>
      </section>
      <section className="disaster-content-section">
        <SectionTitle
          title="Learning together"
          description="Clear roles and accessible plans help a whole campus respond."
        />
        <div className="disaster-understanding-grid">
          <ContentBlock title="For students" text={topic.studentGuidance} />
          <ContentBlock title="For teachers and staff" text={topic.staffGuidance} />
          <ContentBlock title="For schools and colleges" text={topic.schoolGuidance} />
          <ContentBlock title="Accessibility and support" text={topic.accessibilityGuidance} />
        </div>
      </section>
      <section className="disaster-content-section">
        <SectionTitle
          title="Five animated scenario lessons"
          description="Original AtmosWatch scenes with controls, captions, transcripts, a checkpoint, and saved completion."
        />
        <div className="animated-scenario-list">
          {topic.scenarios.map((scenario, index) => (
            <AnimatedScenarioPlayer
              key={scenario.id}
              scenario={scenario}
              topic={topic}
              number={index + 1}
              complete={completedIds.includes(`scenario:${scenario.id}`)}
              onRefresh={refresh}
              onError={setError}
            />
          ))}
        </div>
      </section>
      <section className="disaster-content-section disaster-assessment">
        <SectionTitle
          title="Knowledge check"
          description="One question; the server checks your answer and saves your best current topic score."
        />
        <form onSubmit={submitQuiz}>
          <fieldset>
            <legend>{topic.quiz.prompt}</legend>
            {topic.quiz.choices.map((choice) => (
              <label
                key={choice.id}
                className={`disaster-answer ${quizChoice === choice.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="topic-quiz"
                  value={choice.id}
                  checked={quizChoice === choice.id}
                  onChange={() => setQuizChoice(choice.id)}
                />
                <span>{choice.text}</span>
              </label>
            ))}
          </fieldset>
          <Button type="submit" disabled={!quizChoice || quizBusy}>
            {quizBusy ? "Checking…" : "Check answer"}
          </Button>
        </form>
        {quizResult && (
          <div
            className={`disaster-feedback ${quizResult.correct ? "correct" : "try-again"}`}
            role="status"
          >
            <strong>{quizResult.correct ? "That's right" : "Review and try again"}</strong>
            <span>{quizResult.explanation}</span>
          </div>
        )}
      </section>
      {error && (
        <p role="alert" className="form-error disaster-error">
          {error}
        </p>
      )}
      <section className="disaster-do-dont">
        <div>
          <h2>
            <CheckCircle2 size={18} /> Do
          </h2>
          <ul>
            {topic.doActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>
            <ShieldAlert size={18} /> Avoid
          </h2>
          <ul>
            {topic.dontActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="disaster-content-section">
        <SectionTitle title="Common mistakes to avoid" />
        <ul className="disaster-mistake-list">
          {topic.commonMistakes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="disaster-content-section disaster-sources">
        <SectionTitle
          title="Sources and review"
          description={`Last content review: ${topic.reviewDate}. Sources provide general material, not endorsement of AtmosWatch.`}
        />
        <p className="disaster-limitation">{topic.limitations}</p>
        <ul>
          {topic.sources.map((source) => (
            <li key={source.url}>
              <span>{source.publisher}</span>
              <a href={source.url} target="_blank" rel="noreferrer">
                Open original source <ArrowRight size={14} />
              </a>
            </li>
          ))}
        </ul>
        <p className="disaster-authority-note">
          For an active incident, current instructions from competent local authorities and your
          institution's approved plan take precedence.
        </p>
      </section>
    </article>
  );
}

function ContentBlock({ title, text }) {
  return (
    <div className="disaster-content-block">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function GuidanceList({ title, items, tone }) {
  return (
    <section className={`disaster-guidance disaster-guidance-${tone}`}>
      <h3>{title}</h3>
      <ol>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}

export function AnimatedScenarioPlayer({ scenario, topic, number, complete, onRefresh, onError }) {
  const frames = useMemo(
    () => [
      { title: "Scenario", text: scenario.setting },
      { title: "Decision", text: scenario.decision },
      { title: "Safer action", text: scenario.action },
      { title: "Why it matters", text: scenario.explanation },
    ],
    [scenario]
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [choice, setChoice] = useState("");
  const [checkpoint, setCheckpoint] = useState(null);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(
      () =>
        setStep((current) => {
          if (current + 1 >= frames.length) {
            window.clearInterval(timer);
            setPlaying(false);
            setFinished(true);
            return current;
          }
          return current + 1;
        }),
      3200
    );
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  async function checkCheckpoint() {
    if (!choice) return;
    setBusy(true);
    setCheckpoint(null);
    try {
      const result = await api(
        `/learning/disasters/${topic.slug}/scenarios/${scenario.id}/checkpoint`,
        { method: "POST", body: JSON.stringify({ choiceId: choice }) }
      );
      setCheckpoint(result);
      if (result.correct) await onRefresh();
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    setStep(0);
    setPlaying(false);
    setFinished(false);
    setChoice("");
    setCheckpoint(null);
  }

  return (
    <article className={`animated-scenario ${complete ? "scenario-complete" : ""}`}>
      <div className="animated-scenario-head">
        <span className="scenario-number">{String(number).padStart(2, "0")}</span>
        <div>
          <span className="disaster-kicker">
            ORIGINAL ATMOSWATCH ANIMATION · {scenario.durationSeconds}s
          </span>
          <h3>{scenario.title}</h3>
          <p>{scenario.objective}</p>
        </div>
        {complete && <StatusBadge tone="green">Complete</StatusBadge>}
      </div>
      <div className="scenario-player" aria-label={`Scenario ${number}: ${scenario.title}`}>
        <ScenarioIllustration topic={topic} step={step} frame={frames[step]} />
        <div className="scenario-stage" aria-live="polite">
          <span>
            STEP {step + 1} OF {frames.length} · {frames[step].title}
          </span>
          <strong>{frames[step].text}</strong>
          <p>{scenario.attribution}</p>
        </div>
        <div className="scenario-controls">
          <div className="scenario-control-buttons">
            <Button
              variant="outline"
              aria-label={playing ? "Pause scenario" : "Play scenario"}
              onClick={() => {
                if (finished) {
                  setStep(0);
                  setFinished(false);
                  setPlaying(true);
                } else {
                  setPlaying((value) => !value);
                }
              }}
              disabled={complete}
            >
              {playing ? (
                <>
                  <Pause size={16} /> Pause
                </>
              ) : (
                <>
                  <Play size={16} /> {finished ? "Play again" : "Play"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              aria-label="Restart scenario"
              onClick={restart}
              disabled={complete}
            >
              <RotateCcw size={16} /> Restart
            </Button>
          </div>
          <ProgressBar
            label="Animated scenario progress"
            value={finished ? 100 : ((step + 1) / frames.length) * 100}
          />
        </div>
        <details className="scenario-transcript">
          <summary>
            Read transcript <ChevronDown size={15} />
          </summary>
          <ol>
            {frames.map((frame, index) => (
              <li key={frame.title}>
                <strong>
                  {index + 1}. {frame.title}:
                </strong>{" "}
                {frame.text}
              </li>
            ))}
          </ol>
        </details>
        {finished && !complete && (
          <form
            className="scenario-checkpoint"
            onSubmit={(event) => {
              event.preventDefault();
              checkCheckpoint();
            }}
          >
            <h4>
              <CircleHelp size={17} /> Learning checkpoint
            </h4>
            <p>{scenario.checkpoint.question}</p>
            {scenario.checkpoint.choices.map((item) => (
              <label
                className={`disaster-answer ${choice === item.id ? "selected" : ""}`}
                key={item.id}
              >
                <input
                  type="radio"
                  name={`check-${scenario.id}`}
                  value={item.id}
                  checked={choice === item.id}
                  onChange={() => setChoice(item.id)}
                />
                <span>{item.text}</span>
              </label>
            ))}
            <Button type="submit" disabled={!choice || busy}>
              {busy ? "Checking…" : "Submit checkpoint"}
            </Button>
            {checkpoint && (
              <div
                className={`disaster-feedback ${checkpoint.correct ? "correct" : "try-again"}`}
                role="status"
              >
                <strong>{checkpoint.correct ? "Scenario complete" : "Try again"}</strong>
                <span>{checkpoint.explanation}</span>
              </div>
            )}
          </form>
        )}
        {complete && (
          <p className="scenario-completion">
            <CheckCircle2 size={16} /> Checkpoint passed and saved to your learning record.
          </p>
        )}
      </div>
    </article>
  );
}

export function ScenarioIllustration({ topic, step, frame }) {
  const HazardIcon = iconMap[topic.icon] || ShieldAlert;
  const captions = [
    "Notice the situation",
    "Choose the response",
    "Move as planned",
    "Check and report",
  ];
  return (
    <div className={`scenario-illustration scene-${topic.slug}`}>
      <div
        className={`scenario-scene scene-phase-${step}`}
        role="img"
        aria-label={`${frame.title}: ${frame.text}`}
      >
        <span className="scene-ground" />
        <span className="scene-building" aria-hidden="true">
          <i className="scene-roof" />
          <i className="scene-windows" />
          <i className="scene-door" />
        </span>
        <span className="scene-person" aria-hidden="true">
          <i />
          <b />
        </span>
        <span className="scene-hazard" aria-hidden="true">
          <HazardIcon size={30} />
        </span>
        <span className="scene-route" aria-hidden="true">
          <ArrowRight size={19} />
        </span>
        <span className="scene-check" aria-hidden="true">
          <CheckCircle2 size={20} />
        </span>
        <span className="scene-caption">{captions[step]}</span>
      </div>
      <span>Original educational animation · not real incident footage</span>
    </div>
  );
}
