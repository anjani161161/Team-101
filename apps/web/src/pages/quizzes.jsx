import { useMemo, useState } from "react";
import { Plus, Send, ClipboardList, CheckCircle2 } from "lucide-react";
import { api, useRequest } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  Panel,
  SectionTitle,
  StatusBadge,
} from "../components/ui.jsx";

const blankQuestion = () => ({
  prompt: "",
  choices: [
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ],
  correctChoiceId: "",
  explanation: "",
});

export function QuizWorkspacePage() {
  const { user } = useAuth();
  const isEducator = ["ADMIN", "INSTRUCTOR"].includes(user?.role);
  const quizzes = useRequest(() => api("/learning/quizzes"), []);
  const institutions = useRequest(
    () =>
      user?.role === "ADMIN" ? api("/preparedness/institutions") : Promise.resolve({ items: [] }),
    [user?.role]
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("Earthquake safety");
  const [educationLevel, setEducationLevel] = useState("secondary");
  const [institutionId, setInstitutionId] = useState("");
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [answers, setAnswers] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => quizzes.data?.items?.find((quiz) => quiz.id === selectedId) || null,
    [quizzes.data, selectedId]
  );

  async function createQuiz(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const item = {
        title,
        description,
        topic,
        educationLevel,
        questions: questions.map((question) => ({
          ...question,
          correctChoiceId: question.correctChoiceId || question.choices[0]?.id,
        })),
        ...(user.role === "ADMIN" ? { institutionId } : {}),
      };
      await api("/learning/quizzes", { method: "POST", body: JSON.stringify(item) });
      setTitle("");
      setDescription("");
      setQuestions([blankQuestion()]);
      await quizzes.refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function publish(quizId) {
    setBusy(true);
    setError("");
    try {
      await api(`/learning/quizzes/${quizId}/publish`, { method: "POST" });
      await quizzes.refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitAttempt(event) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const result = await api(`/learning/quizzes/${selected.id}/attempts`, {
        method: "POST",
        body: JSON.stringify({
          answers: selected.questions.map((question) => ({
            questionId: question.id,
            choiceId: answers[question.id],
          })),
        }),
      });
      setFeedback(result.item);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadResults(quizId) {
    setError("");
    try {
      setSelectedId(quizId);
      setResults(await api(`/learning/quizzes/${quizId}/results`));
    } catch (cause) {
      setError(cause.message);
    }
  }

  function updateQuestion(questionIndex, update) {
    setQuestions((items) =>
      items.map((question, index) =>
        index === questionIndex ? { ...question, ...update } : question
      )
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Institution assessments"
        title={isEducator ? "Quizzes & assessments" : "Assigned quizzes"}
        description={
          isEducator
            ? "Create a draft, review it, then publish it to learners in your institution."
            : "Published quizzes assigned to your institution."
        }
        actions={
          <StatusBadge tone="blue">
            {user?.institutionId ? "Institution workspace" : "Institution assignment required"}
          </StatusBadge>
        }
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {isEducator && (
        <Panel>
          <SectionTitle
            title="Create a quiz"
            description="Draft questions are private to authorized educators. Publishing makes the quiz available to students in the institution."
          />
          <form className="form-stack" onSubmit={createQuiz}>
            <Field
              id="quiz-title"
              label="Quiz title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength="3"
              maxLength="160"
              required
            />
            <label className="field" htmlFor="quiz-description">
              <span>Description</span>
              <textarea
                id="quiz-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                rows={2}
              />
            </label>
            <div className="form-grid">
              <Field
                id="quiz-topic"
                label="Disaster topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                maxLength="80"
                required
              />
              <label className="field" htmlFor="quiz-level">
                <span>Learning level</span>
                <select
                  id="quiz-level"
                  value={educationLevel}
                  onChange={(event) => setEducationLevel(event.target.value)}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="college">College</option>
                  <option value="adult">Adult</option>
                </select>
              </label>
            </div>
            {user?.role === "ADMIN" && (
              <label className="field" htmlFor="quiz-institution">
                <span>Institution</span>
                <select
                  id="quiz-institution"
                  required
                  value={institutionId}
                  onChange={(event) => setInstitutionId(event.target.value)}
                >
                  <option value="">Choose an institution</option>
                  {(institutions.data?.items || []).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {questions.map((question, questionIndex) => (
              <fieldset className="quiz-question-editor" key={questionIndex}>
                <legend>Question {questionIndex + 1}</legend>
                <label className="field">
                  <span>Question</span>
                  <textarea
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={2}
                    value={question.prompt}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { prompt: event.target.value })
                    }
                  />
                </label>
                {question.choices.map((choice, choiceIndex) => (
                  <div className="quiz-choice-edit" key={choice.id}>
                    <label className="field">
                      <span>Choice {choiceIndex + 1}</span>
                      <input
                        required
                        maxLength={300}
                        value={choice.text}
                        onChange={(event) =>
                          updateQuestion(questionIndex, {
                            choices: question.choices.map((item) =>
                              item.id === choice.id ? { ...item, text: event.target.value } : item
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="quiz-correct">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={question.correctChoiceId === choice.id}
                        onChange={() =>
                          updateQuestion(questionIndex, { correctChoiceId: choice.id })
                        }
                        required
                      />{" "}
                      Correct
                    </label>
                  </div>
                ))}
                {question.choices.length < 6 && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      updateQuestion(questionIndex, {
                        choices: [...question.choices, { id: crypto.randomUUID(), text: "" }],
                      })
                    }
                  >
                    <Plus size={14} /> Add choice
                  </button>
                )}
                <label className="field">
                  <span>Explanation shown after submission</span>
                  <textarea
                    maxLength={1000}
                    rows={2}
                    value={question.explanation}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { explanation: event.target.value })
                    }
                  />
                </label>
              </fieldset>
            ))}
            {questions.length < 50 && (
              <button
                type="button"
                className="text-button"
                onClick={() => setQuestions((items) => [...items, blankQuestion()])}
              >
                <Plus size={14} /> Add question
              </button>
            )}
            <Button disabled={busy || (user?.role === "ADMIN" && !institutionId)} type="submit">
              {busy ? "Saving…" : "Save draft"}
            </Button>
          </form>
        </Panel>
      )}
      <div className="dashboard-grid">
        <Panel>
          <SectionTitle
            title={isEducator ? "Institution quizzes" : "Available quizzes"}
            description="Access is enforced by your account role and institution."
          />
          {quizzes.loading ? (
            <LoadingState />
          ) : quizzes.error ? (
            <ErrorState message={quizzes.error} onRetry={quizzes.refresh} />
          ) : quizzes.data?.items?.length ? (
            <div className="activity-list">
              {quizzes.data.items.map((quiz) => (
                <div className="activity-row quiz-row" key={quiz.id}>
                  <span className="activity-mark">
                    <ClipboardList size={16} />
                  </span>
                  <div className="quiz-row-copy">
                    <strong>{quiz.title}</strong>
                    <p>
                      {quiz.topic} · {quiz.questions.length} questions · {quiz.educationLevel}
                    </p>
                  </div>
                  <StatusBadge tone={quiz.status === "published" ? "green" : "amber"}>
                    {quiz.status}
                  </StatusBadge>
                  {isEducator ? (
                    <div className="quiz-row-actions">
                      {quiz.status === "draft" && (
                        <Button disabled={busy} onClick={() => publish(quiz.id)}>
                          <Send size={14} /> Publish
                        </Button>
                      )}
                      <button className="text-button" onClick={() => loadResults(quiz.id)}>
                        Results
                      </button>
                    </div>
                  ) : (
                    quiz.status === "published" && (
                      <Button
                        onClick={() => {
                          setSelectedId(quiz.id);
                          setAnswers({});
                          setFeedback(null);
                          setResults(null);
                        }}
                      >
                        Start quiz
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={isEducator ? "No institution quizzes yet" : "No published quizzes"}
              description={
                isEducator
                  ? "Save your first draft to begin."
                  : "Published institution quizzes will appear here."
              }
            />
          )}
        </Panel>
        {selected && user?.role === "STUDENT" && (
          <Panel>
            <SectionTitle
              title={selected.title}
              description={`${selected.topic} · ${selected.questions.length} questions`}
            />
            {feedback ? (
              <div role="status">
                <p>
                  <CheckCircle2 size={16} /> Score: {feedback.score}% ({feedback.correct}/
                  {feedback.total})
                </p>
                {feedback.feedback.map((item) => (
                  <p key={item.questionId}>
                    {item.correct ? "Correct" : "Review"}: {item.explanation}
                  </p>
                ))}
              </div>
            ) : (
              <form className="form-stack" onSubmit={submitAttempt}>
                {selected.questions.map((question, index) => (
                  <fieldset className="quiz-question-editor" key={question.id}>
                    <legend>
                      {index + 1}. {question.prompt}
                    </legend>
                    {question.choices.map((choice) => (
                      <label className="quiz-answer" key={choice.id}>
                        <input
                          type="radio"
                          name={question.id}
                          required
                          checked={answers[question.id] === choice.id}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [question.id]: choice.id }))
                          }
                        />
                        {choice.text}
                      </label>
                    ))}
                  </fieldset>
                ))}
                <Button disabled={busy}>{busy ? "Submitting…" : "Submit answers"}</Button>
              </form>
            )}
          </Panel>
        )}
        {results && isEducator && (
          <Panel>
            <SectionTitle
              title="Student results"
              description="Attempts from this quiz's institution."
            />
            {results.items.length ? (
              results.items.map((item) => (
                <div className="module-summary-row" key={item.id}>
                  <span>{item.student?.name || "Student"}</span>
                  <strong>
                    {item.score}% · {item.correct}/{item.total}
                  </strong>
                </div>
              ))
            ) : (
              <EmptyState
                title="No attempts yet"
                description="Student submissions will appear here."
              />
            )}
          </Panel>
        )}
      </div>
    </>
  );
}
