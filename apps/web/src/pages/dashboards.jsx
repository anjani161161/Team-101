import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api, useRequest } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  ProgressBar,
  SectionTitle,
  StatCard,
  StatusBadge,
} from "../components/ui.jsx";

export function RoleDashboardRedirect() {
  const { user } = useAuth();
  const path =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "INSTRUCTOR"
        ? "/instructor/dashboard"
        : "/student/dashboard";
  return <Navigate to={path} replace />;
}

export function AdminDashboardPage() {
  const metrics = useRequest(() => api("/users/analytics"), []);
  const progress = useRequest(() => api("/users/progress-summary"), []);
  const sources = useRequest(() => api("/hazards/sources"), []);
  const audit = useRequest(() => api("/users/audit?page=1"), []);
  const userCounts = metrics.data?.userCounts || [];
  const countRole = (role) =>
    userCounts.filter((row) => row._id.role === role).reduce((sum, row) => sum + row.count, 0);
  const active = userCounts
    .filter((row) => row._id.active)
    .reduce((sum, row) => sum + row.count, 0);
  const inactive = userCounts
    .filter((row) => !row._id.active)
    .reduce((sum, row) => sum + row.count, 0);
  return (
    <>
      <PageHeader
        eyebrow="Platform administration"
        title="Platform overview"
        description="Account, learning, and institutional preparedness activity across AtmosWatch."
        actions={
          <Link className="button button-primary" to="/users">
            <Users size={16} /> Manage users
          </Link>
        }
      />
      {metrics.error && <ErrorState message={metrics.error} onRetry={metrics.refresh} />}
      <div className="stat-grid">
        <StatCard
          icon={Users}
          label="Total users"
          value={
            metrics.loading
              ? "—"
              : countRole("ADMIN") + countRole("INSTRUCTOR") + countRole("STUDENT")
          }
          hint="Persisted accounts"
        />
        <StatCard
          icon={GraduationCap}
          label="Instructors"
          value={metrics.loading ? "—" : countRole("INSTRUCTOR")}
          hint="All account states"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Students"
          value={metrics.loading ? "—" : countRole("STUDENT")}
          hint="All account states"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active accounts"
          value={metrics.loading ? "—" : active}
          hint="Can sign in"
        />
        <StatCard
          icon={Activity}
          label="Inactive accounts"
          value={metrics.loading ? "—" : inactive}
          hint="Pending or deactivated"
        />
        <StatCard
          icon={Building2}
          label="Institutions"
          value={metrics.data?.institutions ?? "—"}
          hint="Registered workspaces"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Lesson completions"
          value={progress.data?.lessonCompletions ?? "—"}
          hint="Across student accounts"
        />
        <StatCard
          icon={Activity}
          label="Assessment attempts"
          value={metrics.data?.assessments ?? "—"}
          hint="Completed simulations"
        />
        <StatCard
          icon={CalendarDays}
          label="Preparedness drills"
          value={metrics.data?.drills ?? "—"}
          hint="Persisted records"
        />
      </div>
      <div className="dashboard-grid admin-overview-grid">
        <Panel>
          <SectionTitle
            title="Learning coverage"
            description="Progress recorded by student accounts."
            action={
              <Link to="/academy" className="link-action">
                Curriculum <ArrowRight size={14} />
              </Link>
            }
          />
          {progress.loading ? (
            <LoadingState label="Loading learning summaries" />
          ) : progress.error ? (
            <ErrorState message={progress.error} onRetry={progress.refresh} />
          ) : progress.data?.modules?.length ? (
            <div className="module-summary-list">
              {progress.data.modules.map((module) => (
                <div className="module-summary-row" key={module.moduleId}>
                  <div>
                    <strong>{module.moduleId.replaceAll("-", " ")}</strong>
                    <span>
                      {module.students} learners · {module.completions} lesson completions
                    </span>
                  </div>
                  <span>
                    {module.averageQuizScore == null
                      ? "No quiz results"
                      : `${Math.round(module.averageQuizScore)}% average`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No learning progress yet"
              description="Progress summaries will appear when students complete lessons."
            />
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="Preparedness overview"
            description="Records currently stored across institutions."
            action={
              <Link to="/preparedness" className="link-action">
                Open preparedness <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="admin-preparedness-stats">
            <div>
              <span>Checklists</span>
              <strong>{metrics.data?.checklists ?? "—"}</strong>
            </div>
            <div>
              <span>Scheduled & completed drills</span>
              <strong>{metrics.data?.drills ?? "—"}</strong>
            </div>
          </div>
          <div className="dashboard-shortcuts">
            <Link to="/users">
              <Users size={17} /> User administration <ArrowRight size={14} />
            </Link>
            <Link to="/admin/audit">
              <ShieldCheck size={17} /> Security audit history <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel>
          <SectionTitle
            title="Recent security activity"
            description="Administrative account and preparedness changes."
            action={
              <Link to="/admin/audit" className="link-action">
                Full audit log <ArrowRight size={14} />
              </Link>
            }
          />
          {audit.loading ? (
            <LoadingState />
          ) : audit.error ? (
            <ErrorState message={audit.error} onRetry={audit.refresh} />
          ) : audit.data?.items?.length ? (
            <div className="activity-list">
              {audit.data.items.slice(0, 5).map((item) => (
                <div className="activity-row" key={item._id}>
                  <span className="activity-mark">
                    <ShieldCheck size={16} />
                  </span>
                  <div>
                    <strong>{item.action.replaceAll(".", " ")}</strong>
                    <p>
                      {item.actorId?.name || "Account"} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No administrative activity yet"
              description="Role, account, and preparedness changes will be listed here."
            />
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="Data source status"
            description="Live availability metadata from configured providers."
            action={
              <Link to="/data-sources" className="link-action">
                Source details <ArrowRight size={14} />
              </Link>
            }
          />
          {sources.loading ? (
            <LoadingState />
          ) : sources.error ? (
            <ErrorState message={sources.error} onRetry={sources.refresh} />
          ) : (
            <div className="source-status-list">
              {(sources.data?.items || []).map((source) => (
                <div key={source.id}>
                  <span>{source.name}</span>
                  <StatusBadge tone={source.configured === false ? "amber" : "green"}>
                    {source.configured === false ? "Not configured" : "Catalogued"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

export function InstructorDashboardPage() {
  const institutions = useRequest(() => api("/preparedness/institutions"), []);
  const summary = useRequest(() => api("/users/progress-summary"), []);
  const drills = useRequest(() => api("/preparedness/drills"), []);
  const checklists = useRequest(() => api("/preparedness/checklists"), []);
  const modules = useRequest(() => api("/learning/modules"), []);
  const { user } = useAuth();
  const upcoming = (drills.data?.items || [])
    .filter((item) => item.status === "planned" && new Date(item.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 4);
  const incomplete = (checklists.data?.items || []).reduce(
    (sum, list) => sum + list.items.filter((item) => !item.done).length,
    0
  );
  return (
    <>
      <PageHeader
        eyebrow="Teaching and preparedness"
        title={`Welcome, ${user?.name?.split(" ")[0] || "Instructor"}.`}
        description={
          institutions.data?.items?.[0]?.name
            ? `Support learning and readiness at ${institutions.data.items[0].name}.`
            : "Support learning and readiness across your assigned institution."
        }
        actions={
          <Link className="button button-primary" to="/users">
            <Users size={16} /> Manage students
          </Link>
        }
      />
      <div className="stat-grid">
        <StatCard
          icon={Users}
          label="Assigned students"
          value={summary.data?.studentCount ?? "—"}
          hint="Your institution only"
        />
        <StatCard
          icon={GraduationCap}
          label="Active learning modules"
          value={modules.data?.items?.length ?? "—"}
          hint="Available curriculum"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Lesson completions"
          value={summary.data?.lessonCompletions ?? "—"}
          hint="Within your institution"
        />
        <StatCard
          icon={Activity}
          label="Average quiz score"
          value={summary.data?.averageQuizScore == null ? "—" : `${summary.data.averageQuizScore}%`}
          hint="Recorded student results"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming drills"
          value={
            drills.data?.items?.filter(
              (item) => item.status === "planned" && new Date(item.scheduledAt) >= new Date()
            ).length ?? "—"
          }
          hint="Institution schedule"
        />
        <StatCard
          icon={CheckCircle2}
          label="Open checklist items"
          value={checklists.data?.items ? incomplete : "—"}
          hint="Institution readiness"
        />
      </div>
      {summary.error && <ErrorState message={summary.error} onRetry={summary.refresh} />}
      <div className="dashboard-grid instructor-grid">
        <Panel>
          <SectionTitle
            title="Student learning progress"
            description="Aggregated by module; student records stay within your institution."
          />
          {summary.loading ? (
            <LoadingState />
          ) : summary.error ? (
            <ErrorState message={summary.error} />
          ) : summary.data?.modules?.length ? (
            <div className="module-summary-list">
              {summary.data.modules.map((item) => (
                <div className="module-summary-row" key={item.moduleId}>
                  <div>
                    <strong>{item.moduleId.replaceAll("-", " ")}</strong>
                    <span>
                      {item.students} students active · {item.completions} lesson completions
                    </span>
                  </div>
                  <span>
                    {item.averageQuizScore == null
                      ? "Not assessed"
                      : `${Math.round(item.averageQuizScore)}% avg.`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                user?.institutionId ? "No student activity yet" : "Institution assignment needed"
              }
              description={
                user?.institutionId
                  ? "Learning activity will appear when your students begin a module."
                  : "An administrator must assign your account to an institution before student activity is available."
              }
              action={
                !user?.institutionId && (
                  <Link className="button button-outline" to="/users">
                    View account workspace
                  </Link>
                )
              }
            />
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="Preparedness schedule"
            description="Planned practice activities in your institution."
            action={
              <Link to="/preparedness" className="link-action">
                Manage drills <ArrowRight size={14} />
              </Link>
            }
          />
          {drills.loading ? (
            <LoadingState />
          ) : drills.error ? (
            <ErrorState message={drills.error} onRetry={drills.refresh} />
          ) : upcoming.length ? (
            <div className="activity-list">
              {upcoming.map((drill) => (
                <div className="activity-row" key={drill._id}>
                  <span className="activity-mark">
                    <CalendarDays size={16} />
                  </span>
                  <div>
                    <strong>{drill.title}</strong>
                    <p>
                      {new Date(drill.scheduledAt).toLocaleString()} · {drill.type}
                    </p>
                  </div>
                  <StatusBadge tone="blue">Planned</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming drills"
              description="Schedule an educational practice activity for your institution."
              action={
                <Link className="button button-outline" to="/preparedness">
                  Open readiness workspace
                </Link>
              }
            />
          )}
        </Panel>
      </div>
      <Panel>
        <SectionTitle
          title="Teaching actions"
          description="Jump into an existing educational workflow."
        />
        <div className="dashboard-action-grid">
          <Link to="/academy">
            <BookOpenCheck size={18} />
            <strong>Explore learning modules</strong>
            <span>Review the lesson pathways available to students.</span>
          </Link>
          <Link to="/simulations">
            <Compass size={18} />
            <strong>Open crisis simulations</strong>
            <span>Practice decisions in a non-emergency learning environment.</span>
          </Link>
          <Link to="/quizzes">
            <BookOpenCheck size={18} />
            <strong>Create and review quizzes</strong>
            <span>Publish institution quizzes and review authorized results.</span>
          </Link>
          <Link to="/users">
            <Users size={18} />
            <strong>Create a student account</strong>
            <span>Provision a student in your assigned institution.</span>
          </Link>
        </div>
      </Panel>
    </>
  );
}

export function StudentDashboardPage() {
  const { user } = useAuth();
  const institutions = useRequest(() => api("/preparedness/institutions"), []);
  const modules = useRequest(() => api("/learning/modules"), []);
  const progress = useRequest(() => api("/learning/progress"), []);
  const attempts = useRequest(() => api("/simulations/attempts"), []);
  const checklist = useRequest(() => api("/preparedness/personal-checklist"), []);
  const [saving, setSaving] = useState(false);
  const progressItems = progress.data?.items || [];
  const completedModules = (modules.data?.items || []).filter((module) => {
    const row = progressItems.find((item) => item.moduleId === module.id);
    return row && row.completedLessons.length >= module.lessons.length;
  });
  const nextModule = (modules.data?.items || []).find((module) => {
    const row = progressItems.find((item) => item.moduleId === module.id);
    return !row || row.completedLessons.length < module.lessons.length;
  });
  const savedLessons = progressItems.reduce((sum, item) => sum + item.completedLessons.length, 0);
  const totalLessons = (modules.data?.items || []).reduce(
    (sum, item) => sum + item.lessons.length,
    0
  );
  async function toggleChecklist(itemId, done) {
    if (!checklist.data?.item) return;
    setSaving(true);
    try {
      const items = checklist.data.item.items.map((item) => ({
        id: item.id,
        done: item.id === itemId ? done : item.done,
      }));
      await api("/preparedness/personal-checklist", {
        method: "PATCH",
        body: JSON.stringify({ items }),
      });
      await checklist.refresh();
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="My learning and safety"
        title={`Hi, ${user?.name?.split(" ")[0] || "there"}.`}
        description={
          institutions.data?.items?.[0]?.name
            ? `Your learning workspace at ${institutions.data.items[0].name}.`
            : "A little practice today can help you feel more ready tomorrow."
        }
        actions={
          nextModule && (
            <Link className="button button-primary" to={`/academy/${nextModule.id}`}>
              <BookOpenCheck size={16} /> Continue learning
            </Link>
          )
        }
      />
      <div className="stat-grid student-stats">
        <StatCard
          icon={BookOpenCheck}
          label="Lessons completed"
          value={progress.loading ? "—" : `${savedLessons}/${totalLessons}`}
          hint="Your saved progress"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed modules"
          value={completedModules.length}
          hint="Your learning milestones"
        />
        <StatCard
          icon={Activity}
          label="Practice scenarios"
          value={attempts.data?.items?.length ?? "—"}
          hint="Your completed attempts"
        />
      </div>
      {(progress.error || attempts.error) && (
        <ErrorState message={progress.error || attempts.error} onRetry={progress.refresh} />
      )}
      <div className="dashboard-grid student-learning-grid">
        <Panel>
          <SectionTitle
            title="My learning progress"
            description="Only your own lesson progress and quiz results are shown."
          />
          {progress.loading || modules.loading ? (
            <LoadingState />
          ) : modules.error ? (
            <ErrorState message={modules.error} onRetry={modules.refresh} />
          ) : (
            <div className="module-progress-list">
              {(modules.data?.items || []).map((module) => {
                const item = progressItems.find((row) => row.moduleId === module.id);
                const count = item?.completedLessons?.length || 0;
                return (
                  <Link
                    to={`/academy/${module.id}`}
                    key={module.id}
                    className="module-progress-row"
                  >
                    <span className="module-progress-icon">
                      <BookOpenCheck size={17} />
                    </span>
                    <span className="module-progress-copy">
                      <strong>{module.title}</strong>
                      <ProgressBar
                        value={Math.round((count / module.lessons.length) * 100)}
                        label={`${count} of ${module.lessons.length} lessons`}
                      />
                    </span>
                    <span className="module-progress-score">
                      {item?.quizScore == null ? "Start" : `${item.quizScore}%`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="My readiness checklist"
            description="A personal checklist saved to your account."
          />
          <StudentChecklist
            data={checklist.data?.item}
            loading={checklist.loading}
            error={checklist.error}
            onRetry={checklist.refresh}
            onToggle={toggleChecklist}
            saving={saving}
          />
        </Panel>
      </div>
      <Panel>
        <SectionTitle
          title="Practice and explore"
          description="Choose a way to build your safety knowledge."
        />
        <div className="dashboard-action-grid student-action-grid">
          <Link to={nextModule ? `/academy/${nextModule.id}` : "/academy"}>
            <GraduationCap size={18} />
            <strong>Explore a learning pathway</strong>
            <span>Earthquake, flood, fire, and heat safety.</span>
          </Link>
          <Link to="/simulations">
            <Compass size={18} />
            <strong>Practice a scenario</strong>
            <span>Try a decision-making exercise and see feedback.</span>
          </Link>
          <Link to="/disaster-guides">
            <ShieldCheck size={18} />
            <strong>Read a safety guide</strong>
            <span>Find public guidance and official resources.</span>
          </Link>
        </div>
      </Panel>
      <div className="dashboard-grid student-lower-grid">
        <Panel>
          <SectionTitle title="Recent practice" description="Your saved simulation attempts." />
          {attempts.loading ? (
            <LoadingState />
          ) : attempts.data?.items?.length ? (
            <div className="activity-list">
              {attempts.data.items.slice(0, 4).map((item) => (
                <div className="activity-row" key={item._id}>
                  <span className="activity-mark">
                    <Compass size={16} />
                  </span>
                  <div>
                    <strong>{item.scenarioId.replaceAll("-", " ")}</strong>
                    <p>{new Date(item.completedAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge tone="green">{item.score}%</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No practice attempts yet"
              description="Your completed scenarios will appear here."
              action={
                <Link className="button button-outline" to="/simulations">
                  Try a scenario
                </Link>
              }
            />
          )}
        </Panel>
        <Panel>
          <SectionTitle
            title="My reports"
            description="Student report submission is not available in this version."
          />
          <EmptyState
            icon={FileText}
            title="No report history"
            description="For an urgent safety concern, tell a trusted adult and follow your institution's approved response plan."
          />
        </Panel>
      </div>
    </>
  );
}

function StudentChecklist({ data, loading, error, onRetry, onToggle, saving }) {
  if (loading) return <LoadingState label="Loading your checklist" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  const items = data?.items || [];
  const done = items.filter((item) => item.done).length;
  return (
    <div className="personal-checklist">
      <ProgressBar
        label="Readiness steps"
        value={items.length ? Math.round((done / items.length) * 100) : 0}
      />
      {items.map((item) => (
        <label className="personal-checklist-item" key={item.id}>
          <input
            type="checkbox"
            checked={item.done}
            disabled={saving}
            onChange={(event) => onToggle(item.id, event.target.checked)}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
}
