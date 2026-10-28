import test from "node:test";
import assert from "node:assert/strict";
import { learnerQuiz } from "../src/modules/learning/quizzes.js";

test("learner quiz serialization never exposes correct answers or explanations", () => {
  const quiz = {
    _id: "quiz-id",
    title: "Flood readiness",
    description: "A short check.",
    topic: "Flood",
    educationLevel: "secondary",
    status: "published",
    institutionId: "institution-id",
    timeLimitMinutes: 5,
    questions: [
      {
        _id: "question-id",
        prompt: "What should you do?",
        choices: [
          { id: "safe", text: "Follow official guidance" },
          { id: "unsafe", text: "Enter floodwater" },
        ],
        correctChoiceId: "safe",
        explanation: "Floodwater is hazardous.",
      },
    ],
  };
  const learnerView = learnerQuiz(quiz);
  assert.equal(learnerView.questions[0].id, "question-id");
  assert.equal("correctChoiceId" in learnerView.questions[0], false);
  assert.equal("explanation" in learnerView.questions[0], false);
});
