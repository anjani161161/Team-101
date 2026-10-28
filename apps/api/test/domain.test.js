import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin } from "../src/security/origins.js";

test("development origins support only the local Vite port range", () => {
  const env = { NODE_ENV: "development", WEB_ORIGIN: "http://localhost:5173" };
  for (const port of [5173, 5174, 5175, 5176]) {
    assert.equal(isAllowedOrigin(`http://localhost:${port}`, env), true);
    assert.equal(isAllowedOrigin(`http://127.0.0.1:${port}`, env), true);
  }
  assert.equal(isAllowedOrigin("http://localhost:5177", env), false);
  assert.equal(isAllowedOrigin("https://localhost:5173", env), false);
  assert.equal(isAllowedOrigin("https://attacker.example", env), false);
});

test("production origins must be explicitly configured", () => {
  const env = {
    NODE_ENV: "production",
    WEB_ORIGIN: "https://atmoswatch.example",
    ALLOWED_ORIGINS: "https://admin.atmoswatch.example, https://staff.atmoswatch.example",
  };
  assert.equal(isAllowedOrigin("https://atmoswatch.example", env), true);
  assert.equal(isAllowedOrigin("https://staff.atmoswatch.example", env), true);
  assert.equal(isAllowedOrigin("http://localhost:5173", env), false);
  assert.equal(isAllowedOrigin("https://attacker.example", env), false);
});
import { modules, scenarios } from "../src/data/curriculum.js";
import { scoreQuiz } from "../src/modules/learning/scoring.js";
import { scoreScenario } from "../src/modules/simulations/scoring.js";

test("quiz scoring returns explanations without trusting a client score", () => {
  const module = modules.find((item) => item.id === "earthquake-ready");
  const result = scoreQuiz(module, [
    { questionId: "q-cover", choiceId: "b" },
    { questionId: "q-lift", choiceId: "b" },
  ]);
  assert.equal(result.score, 100);
  assert.equal(result.results.length, 2);
  assert.equal(
    result.results.every((item) => item.correct && item.explanation),
    true
  );
});

test("quiz scoring rejects duplicate question answers", () => {
  const module = modules.find((item) => item.id === "earthquake-ready");
  assert.throws(
    () =>
      scoreQuiz(module, [
        { questionId: "q-cover", choiceId: "b" },
        { questionId: "q-cover", choiceId: "b" },
      ]),
    { code: "INCOMPLETE_QUIZ", status: 400 }
  );
});

test("scenario scoring uses server-owned choices and scores each decision once", () => {
  const scenario = scenarios.find((item) => item.id === "classroom-earthquake");
  const result = scoreScenario(scenario, [
    { stepId: "first", choiceId: "drop" },
    { stepId: "next", choiceId: "lift" },
  ]);
  assert.equal(result.score, 50);
  assert.deepEqual(
    result.feedback.map((item) => item.correct),
    [true, false]
  );
});

test("scenario scoring rejects repeated step answers", () => {
  const scenario = scenarios.find((item) => item.id === "classroom-earthquake");
  assert.throws(
    () =>
      scoreScenario(scenario, [
        { stepId: "first", choiceId: "drop" },
        { stepId: "first", choiceId: "run" },
      ]),
    { code: "INCOMPLETE_SCENARIO", status: 400 }
  );
});
