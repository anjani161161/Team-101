export function scoreScenario(scenario, answers) {
  const answeredIds = new Set(answers.map((answer) => answer.stepId));
  if (
    answers.length !== scenario.steps.length ||
    answeredIds.size !== scenario.steps.length ||
    scenario.steps.some((step) => !answeredIds.has(step.id))
  ) {
    throw Object.assign(new Error("Submit exactly one action for every decision."), {
      status: 400,
      code: "INCOMPLETE_SCENARIO",
    });
  }
  const evaluated = answers.map((answer) => {
    const step = scenario.steps.find((item) => item.id === answer.stepId);
    if (!step)
      throw Object.assign(new Error("An answer refers to an unknown scenario step."), {
        status: 400,
        code: "INVALID_STEP",
      });
    const choice = step.choices.find((item) => item.id === answer.choiceId);
    if (!choice)
      throw Object.assign(new Error("An answer refers to an unknown choice."), {
        status: 400,
        code: "INVALID_CHOICE",
      });
    return {
      answer: { ...answer, correct: choice.correct },
      feedback: { stepId: step.id, correct: choice.correct, explanation: choice.feedback },
    };
  });
  return {
    answers: evaluated.map((item) => item.answer),
    feedback: evaluated.map((item) => item.feedback),
    score: Math.round(
      (evaluated.filter((item) => item.answer.correct).length / scenario.steps.length) * 100
    ),
  };
}
