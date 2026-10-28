import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudSun,
  Compass,
  Flame,
  Eye,
  EyeOff,
  GraduationCap,
  Mountain,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { api, useRequest } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import { BrandLogo } from "../components/brand-logo.jsx";
import { roleCanAccessPath, roleHome } from "../lib/routing.js";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Freshness,
  LoadingState,
  PageHeader,
  Panel,
  ProgressBar,
  SectionTitle,
  SourceAttribution,
  StatCard,
  StatusBadge,
} from "../components/ui.jsx";

const hazardIcons = {
  earthquake: Mountain,
  cyclone: Wind,
  flood: Waves,
  volcano: Flame,
  drought: ThermometerSun,
  wildfire: Flame,
  weather: CloudSun,
  heat: ThermometerSun,
  "air-quality": Wind,
};

export function LandingPage() {
  return (
    <>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-label">
            <ShieldCheck size={15} /> Disaster readiness, made teachable
          </span>
          <h1>
            Build a culture of <em>preparedness.</em>
          </h1>
          <p>
            Learn how hazards affect your community, practise safer decisions, and help your school
            plan together.
          </p>
          <div className="hero-buttons">
            <Link className="button button-primary" to="/academy">
              Explore the academy <ArrowRight size={16} />
            </Link>
            <Link className="button button-outline" to="/dashboard">
              Open workspace
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <CheckCircle2 size={15} /> Age-aware learning
            </span>
            <span>
              <CheckCircle2 size={15} /> Official source links
            </span>
            <span>
              <CheckCircle2 size={15} /> School-focused
            </span>
          </div>
        </div>
        <div className="landing-visual" aria-label="Learning and preparedness dashboard preview">
          <div className="visual-top">
            <span className="visual-dot" />
            <span>LEARNING PATHWAY</span>
            <span className="visual-complete">IN PROGRESS</span>
          </div>
          <div className="visual-title">Ready for what comes next?</div>
          <div className="visual-map">
            <div className="map-contour contour-a" />
            <div className="map-contour contour-b" />
            <div className="map-point point-a">
              <span />
              <small>School</small>
            </div>
            <div className="map-point point-b">
              <span />
              <small>Assembly area</small>
            </div>
            <div className="route-line" />
            <div className="map-legend">
              <span>
                <i /> Learning
              </span>
              <span>
                <i /> Practice
              </span>
            </div>
          </div>
          <div className="visual-course">
            <div className="course-icon">
              <Mountain size={19} />
            </div>
            <div>
              <strong>Earthquake readiness</strong>
              <small>3 lessons · 8 minutes</small>
            </div>
            <div className="course-progress">
              <span />
            </div>
            <span className="course-percent">2/3</span>
          </div>
        </div>
        <div className="hero-vertical">LEARN · PREPARE · PROTECT</div>
      </section>
      <section className="landing-approach" id="approach">
        <div className="landing-section-kicker">A more prepared community</div>
        <div className="approach-grid">
          <h2>Knowledge is a safety resource.</h2>
          <div>
            <p>
              AtmosWatch brings practical disaster education and school readiness into one calm,
              useful workspace.
            </p>
            <div className="approach-points">
              <span>
                <BookOpenCheck size={17} /> Learn with guided pathways
              </span>
              <span>
                <Compass size={17} /> Practise decisions in simulations
              </span>
              <span>
                <Building2 size={17} /> Organize institution preparedness
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-hazards" id="hazards">
        <div className="landing-section-kicker">Learning pathways</div>
        <div className="landing-hazard-grid">
          {[
            { name: "Earthquake", icon: Mountain, color: "mint" },
            { name: "Flood", icon: Waves, color: "blue" },
            { name: "Fire", icon: Flame, color: "amber" },
            { name: "Heatwave", icon: ThermometerSun, color: "coral" },
          ].map(({ name, icon: Icon, color }) => (
            <Link key={name} to="/academy" className="learning-teaser">
              <span className={`topic-icon ${color}`}>
                <Icon size={19} />
              </span>
              <strong>{name}</strong>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      <section className="landing-callout">
        <div>
          <span className="landing-section-kicker">Start with what you can control</span>
          <h2>Preparedness grows through practice.</h2>
        </div>
        <Link className="button button-light" to="/simulations">
          Try a practice scenario <ArrowRight size={16} />
        </Link>
      </section>
      <footer className="public-footer">
        <BrandFooter />
        <p>
          Educational guidance only. Follow local authorities and approved site-specific emergency
          plans.
        </p>
        <Link to="/resources">
          Official safety resources <ArrowRight size={14} />
        </Link>
      </footer>
    </>
  );
}
function BrandFooter() {
  return (
    <Link to="/" className="brand brand-footer-logo" aria-label="AtmosWatch home">
      <BrandLogo variant="compact" />
    </Link>
  );
}

function AuthPage({ mode }) {
  const registerMode = mode === "register";
  const { login, register, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const user = registerMode
        ? await register({ ...body, educationLevel: body.educationLevel || "secondary" })
        : await login({ email: body.email, password: body.password });
      const requestedPath = location.state?.from?.pathname;
      navigate(
        requestedPath && roleCanAccessPath(user.role, requestedPath)
          ? requestedPath
          : roleHome(user.role),
        { replace: true }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page auth-page-branded">
      <section className="auth-card">
        <div className="auth-heading">
          <span className="auth-icon">
            <ShieldCheck size={22} />
          </span>
          <p className="eyebrow">{registerMode ? "Student account" : "Secure workspace access"}</p>
          <h1>{registerMode ? "Create your student account" : "Welcome back to AtmosWatch"}</h1>
          <p>
            {registerMode
              ? "Start a personal learning journey and practise preparedness skills."
              : "Sign in to continue learning, manage preparedness activities, and access your authorized workspace."}
          </p>
        </div>
        <form onSubmit={submit} className="form-stack">
          {registerMode && (
            <Field
              id="name"
              label="Full name"
              name="name"
              autoComplete="name"
              minLength="2"
              maxLength="80"
              required
            />
          )}
          {registerMode && (
            <label className="field" htmlFor="educationLevel">
              <span>Learning level</span>
              <select name="educationLevel" id="educationLevel" defaultValue="secondary">
                <option value="primary">Primary school</option>
                <option value="secondary">Secondary school</option>
                <option value="college">College</option>
                <option value="adult">Adult learner</option>
              </select>
            </label>
          )}
          <Field id="email" label="Email" name="email" type="email" autoComplete="email" required />
          <label className="field" htmlFor="password">
            <span>Password</span>
            <span className="password-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={registerMode ? "new-password" : "current-password"}
                minLength={registerMode ? 12 : 1}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {registerMode && <small>Use at least 12 characters.</small>}
          </label>
          {!registerMode && (location.state?.sessionExpired || sessionExpired) && (
            <p className="session-notice" role="status">
              Your session expired. Sign in again to continue.
            </p>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <Button disabled={busy} type="submit">
            {busy ? "Please wait…" : registerMode ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="auth-switch">
          {registerMode ? "Already have an account?" : "New to AtmosWatch?"}{" "}
          <Link to={registerMode ? "/login" : "/register"}>
            {registerMode ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <p className="auth-privacy">
          Your session is protected with a secure, HttpOnly cookie. Passwords are never stored in
          browser storage.
        </p>
        <Link to="/resources" className="auth-resource-link">
          Explore Disaster Safety Resources <ArrowRight size={15} />
        </Link>
        <div className="auth-public-links auth-public-links-inline">
          <Link to="/disaster-updates">Latest public disaster stories</Link>
          <Link to="/about">General public information</Link>
        </div>
      </section>
    </main>
  );
}
export function LoginPage() {
  return <AuthPage mode="login" />;
}
export function RegisterPage() {
  return <AuthPage mode="register" />;
}

export function DashboardPage() {
  const { user } = useAuth();
  const hazards = useRequest(() => api("/hazards/events?source=gdacs&limit=4"), []);
  const modules = useRequest(() => api("/learning/modules"), []);
  const people = useRequest(
    () =>
      user?.role === "ADMIN"
        ? api("/users/analytics")
        : user?.role === "INSTRUCTOR"
          ? api("/users?limit=1")
          : Promise.resolve(null),
    [user?.role]
  );
  const firstName = user?.name?.split(" ")[0] || "there";
  return (
    <>
      <PageHeader
        eyebrow={
          user?.role === "ADMIN"
            ? "Platform administration"
            : user?.role === "INSTRUCTOR"
              ? "Instructor workspace"
              : "Your learning workspace"
        }
        title={`Good to see you, ${firstName}.`}
        description="Build practical knowledge and turn it into a shared readiness habit."
        actions={
          <Link
            className="button button-primary"
            to={user?.role === "ADMIN" || user?.role === "INSTRUCTOR" ? "/users" : "/academy"}
          >
            <BookOpen size={16} />{" "}
            {user?.role === "ADMIN" || user?.role === "INSTRUCTOR"
              ? "Manage users"
              : "Continue learning"}
          </Link>
        }
      />
      <div className="stat-grid">
        {user?.role === "ADMIN" ? (
          <>
            <StatCard
              icon={Building2}
              label="Total users"
              value={people.data?.userCounts?.reduce((sum, row) => sum + row.count, 0) ?? "—"}
              hint="Persisted accounts"
            />
            <StatCard
              icon={GraduationCap}
              label="Instructors"
              value={
                people.data?.userCounts
                  ?.filter((row) => row._id.role === "INSTRUCTOR")
                  .reduce((sum, row) => sum + row.count, 0) ?? "—"
              }
              hint="Active and inactive"
              tone="blue"
            />
            <StatCard
              icon={BookOpenCheck}
              label="Students"
              value={
                people.data?.userCounts
                  ?.filter((row) => row._id.role === "STUDENT")
                  .reduce((sum, row) => sum + row.count, 0) ?? "—"
              }
              hint="Active and inactive"
              tone="green"
            />
            <StatCard
              icon={ShieldCheck}
              label="Active accounts"
              value={
                people.data?.userCounts
                  ?.filter((row) => row._id.active)
                  .reduce((sum, row) => sum + row.count, 0) ?? "—"
              }
              hint="Can sign in"
            />
            <StatCard
              icon={Shield}
              label="Inactive accounts"
              value={
                people.data?.userCounts
                  ?.filter((row) => !row._id.active)
                  .reduce((sum, row) => sum + row.count, 0) ?? "—"
              }
              hint="Pending or deactivated"
              tone="blue"
            />
            <StatCard
              icon={Building2}
              label="Institutions"
              value={people.data?.institutions ?? "—"}
              hint="Persisted workspaces"
              tone="green"
            />
            <StatCard
              icon={BookOpenCheck}
              label="Lesson completions"
              value={people.data?.lessonCompletions ?? "—"}
              hint="Recorded learner progress"
            />
            <StatCard
              icon={Activity}
              label="Assessment attempts"
              value={people.data?.assessments ?? "—"}
              hint="Completed simulations"
              tone="blue"
            />
            <StatCard
              icon={Shield}
              label="Preparedness drills"
              value={people.data?.drills ?? "—"}
              hint="Persisted drill records"
              tone="green"
            />
            <StatCard
              icon={ShieldCheck}
              label="Readiness checklists"
              value={people.data?.checklists ?? "—"}
              hint="Institution records"
            />
          </>
        ) : user?.role === "INSTRUCTOR" ? (
          <>
            <StatCard
              icon={GraduationCap}
              label="Assigned students"
              value={people.data?.total ?? "—"}
              hint="Your institution only"
            />
            <StatCard
              icon={BookOpenCheck}
              label="Learning pathways"
              value={modules.data?.items?.length ?? "—"}
              hint="Available to learners"
              tone="blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Your role"
              value="INSTRUCTOR"
              hint={
                user?.institutionId ? "Institution assigned" : "Awaiting institution assignment"
              }
              tone="green"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={BookOpenCheck}
              label="Learning pathways"
              value={modules.data?.items?.length ?? "—"}
              hint="Curated safety lessons"
            />
            <StatCard
              icon={Activity}
              label="Recent global events"
              value={hazards.data?.count ?? "—"}
              hint="GDACS · last 30 days"
              tone="blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Your role"
              value={user?.role || "Visitor"}
              hint={
                user?.institutionId ? "Institution workspace linked" : "Personal learning account"
              }
              tone="green"
            />
          </>
        )}
      </div>
      <div className="dashboard-grid">
        <Panel>
          <SectionTitle
            title="Start learning"
            description="Short, practical pathways for common campus hazards."
            action={
              <Link to="/academy" className="link-action">
                All pathways <ArrowRight size={14} />
              </Link>
            }
          />
          {modules.loading ? (
            <LoadingState label="Loading learning pathways" />
          ) : modules.error ? (
            <ErrorState message={modules.error} onRetry={modules.refresh} />
          ) : (
            <div className="module-list">
              {(modules.data?.items || []).slice(0, 3).map((module) => (
                <ModuleRow key={module.id} module={module} />
              ))}
            </div>
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="Practice a decision"
            description="These are educational simulations, never emergency alerts."
          />
          <div className="practice-callout">
            <span className="practice-icon">
              <Compass size={21} />
            </span>
            <div>
              <strong>Choose what you would do</strong>
              <p>Work through a short scenario and learn why each action matters.</p>
            </div>
            <Link to="/simulations" aria-label="Open response practice">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="safety-note">
            <Shield size={15} />
            <span>In a real emergency, follow local authorities and your approved site plan.</span>
          </div>
        </Panel>
      </div>
      <Panel className="event-panel">
        <SectionTitle
          title="Global hazard context"
          description="Recent events are observations from GDACS, not school-specific risk assessments."
          action={
            <Link to="/intelligence" className="link-action">
              Open intelligence center <ArrowRight size={14} />
            </Link>
          }
        />
        {hazards.loading ? (
          <LoadingState label="Loading GDACS events" />
        ) : hazards.error ? (
          <ErrorState message={hazards.error} onRetry={hazards.refresh} />
        ) : (
          <div className="event-row-grid">
            {(hazards.data?.items || []).slice(0, 4).map((event) => (
              <HazardEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function ModuleRow({ module }) {
  const Icon = hazardIcons[module.hazard.toLowerCase()] || BookOpen;
  return (
    <Link className="module-row" to={`/academy/${module.id}`}>
      <span className="module-icon">
        <Icon size={19} />
      </span>
      <div className="module-row-copy">
        <strong>{module.title}</strong>
        <span>
          {module.hazard} <i /> {module.minutes} min <i /> {module.level}
        </span>
      </div>
      <ArrowRight size={16} />
    </Link>
  );
}
function LearningCard({ module }) {
  const Icon = hazardIcons[module.hazard.toLowerCase()] || BookOpen;
  return (
    <Link className="learning-card" to={`/academy/${module.id}`}>
      <div className="learning-card-top">
        <span className="module-icon">
          <Icon size={20} />
        </span>
        <StatusBadge tone="mint">{module.hazard}</StatusBadge>
      </div>
      <h3>{module.title}</h3>
      <p>{module.summary}</p>
      <div className="learning-card-meta">
        <span>
          <Clock3 size={14} /> {module.minutes} minutes
        </span>
        <span>{module.level}</span>
      </div>
      <div className="learning-card-action">
        Open pathway <ArrowRight size={15} />
      </div>
    </Link>
  );
}
export function AcademyPage() {
  const { data, loading, error, refresh } = useRequest(() => api("/learning/modules"), []);
  return (
    <>
      <PageHeader
        eyebrow="Disaster learning academy"
        title="Learn skills that travel with you."
        description="Evidence-linked, age-aware lessons help learners prepare together."
      />
      <div className="academy-banner">
        <span>
          <GraduationCap size={21} />
        </span>
        <div>
          <strong>Start with a pathway that fits your community.</strong>
          <p>
            Each lesson connects practical actions with a trustworthy source. Local plans and
            authority guidance always come first.
          </p>
        </div>
      </div>
      {loading ? (
        <LoadingState label="Loading pathways" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="learning-grid">
          {data.items.map((module) => (
            <LearningCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </>
  );
}

export function LessonPage() {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useRequest(
    () => api(`/learning/modules/${moduleId}`),
    [moduleId]
  );
  const progressRequest = useRequest(
    () => (user ? api("/learning/progress") : Promise.resolve({ items: [] })),
    [user?.id]
  );
  const [completed, setCompleted] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const saved = progressRequest.data?.items?.find((item) => item.moduleId === moduleId);
    setCompleted(saved?.completedLessons || []);
    setResult(null);
  }, [progressRequest.data, moduleId]);
  async function toggleLesson(id) {
    const next = completed.includes(id)
      ? completed.filter((lesson) => lesson !== id)
      : [...completed, id];
    setCompleted(next);
    setMessage("");
    if (user) {
      try {
        await api(`/learning/progress/${moduleId}`, {
          method: "PUT",
          body: JSON.stringify({ completedLessons: next }),
        });
      } catch (err) {
        setMessage(err.message);
      }
    }
  }
  async function submitQuiz() {
    if (!user) return setMessage("Sign in to record a quiz attempt and save your score.");
    if (Object.keys(answers).length !== data.quiz.length)
      return setMessage("Answer every question before submitting.");
    setBusy(true);
    setMessage("");
    try {
      setResult(
        await api(`/learning/modules/${moduleId}/quiz`, {
          method: "POST",
          body: JSON.stringify({
            answers: data.quiz.map((question) => ({
              questionId: question.id,
              choiceId: answers[question.id],
            })),
          }),
        })
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <LoadingState label="Opening learning pathway" />;
  if (error) return <ErrorState message={error} />;
  const lessonProgress = Math.round((completed.length / data.lessons.length) * 100);
  return (
    <>
      <Link className="back-link" to="/academy">
        <ChevronLeft size={15} /> All pathways
      </Link>
      <PageHeader
        eyebrow={`${data.hazard} · ${data.level}`}
        title={data.title}
        description={data.summary}
      />
      <div className="lesson-layout">
        <div className="lesson-main">
          <Panel>
            <SectionTitle
              title="Learning steps"
              description={`${completed.length} of ${data.lessons.length} marked complete`}
            />
            <ProgressBar label="Pathway progress" value={lessonProgress} />
            <div className="lesson-stack">
              {data.lessons.map((lesson, index) => (
                <article
                  className={`lesson-step ${completed.includes(lesson.id) ? "is-complete" : ""}`}
                  key={lesson.id}
                >
                  <div className="lesson-step-number">
                    {completed.includes(lesson.id) ? (
                      <Check size={16} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>
                  <div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.content}</p>
                    <button
                      className={`text-button ${completed.includes(lesson.id) ? "checked" : ""}`}
                      onClick={() => toggleLesson(lesson.id)}
                    >
                      {completed.includes(lesson.id) ? "Completed · undo" : "Mark lesson complete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {user && message && (
              <div className="inline-notice" role="status">
                {message}
              </div>
            )}
          </Panel>
          <Panel>
            <SectionTitle
              title="Knowledge check"
              description="Your choices are scored by the server and saved to your account."
            />
            {!user && (
              <div className="signin-callout">
                <p>Sign in to submit the quiz and save your score.</p>
                <Link className="button button-outline" to="/login">
                  Sign in <ArrowRight size={14} />
                </Link>
              </div>
            )}
            {data.quiz.map((question, index) => (
              <fieldset className="quiz-question" key={question.id}>
                <legend>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {question.prompt}
                </legend>
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className={`quiz-option ${answers[question.id] === option.id ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() =>
                        setAnswers((previous) => ({ ...previous, [question.id]: option.id }))
                      }
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
                {result?.results?.find((item) => item.questionId === question.id) && (
                  <p className="quiz-feedback">
                    <CheckCircle2 size={15} />
                    {result.results.find((item) => item.questionId === question.id).explanation}
                  </p>
                )}
              </fieldset>
            ))}
            <div className="quiz-submit">
              <Button onClick={submitQuiz} disabled={busy}>
                {busy ? "Scoring…" : "Submit knowledge check"}
              </Button>
              {result && (
                <StatusBadge tone={result.score >= 70 ? "green" : "amber"}>
                  Score {result.score}%
                </StatusBadge>
              )}
            </div>
            {message && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}
          </Panel>
        </div>
        <aside className="lesson-aside">
          <Panel>
            <h3>Pathway details</h3>
            <div className="detail-line">
              <Clock3 size={15} /> About {data.minutes} minutes
            </div>
            <div className="detail-line">
              <GraduationCap size={15} /> {data.level}
            </div>
            <div className="detail-line">
              <CheckCircle2 size={15} /> {data.lessons.length} lessons
            </div>
          </Panel>
          <Panel>
            <h3>Source guidance</h3>
            <p>
              Use this module to support learning and practice. Your institution's approved
              emergency plan takes precedence.
            </p>
            <SourceAttribution name="Official guidance" href={data.source} />
          </Panel>
        </aside>
      </div>
    </>
  );
}

function ScenarioCard({ scenario }) {
  const Icon = hazardIcons[scenario.hazard.toLowerCase()] || Compass;
  return (
    <Link className="scenario-card" to={`/simulations/${scenario.id}`}>
      <div className="scenario-label">
        <span className="scenario-icon">
          <Icon size={18} />
        </span>
        <StatusBadge tone="amber">Simulation</StatusBadge>
      </div>
      <h3>{scenario.title}</h3>
      <p>{scenario.description}</p>
      <div className="scenario-footer">
        <span>{scenario.steps} decisions</span>
        <span>
          Practice now <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
export function SimulationsPage() {
  const { data, loading, error, refresh } = useRequest(() => api("/simulations/scenarios"), []);
  return (
    <>
      <PageHeader
        eyebrow="Response practice"
        title="Practice the next safe step."
        description="Make a decision, see the learning behind it, and reflect. These scenarios are simulations only."
      />
      <div className="simulation-warning">
        <Sparkles size={17} />
        <span>
          <strong>Practice simulation</strong> · This is a learning exercise. It does not predict
          real events or trigger alerts.
        </span>
      </div>
      {loading ? (
        <LoadingState label="Loading scenarios" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="scenario-grid">
          {data.items.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
      <Panel className="safety-note-panel">
        <ShieldCheck size={18} />
        <div>
          <strong>In a real emergency</strong>
          <p>
            Follow local authority instructions, your institution's approved plan, and directions
            from responsible staff.
          </p>
        </div>
      </Panel>
    </>
  );
}

export function ScenarioPage() {
  const { scenarioId } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useRequest(
    () => api(`/simulations/scenarios/${scenarioId}`),
    [scenarioId]
  );
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <LoadingState label="Loading simulation" />;
  if (error) return <ErrorState message={error} />;
  const scenario = data.item;
  async function submit() {
    if (!user) return setMessage("Sign in to save your practice result.");
    if (Object.keys(answers).length !== scenario.steps.length)
      return setMessage("Choose an action for each decision point.");
    setBusy(true);
    setMessage("");
    try {
      setResult(
        await api("/simulations/attempts", {
          method: "POST",
          body: JSON.stringify({
            scenarioId,
            answers: scenario.steps.map((step) => ({
              stepId: step.id,
              choiceId: answers[step.id],
            })),
          }),
        })
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/simulations">
        <ChevronLeft size={15} /> All practice scenarios
      </Link>
      <div className="simulation-warning">
        <Sparkles size={17} />
        <span>
          <strong>Educational simulation</strong> · Not an emergency alert.
        </span>
      </div>
      <PageHeader
        eyebrow={`${scenario.hazard} response practice`}
        title={scenario.title}
        description={scenario.description}
      />
      <div className="decision-stack">
        {scenario.steps.map((step, index) => (
          <Panel className="decision-panel" key={step.id}>
            <div className="decision-index">Decision {String(index + 1).padStart(2, "0")}</div>
            <h2>{step.prompt}</h2>
            <div className="decision-options">
              {step.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`decision-option ${answers[step.id] === choice.id ? "chosen" : ""} ${result?.feedback?.find((item) => item.stepId === step.id)?.correct && answers[step.id] === choice.id ? "correct" : ""}`}
                >
                  <input
                    type="radio"
                    name={step.id}
                    checked={answers[step.id] === choice.id}
                    onChange={() => {
                      setAnswers((previous) => ({ ...previous, [step.id]: choice.id }));
                      setResult(null);
                    }}
                  />
                  <span>{choice.label}</span>
                  <ChevronRight size={16} />
                </label>
              ))}
            </div>
            {result?.feedback?.find((item) => item.stepId === step.id) && (
              <div className="decision-feedback">
                <CheckCircle2 size={16} />
                <span>{result.feedback.find((item) => item.stepId === step.id).explanation}</span>
              </div>
            )}
          </Panel>
        ))}
      </div>
      <div className="scenario-submit">
        <div>
          {result ? (
            <div className="result-score">
              <strong>{result.item.score}%</strong>
              <span>practice score · review each explanation above</span>
            </div>
          ) : (
            <p>Your result measures this practice attempt only.</p>
          )}
          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}
        </div>
        <Button onClick={submit} disabled={busy}>
          {busy ? "Saving…" : result ? "Try again" : "Finish practice"}
        </Button>
      </div>
      <Panel className="source-panel">
        <p>Scenario guidance reference</p>
        <SourceAttribution
          name={scenario.hazard === "Flood" ? "NDMA SACHET" : "NIDM school safety"}
          href={scenario.source}
        />
      </Panel>
    </>
  );
}

function HazardEventCard({ event }) {
  const Icon = hazardIcons[event.hazard] || Activity;
  const tone = ["red", "high"].includes(event.severity)
    ? "red"
    : ["orange", "moderate"].includes(event.severity)
      ? "amber"
      : "neutral";
  const levelLabel = event.severity
    ? event.source === "GDACS"
      ? `GDACS ${event.severity}`
      : event.severity
    : "Observation";
  return (
    <article className="hazard-event-card">
      <div className="event-heading">
        <span className="event-icon">
          <Icon size={17} />
        </span>
        <StatusBadge tone={tone}>{levelLabel}</StatusBadge>
      </div>
      <h3>{event.title}</h3>
      {event.description && <p>{event.description}</p>}
      <div className="event-meta">
        <span>{event.hazard}</span>
        <span>
          {event.occurredAt ? new Date(event.occurredAt).toLocaleDateString() : "Date unavailable"}
        </span>
      </div>
      <SourceAttribution name={event.source} href={event.sourceUrl} />
    </article>
  );
}
const hazardPin = L.divIcon({
  className: "hazard-pin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
function HazardMap({ events }) {
  const markers = events.filter(
    (event) => event.coordinates?.latitude && event.coordinates?.longitude
  );
  return (
    <div className="map-frame">
      <MapContainer
        center={[20.59, 78.96]}
        zoom={3}
        scrollWheelZoom={false}
        aria-label="Map of reported global hazard observations"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((event) => (
          <Marker
            key={event.id}
            position={[event.coordinates.latitude, event.coordinates.longitude]}
            icon={hazardPin}
          >
            <Popup>
              <strong>{event.title}</strong>
              <br />
              {event.source} · {event.hazard}
              <br />
              <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                Open source
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {!markers.length && (
        <div className="map-no-data">No mapped events in the current result set</div>
      )}
    </div>
  );
}
export function IntelligencePage() {
  const [source, setSource] = useState("gdacs");
  const [alertLevel, setAlertLevel] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [minMagnitude, setMinMagnitude] = useState("0");
  const [location, setLocation] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fromDate, setFromDate] = useState(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [query, setQuery] = useState("New Delhi");
  const events = useRequest(
    () =>
      api(
        `/hazards/events?source=${source}&limit=50&minMagnitude=${minMagnitude}&fromDate=${fromDate}&toDate=${toDate}${hazardType && source === "gdacs" ? `&type=${hazardType}` : ""}${alertLevel && source === "gdacs" ? `&alertLevel=${alertLevel}` : ""}`
      ),
    [source, alertLevel, minMagnitude, hazardType, fromDate, toDate]
  );
  const weather = useRequest(() => api(`/weather?location=${encodeURIComponent(query)}`), [query]);
  const sources = useRequest(() => api("/hazards/sources"), []);
  const sourceRows = sources.data?.items || [];
  const firms = sourceRows.find((item) => item.id === "nasa-firms");
  const rows = events.data?.items || [];
  const filteredRows = useMemo(
    () =>
      rows.filter((event) =>
        `${event.title} ${event.hazard} ${event.source}`
          .toLowerCase()
          .includes(location.toLowerCase())
      ),
    [rows, location]
  );
  function searchWeather(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setQuery(String(form.get("location") || "New Delhi").trim());
  }
  return (
    <>
      <PageHeader
        eyebrow="Disaster intelligence center"
        title="See what data can tell you."
        description="Explore global observations and forecast conditions with source, timestamp, and coverage context."
        actions={
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              events.refresh();
              weather.refresh();
            }}
          >
            Refresh feeds
          </Button>
        }
      />
      <div className="intelligence-controls">
        <label className="field compact-field">
          <span>Event source</span>
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setHazardType("");
            }}
          >
            <option value="gdacs">GDACS multi-hazard</option>
            <option value="usgs">USGS earthquakes</option>
          </select>
        </label>
        {source === "gdacs" ? (
          <>
            <label className="field compact-field">
              <span>Hazard type</span>
              <select value={hazardType} onChange={(event) => setHazardType(event.target.value)}>
                <option value="">All hazards</option>
                <option value="earthquake">Earthquake</option>
                <option value="cyclone">Cyclone</option>
                <option value="flood">Flood</option>
                <option value="volcano">Volcano</option>
                <option value="drought">Drought</option>
                <option value="wildfire">Wildfire</option>
              </select>
            </label>
            <label className="field compact-field">
              <span>GDACS alert level</span>
              <select value={alertLevel} onChange={(event) => setAlertLevel(event.target.value)}>
                <option value="">All levels</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
              </select>
            </label>
          </>
        ) : (
          <label className="field compact-field">
            <span>Minimum magnitude</span>
            <select value={minMagnitude} onChange={(event) => setMinMagnitude(event.target.value)}>
              <option value="0">All magnitudes</option>
              <option value="2.5">2.5+</option>
              <option value="4">4.0+</option>
              <option value="5">5.0+</option>
            </select>
          </label>
        )}
        <label className="field compact-field">
          <span>From date</span>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label className="field compact-field">
          <span>To date</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
        <label className="field compact-field">
          <span>Filter events</span>
          <div className="search-field">
            <Search size={16} />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Title or hazard"
            />
          </div>
        </label>
        <div className="filter-count">
          <strong>{filteredRows.length}</strong>
          <span>events shown</span>
        </div>
      </div>
      <div className="intel-grid">
        <Panel className="intel-map-panel">
          <SectionTitle
            title="Global event map"
            description={`Source: ${events.data?.source || source.toUpperCase()} · event points are approximate feed locations`}
          />
          {events.loading ? (
            <LoadingState label="Loading mapped events" />
          ) : events.error ? (
            <ErrorState message={events.error} onRetry={events.refresh} />
          ) : (
            <HazardMap events={filteredRows} />
          )}
        </Panel>
        <Panel className="weather-panel">
          <SectionTitle
            title="Local weather outlook"
            description="Forecast context, not an official warning."
          />
          <form className="weather-search" onSubmit={searchWeather}>
            <label className="sr-only" htmlFor="weather-location-search">
              Search location
            </label>
            <input
              id="weather-location-search"
              name="location"
              defaultValue={query}
              placeholder="City or district"
            />
            <Button aria-label="Search weather">
              <Search size={16} />
            </Button>
          </form>
          {weather.loading ? (
            <LoadingState label="Loading weather forecast" />
          ) : weather.error ? (
            <ErrorState message={weather.error} onRetry={weather.refresh} />
          ) : (
            <WeatherSummary data={weather.data} />
          )}
        </Panel>
      </div>
      <Panel>
        <SectionTitle
          title="Events"
          description={
            events.data ? (
              <>
                <Freshness timestamp={events.data.refreshedAt} />{" "}
                <span> · Observations are not institution-specific risk assessments.</span>
              </>
            ) : (
              ""
            )
          }
        />
        {events.loading ? (
          <LoadingState label="Loading hazard events" />
        ) : events.error ? (
          <ErrorState message={events.error} onRetry={events.refresh} />
        ) : filteredRows.length ? (
          <div className="event-row-grid">
            {filteredRows.map((event) => (
              <HazardEventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching events"
            description="Adjust the filters or try a different location phrase."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setLocation("");
                  setAlertLevel("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </Panel>
      <Panel className="provider-panel">
        <SectionTitle
          title="Provider status"
          description="Data refreshes through public provider APIs. Coverage and update intervals differ."
        />
        {sourceRows.length ? (
          <div className="provider-list">
            {sourceRows.map((item) => (
              <div className="provider-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.type.replaceAll("-", " ")} ·{" "}
                    {item.integrationStatus === "not-integrated"
                      ? "integration not implemented"
                      : item.credentials
                        ? item.configured
                          ? "credential configured"
                          : "credential required"
                        : "no key required"}
                  </span>
                </div>
                <StatusBadge
                  tone={
                    item.integrationStatus === "not-integrated"
                      ? "amber"
                      : item.credentials && !item.configured
                        ? "neutral"
                        : "green"
                  }
                >
                  {item.integrationStatus === "not-integrated"
                    ? "Not integrated"
                    : item.credentials && !item.configured
                      ? "Credential needed"
                      : "Available"}
                </StatusBadge>
                <SourceAttribution name="Source details" href={item.url} />
              </div>
            ))}
          </div>
        ) : (
          <p>Provider metadata unavailable.</p>
        )}
        {firms && !firms.configured && (
          <div className="provider-notice">
            <Flame size={16} />
            <span>
              NASA FIRMS is not yet wired into the API. The source requires an Earthdata account and
              FIRMS MAP key when integration is implemented.
            </span>
          </div>
        )}
      </Panel>
      <div className="disclaimer-strip">
        <ShieldCheck size={17} />
        <span>
          AtmosWatch is an education and preparedness tool, not an official dispatch or warning
          service. Always follow competent local authorities.
        </span>
      </div>
    </>
  );
}
function WeatherSummary({ data }) {
  const current = data.current || {};
  const daily = (data.daily?.time || []).map((day, index) => ({
    day: new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }),
    high: data.daily.temperature_2m_max[index],
    low: data.daily.temperature_2m_min[index],
  }));
  return (
    <>
      <div className="weather-current">
        <span className="weather-temp">{Math.round(current.temperature_2m)}°</span>
        <div>
          <strong>
            {data.location.name}
            {data.location.admin1 ? `, ${data.location.admin1}` : ""}
          </strong>
          <span>
            Feels like {Math.round(current.apparent_temperature)}° · humidity{" "}
            {current.relative_humidity_2m}%
          </span>
        </div>
      </div>
      <p className="weather-label">
        <CloudSun size={15} /> 5-day forecast · daily high / low °C
      </p>
      <div
        className="forecast-chart"
        role="img"
        aria-label="Five day forecast chart showing daily minimum and maximum temperature"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={daily} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="tempHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#df945a" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#df945a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4c9298" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#4c9298" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7ece9" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71817b", fontSize: 11 }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71817b", fontSize: 10 }} />
            <Tooltip
              formatter={(value, name) => [
                `${Math.round(value)}°C`,
                name === "high" ? "High" : "Low",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid #dfe7e3", fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#c87942"
              strokeWidth={2}
              fill="url(#tempHigh)"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#43868d"
              strokeWidth={2}
              fill="url(#tempLow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="forecast-mini">
        {daily.slice(0, 5).map((day) => (
          <div key={day.day}>
            <span>{day.day}</span>
            <strong>{Math.round(day.high)}°</strong>
            <small>{Math.round(day.low)}°</small>
          </div>
        ))}
      </div>
      {data.airQuality && (
        <div className="air-quality-row">
          <Wind size={15} />
          <span>Air quality model</span>
          <strong>PM2.5 {data.airQuality.pm25 ?? "--"} μg/m³</strong>
          <small>not a health alert</small>
        </div>
      )}
      <Freshness timestamp={data.updatedAt} />
      <div className="source-links">
        {data.sources.map((source) => (
          <SourceAttribution key={source.name} {...source} />
        ))}
      </div>
    </>
  );
}

export function PreparednessPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "INSTRUCTOR";
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const institutions = useRequest(
    () =>
      user?.role === "ADMIN" ? api("/preparedness/institutions") : Promise.resolve({ items: [] }),
    [user?.role]
  );
  useEffect(() => {
    if (!selectedInstitution && institutions.data?.items?.[0]?._id)
      setSelectedInstitution(institutions.data.items[0]._id);
  }, [selectedInstitution, institutions.data]);
  const checklists = useRequest(() => api("/preparedness/checklists"), [user?.id]);
  const drills = useRequest(() => api("/preparedness/drills"), [user?.id]);
  async function createInstitution(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/preparedness/institutions", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      window.location.reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function createChecklist() {
    try {
      await api("/preparedness/checklists", {
        method: "POST",
        body: JSON.stringify({
          title: "School readiness review",
          category: "core-readiness",
          ...(user.role === "ADMIN" ? { institutionId: selectedInstitution } : {}),
          items: [
            "Confirm response responsibilities",
            "Review accessible evacuation arrangements",
            "Check emergency contacts and communication process",
            "Schedule and debrief a practice drill",
          ].map((label) => ({ label, done: false })),
        }),
      });
      await checklists.refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }
  async function createDrill(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await api("/preparedness/drills", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(form.entries()),
          ...(user.role === "ADMIN" ? { institutionId: selectedInstitution } : {}),
        }),
      });
      formElement.reset();
      await drills.refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Institution readiness"
        title="Make plans usable before they’re needed."
        description="Manage school-owned readiness records, practice schedules, and follow-up actions."
      />
      {!user.institutionId && user.role !== "ADMIN" ? (
        <Panel className="onboarding-panel">
          <div className="onboarding-icon">
            <Building2 size={21} />
          </div>
          <div>
            <h2>Connect an institution workspace</h2>
            <p>
              {user.role === "ADMIN"
                ? "Administrators can create and assign institution workspaces."
                : user.role === "INSTRUCTOR" && user.institutionId
                  ? "You are assigned to your institution. Use student management to create accounts within this scope."
                  : "Institution assignment is managed by a platform administrator."}
            </p>
            {user.role === "ADMIN" && (
              <form className="institution-form" onSubmit={createInstitution}>
                <Field
                  id="institution-name"
                  label="Institution name"
                  name="name"
                  required
                  maxLength="140"
                />
                <label className="field" htmlFor="institution-type">
                  <span>Institution type</span>
                  <select id="institution-type" name="type">
                    <option value="school">School</option>
                    <option value="college">College</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <Field id="institution-city" label="City" name="city" maxLength="80" />
                <Field id="institution-state" label="State" name="state" maxLength="80" />
                <Button icon={Plus} disabled={busy}>
                  {busy ? "Registering…" : "Create institution workspace"}
                </Button>
              </form>
            )}
            {message && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}
          </div>
        </Panel>
      ) : (
        <>
          {user.role === "ADMIN" && (
            <label className="field admin-institution-filter" htmlFor="preparedness-institution">
              <span>Institution workspace</span>
              <select
                id="preparedness-institution"
                value={selectedInstitution}
                onChange={(event) => setSelectedInstitution(event.target.value)}
              >
                <option value="">Select an institution</option>
                {(institutions.data?.items || []).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="institution-bar">
            <div>
              <Building2 size={18} />
              <strong>Institution workspace</strong>
              <StatusBadge tone="green">{user.role.replaceAll("-", " ")}</StatusBadge>
            </div>
            <p>Only authorized roles can edit private institution records.</p>
          </div>
          {message && (
            <div className="form-error" role="alert">
              {message}
            </div>
          )}
          <div className="preparedness-grid">
            <Panel>
              <SectionTitle
                title="Readiness checklist"
                description="A working checklist supports planning; it does not certify a building or legal compliance."
                action={
                  canManage && (
                    <Button
                      variant="outline"
                      icon={Plus}
                      disabled={user.role === "ADMIN" && !selectedInstitution}
                      onClick={createChecklist}
                    >
                      New checklist
                    </Button>
                  )
                }
              />
              {checklists.loading ? (
                <LoadingState />
              ) : checklists.error ? (
                <ErrorState message={checklists.error} onRetry={checklists.refresh} />
              ) : checklists.data?.items?.length ? (
                checklists.data.items.map((list) => (
                  <ReadinessChecklist
                    key={list._id}
                    checklist={list}
                    onSave={checklists.refresh}
                    readOnly={!canManage}
                  />
                ))
              ) : (
                <EmptyState
                  title="No readiness checklist yet"
                  description="Create the first institution checklist to organize review tasks."
                  action={
                    canManage && (
                      <Button
                        disabled={user.role === "ADMIN" && !selectedInstitution}
                        onClick={createChecklist}
                      >
                        Create checklist
                      </Button>
                    )
                  }
                />
              )}
            </Panel>
            <Panel>
              <SectionTitle
                title="Practice drills"
                description="Schedule educational exercises and capture lessons learned."
              />
              {drills.loading ? (
                <LoadingState />
              ) : drills.error ? (
                <ErrorState message={drills.error} onRetry={drills.refresh} />
              ) : drills.data?.items?.length ? (
                <div className="drill-list">
                  {drills.data.items.map((drill) => (
                    <article className="drill-row" key={drill._id}>
                      <CalendarDays size={16} />
                      <div>
                        <strong>{drill.title}</strong>
                        <span>
                          {drill.type} · {new Date(drill.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                      <StatusBadge tone={drill.status === "completed" ? "green" : "amber"}>
                        {drill.status}
                      </StatusBadge>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No drills scheduled"
                  description="Use the form below to schedule an exercise."
                />
              )}
              {canManage && (
                <form className="drill-form" onSubmit={createDrill}>
                  <Field
                    id="drill-title"
                    label="Drill title"
                    name="title"
                    required
                    maxLength="160"
                  />
                  <label className="field" htmlFor="drill-type">
                    <span>Drill type</span>
                    <select id="drill-type" name="type">
                      <option value="evacuation">Evacuation</option>
                      <option value="earthquake">Earthquake response</option>
                      <option value="fire">Fire response</option>
                      <option value="weather">Weather preparedness</option>
                    </select>
                  </label>
                  <Field
                    id="drill-date"
                    label="Scheduled date and time"
                    name="scheduledAt"
                    type="datetime-local"
                    required
                  />
                  <label className="field" htmlFor="drill-objectives">
                    <span>Objectives</span>
                    <textarea id="drill-objectives" name="objectives" rows="3" maxLength="2000" />
                  </label>
                  <Button icon={Plus} disabled={user.role === "ADMIN" && !selectedInstitution}>
                    Schedule practice drill
                  </Button>
                </form>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}

function ReadinessChecklist({ checklist, onSave, readOnly = false }) {
  const [items, setItems] = useState(checklist.items);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const completion = items.length
    ? Math.round((items.filter((item) => item.done).length / items.length) * 100)
    : 0;
  async function save() {
    setSaving(true);
    setError("");
    try {
      await api(`/preparedness/checklists/${checklist._id}`, {
        method: "PATCH",
        body: JSON.stringify({ items }),
      });
      await onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="checklist-card">
      <div className="checklist-heading">
        <h3>{checklist.title}</h3>
        <span>{completion}%</span>
      </div>
      <ProgressBar label="Items complete" value={completion} />
      <div className="checklist-items">
        {items.map((item, index) => (
          <label key={`${item.label}-${index}`}>
            <input
              type="checkbox"
              checked={item.done}
              disabled={readOnly}
              onChange={(event) =>
                setItems((previous) =>
                  previous.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, done: event.target.checked } : entry
                  )
                )
              }
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!readOnly && (
        <Button variant="outline" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save checklist"}
        </Button>
      )}
    </div>
  );
}

export function ResourcesPage() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const { data, loading, error, refresh } = useRequest(
    () => api(`/resources?q=${encodeURIComponent(q)}&topic=${encodeURIComponent(topic)}`),
    [q, topic]
  );
  const topics = [...new Set((data?.items || []).map((item) => item.topic))];
  return (
    <>
      <PageHeader
        eyebrow="Resource library"
        title="Start with trusted guidance."
        description="Curated official references for learners, educators, and institution safety teams."
      />
      <div className="resource-controls">
        <label className="search-field">
          <Search size={16} />
          <span className="sr-only">Search resources</span>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search title, topic, or publisher"
          />
        </label>
        <label className="field compact-field">
          <span>Topic</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="">All topics</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <LoadingState label="Loading resources" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <div className="resource-grid">
            {data.items.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <div className="resource-card-top">
                  <span className="resource-topic">{resource.topic}</span>
                  <span className="resource-region">{resource.region}</span>
                </div>
                <h2>{resource.title}</h2>
                <p>{resource.note}</p>
                <div className="resource-meta">
                  <span>{resource.publisher}</span>
                  <span>For {resource.audience}</span>
                </div>
                <SourceAttribution name="Open original source" href={resource.url} />
              </article>
            ))}
          </div>
          <p className="verification-note">
            Resource links last reviewed on {data.verifiedAt}. Check the publisher for updates and
            locally applicable directions.
          </p>
        </>
      )}
    </>
  );
}
