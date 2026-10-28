export function scoreQuiz(module, answers) {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  if (
    answers.length !== module.quiz.length ||
    answeredIds.size !== module.quiz.length ||
    module.quiz.some((question) => !answeredIds.has(question.id))
  ) {
    throw Object.assign(new Error("Submit exactly one answer for every question."), {
      status: 400,
      code: "INCOMPLETE_QUIZ",
    });
  }
  const results = answers.map((answer) => {
    const question = module.quiz.find((item) => item.id === answer.questionId);
    if (!question || !question.options.some((option) => option.id === answer.choiceId))
      throw Object.assign(new Error("An answer refers to an unknown question or choice."), {
        status: 400,
        code: "INVALID_ANSWER",
      });
    return {
      questionId: question.id,
      correct: question.answer === answer.choiceId,
      explanation: question.explanation,
    };
  });
  return {
    score: Math.round((results.filter((item) => item.correct).length / module.quiz.length) * 100),
    results,
  };
}
