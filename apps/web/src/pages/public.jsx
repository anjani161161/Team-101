import { ArrowRight, BookOpenCheck, Compass, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api, useRequest } from "../lib/api.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
} from "../components/ui.jsx";

export function AboutPage() {
  return (
    <main className="public-content">
      <PageHeader
        eyebrow="About AtmosWatch"
        title="Preparedness belongs in everyday learning."
        description="AtmosWatch helps school and college communities learn about hazards, practise safer decisions, and organize institutional readiness."
        actions={
          <Link className="button button-primary" to="/login">
            Sign in to your workspace <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="public-feature-grid">
        <PublicFeature
          icon={BookOpenCheck}
          title="Learn"
          description="Follow short, source-linked pathways for common hazards."
        />
        <PublicFeature
          icon={Compass}
          title="Practice"
          description="Explore educational decision scenarios with feedback."
        />
        <PublicFeature
          icon={ShieldCheck}
          title="Prepare"
          description="Authorized institutional roles can coordinate checklists and practice drills."
        />
      </div>
      <div className="public-note">
        <strong>Educational guidance, not emergency authority.</strong>
        <span>
          AtmosWatch is not a warning service, dispatch system, or building-safety certification.
          Follow local authorities and approved institutional plans.
        </span>
      </div>
    </main>
  );
}

export function HowItWorksPage() {
  return (
    <main className="public-content">
      <PageHeader
        eyebrow="How it works"
        title="Learn, practise, and prepare together."
        description="The public information pages are open to everyone. Sign in to access the workspace your account is authorized to use."
      />
      <ol className="public-steps">
        <li>
          <span>01</span>
          <div>
            <strong>Explore trusted guidance</strong>
            <p>
              Read public safety resources and learn how the hazard-data sources are used and where
              they have limitations.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>Build practical knowledge</strong>
            <p>
              Authenticated learners can work through lessons and server-scored knowledge checks.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>Practise decisions</strong>
            <p>Interactive scenarios are educational exercises, never live emergency alerts.</p>
          </div>
        </li>
        <li>
          <span>04</span>
          <div>
            <strong>Coordinate institutional readiness</strong>
            <p>
              Administrators and assigned instructors can manage institution records within their
              authorization.
            </p>
          </div>
        </li>
      </ol>
      <Link to="/login" className="button button-primary">
        Sign in <ArrowRight size={15} />
      </Link>
    </main>
  );
}

export function DisasterGuidesPage() {
  return (
    <main className="public-content">
      <PageHeader
        eyebrow="Disaster safety guides"
        title="Start with practical, official guidance."
        description="Use trusted guidance for your location and follow the response plan approved by your institution."
      />
      <div className="public-guide-list">
        <a href="https://sachet.ndma.gov.in/DosDont" target="_blank" rel="noreferrer">
          <span>
            <strong>NDMA SACHET: Do's and Don'ts</strong>
            <small>Public, multilingual guidance for multiple hazards.</small>
          </span>
          <ArrowRight size={17} />
        </a>
        <a href="https://nidm.gov.in/schoolsafety.asp" target="_blank" rel="noreferrer">
          <span>
            <strong>NIDM: School Safety</strong>
            <small>Preparedness and disaster-risk education for learning institutions.</small>
          </span>
          <ArrowRight size={17} />
        </a>
        <a href="https://www.undrr.org/education" target="_blank" rel="noreferrer">
          <span>
            <strong>UNDRR: Education</strong>
            <small>Disaster risk reduction and safer education resources.</small>
          </span>
          <ArrowRight size={17} />
        </a>
      </div>
      <div className="public-note">
        <strong>In an emergency</strong>
        <span>
          Contact local emergency services and follow official instructions. AtmosWatch does not
          send warnings or dispatch responders.
        </span>
      </div>
      <Link to="/resources" className="link-action">
        Browse the resource library <ArrowRight size={14} />
      </Link>
    </main>
  );
}

export function DataSourcesPage() {
  const { data, loading, error, refresh } = useRequest(() => api("/hazards/sources"), []);
  return (
    <main className="public-content">
      <PageHeader
        eyebrow="Data sources"
        title="Understand the information behind the interface."
        description="Provider observations and model forecasts are separate kinds of information. They are not local risk assessments or official warnings."
      />
      {loading ? (
        <LoadingState label="Loading source catalog" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="public-source-list">
          {(data?.items || []).map((source) => (
            <Panel key={source.id}>
              <div className="public-source-heading">
                <div>
                  <h2>{source.name}</h2>
                  <p>{source.hazards.join(" · ")}</p>
                </div>
                <StatusBadge tone={source.configured === false ? "amber" : "blue"}>
                  {source.integrationStatus === "not-integrated" ? "Not connected" : source.type}
                </StatusBadge>
              </div>
              <p>
                {source.type === "forecast"
                  ? "Model output; forecasts vary by place and provider."
                  : source.type === "live-observation"
                    ? "Provider event observations; coverage and update times depend on the source."
                    : "This source is catalogued but is not connected to the application."}
              </p>
              <small>Attribution: {source.attribution}</small>
              <a href={source.url} target="_blank" rel="noreferrer">
                Open source documentation <ArrowRight size={14} />
              </a>
            </Panel>
          ))}
          {!data?.items?.length && (
            <EmptyState title="Source catalog unavailable" description="Try again in a moment." />
          )}
        </div>
      )}
    </main>
  );
}

function PublicFeature({ icon: Icon, title, description }) {
  return (
    <article className="public-feature">
      <span>
        <Icon size={19} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
