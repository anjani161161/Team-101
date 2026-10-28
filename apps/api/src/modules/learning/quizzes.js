import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Institution, Quiz, QuizAttempt } from "../../models/index.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();
const choiceSchema = z
  .object({ id: z.string().trim().min(1).max(40), text: z.string().trim().min(1).max(300) })
  .strict();
const questionSchema = z
  .object({
    prompt: z.string().trim().min(5).max(1000),
    choices: z.array(choiceSchema).min(2).max(6),
    correctChoiceId: z.string().min(1).max(40),
    explanation: z.string().trim().max(1000).default(""),
  })
  .strict()
  .refine(
    (question) =>
      new Set(question.choices.map((choice) => choice.id)).size === question.choices.length &&
      question.choices.some((choice) => choice.id === question.correctChoiceId),
    "Each question needs unique choices and one valid correct answer"
  );
const quizSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().max(2000).default(""),
    topic: z.string().trim().min(2).max(80),
    educationLevel: z.enum(["primary", "secondary", "college", "adult"]),
    timeLimitMinutes: z.coerce.number().int().min(0).max(240).default(0),
    institutionId: z.string().optional(),
    questions: z.array(questionSchema).min(1).max(50),
  })
  .strict();

function quizScope(user) {
  return user.role === "ADMIN" ? {} : { institutionId: user.institutionId };
}

export function learnerQuiz(quiz) {
  const item = quiz.toObject ? quiz.toObject() : quiz;
  return {
    id: String(item._id),
    title: item.title,
    description: item.description,
    topic: item.topic,
    educationLevel: item.educationLevel,
    timeLimitMinutes: item.timeLimitMinutes,
    status: item.status,
    institutionId: item.institutionId,
    questions: item.questions.map((question) => ({
      id: String(question._id),
      prompt: question.prompt,
      choices: question.choices,
    })),
  };
}

function managedQuiz(quiz) {
  const item = learnerQuiz(quiz);
  const full = quiz.toObject ? quiz.toObject() : quiz;
  return {
    ...item,
    questions: item.questions.map((question, index) => ({
      ...question,
      correctChoiceId: full.questions[index].correctChoiceId,
      explanation: full.questions[index].explanation,
    })),
    createdBy: String(full.createdBy),
    createdAt: full.createdAt,
    updatedAt: full.updatedAt,
    publishedAt: full.publishedAt || null,
  };
}

function parseId(id) {
  return mongoose.isValidObjectId(id);
}

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN" && !req.user.institutionId) return res.json({ items: [] });
    const filter = { ...quizScope(req.user) };
    if (req.user.role === "ADMIN" && req.query.institutionId) {
      if (!parseId(req.query.institutionId))
        return res.status(400).json({
          error: { code: "INVALID_INSTITUTION", message: "Institution identifier is invalid." },
        });
      filter.institutionId = req.query.institutionId;
    }
    if (req.user.role === "STUDENT") filter.status = "published";
    if (req.user.role === "INSTRUCTOR")
      filter.$or = [{ status: "published" }, { createdBy: req.user.id }];
    const rows = await Quiz.find(filter)
      .select("+questions.correctChoiceId +questions.explanation")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    res.json({
      items: rows.map((quiz) =>
        req.user.role === "STUDENT" ? learnerQuiz(quiz) : managedQuiz(quiz)
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (!new Set(["ADMIN", "INSTRUCTOR"]).has(req.user.role))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Only instructors and administrators can create quizzes.",
        },
      });
    const input = quizSchema.parse(req.body);
    const institutionId =
      req.user.role === "INSTRUCTOR" ? req.user.institutionId : input.institutionId;
    if (
      !institutionId ||
      (req.user.role === "INSTRUCTOR" &&
        input.institutionId &&
        input.institutionId !== String(req.user.institutionId))
    )
      return res.status(403).json({
        error: {
          code: "INSTITUTION_SCOPE_FORBIDDEN",
          message: "Assign the quiz to your authorized institution.",
        },
      });
    if (!(await Institution.exists({ _id: institutionId, active: { $ne: false } })))
      return res.status(400).json({
        error: { code: "INSTITUTION_NOT_FOUND", message: "Choose an active institution." },
      });
    const quiz = await Quiz.create({ ...input, institutionId, createdBy: req.user.id });
    res.status(201).json({ item: managedQuiz(quiz) });
  } catch (error) {
    next(error);
  }
});

router.get("/:quizId", async (req, res, next) => {
  try {
    if (!parseId(req.params.quizId))
      return res
        .status(404)
        .json({ error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found." } });
    const filter = { _id: req.params.quizId, ...quizScope(req.user) };
    if (req.user.role === "STUDENT") filter.status = "published";
    if (req.user.role === "INSTRUCTOR")
      filter.$or = [{ status: "published" }, { createdBy: req.user.id }];
    const quiz = await Quiz.findOne(filter).select(
      "+questions.correctChoiceId +questions.explanation"
    );
    if (!quiz)
      return res.status(404).json({
        error: {
          code: "QUIZ_NOT_FOUND",
          message: "Quiz was not found in your authorized workspace.",
        },
      });
    res.json({ item: req.user.role === "STUDENT" ? learnerQuiz(quiz) : managedQuiz(quiz) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:quizId", async (req, res, next) => {
  try {
    if (!new Set(["ADMIN", "INSTRUCTOR"]).has(req.user.role))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Only instructors and administrators can edit quizzes.",
        },
      });
    if (!parseId(req.params.quizId))
      return res
        .status(404)
        .json({ error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found." } });
    const input = quizSchema.parse(req.body);
    const filter = { _id: req.params.quizId, status: "draft", ...quizScope(req.user) };
    if (req.user.role === "INSTRUCTOR") filter.createdBy = req.user.id;
    const quiz = await Quiz.findOne(filter).select(
      "+questions.correctChoiceId +questions.explanation"
    );
    if (!quiz)
      return res.status(404).json({
        error: {
          code: "QUIZ_NOT_EDITABLE",
          message: "Draft quiz was not found in your authorized workspace.",
        },
      });
    const institutionId =
      req.user.role === "INSTRUCTOR"
        ? req.user.institutionId
        : input.institutionId || String(quiz.institutionId);
    if (!(await Institution.exists({ _id: institutionId, active: { $ne: false } })))
      return res.status(400).json({
        error: { code: "INSTITUTION_NOT_FOUND", message: "Choose an active institution." },
      });
    Object.assign(quiz, input, { institutionId });
    await quiz.save();
    res.json({ item: managedQuiz(quiz) });
  } catch (error) {
    next(error);
  }
});

router.post("/:quizId/publish", async (req, res, next) => {
  try {
    if (!new Set(["ADMIN", "INSTRUCTOR"]).has(req.user.role))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Only instructors and administrators can publish quizzes.",
        },
      });
    if (!parseId(req.params.quizId))
      return res
        .status(404)
        .json({ error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found." } });
    const filter = { _id: req.params.quizId, status: "draft", ...quizScope(req.user) };
    if (req.user.role === "INSTRUCTOR") filter.createdBy = req.user.id;
    const quiz = await Quiz.findOneAndUpdate(
      filter,
      { $set: { status: "published", publishedAt: new Date() } },
      { new: true }
    ).select("+questions.correctChoiceId +questions.explanation");
    if (!quiz)
      return res.status(404).json({
        error: {
          code: "QUIZ_NOT_PUBLISHABLE",
          message: "Draft quiz was not found in your authorized workspace.",
        },
      });
    res.json({ item: managedQuiz(quiz) });
  } catch (error) {
    next(error);
  }
});

router.post("/:quizId/attempts", async (req, res, next) => {
  try {
    if (req.user.role !== "STUDENT")
      return res.status(403).json({
        error: {
          code: "STUDENT_ACCESS_REQUIRED",
          message: "Only students can submit quiz attempts.",
        },
      });
    if (!parseId(req.params.quizId) || !req.user.institutionId)
      return res.status(404).json({
        error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found for your institution." },
      });
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      institutionId: req.user.institutionId,
      status: "published",
    }).select("+questions.correctChoiceId +questions.explanation");
    if (!quiz)
      return res.status(404).json({
        error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found for your institution." },
      });
    const input = z
      .object({
        answers: z
          .array(z.object({ questionId: z.string(), choiceId: z.string() }).strict())
          .length(quiz.questions.length),
      })
      .strict()
      .parse(req.body);
    const answerMap = new Map(input.answers.map((answer) => [answer.questionId, answer.choiceId]));
    if (answerMap.size !== quiz.questions.length)
      return res.status(400).json({
        error: {
          code: "INVALID_ANSWERS",
          message: "Submit exactly one answer for each question.",
        },
      });
    const answers = quiz.questions.map((question) => {
      const choiceId = answerMap.get(String(question._id));
      if (!question.choices.some((choice) => choice.id === choiceId))
        throw Object.assign(new Error("Choose a listed answer for every question."), {
          status: 400,
          code: "INVALID_ANSWER",
        });
      return {
        questionId: String(question._id),
        choiceId,
        correct: choiceId === question.correctChoiceId,
      };
    });
    const correct = answers.filter((answer) => answer.correct).length;
    const score = Math.round((correct / answers.length) * 100);
    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      institutionId: quiz.institutionId,
      userId: req.user.id,
      correct,
      total: answers.length,
      score,
      answers,
    });
    res.status(201).json({
      item: {
        id: attempt.id,
        score,
        correct,
        total: answers.length,
        submittedAt: attempt.submittedAt,
        feedback: quiz.questions.map((question, index) => ({
          questionId: String(question._id),
          correct: answers[index].correct,
          correctChoiceId: question.correctChoiceId,
          explanation: question.explanation,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:quizId/results", async (req, res, next) => {
  try {
    if (!new Set(["ADMIN", "INSTRUCTOR"]).has(req.user.role))
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Quiz results are restricted to authorized educators.",
        },
      });
    if (!parseId(req.params.quizId))
      return res
        .status(404)
        .json({ error: { code: "QUIZ_NOT_FOUND", message: "Quiz was not found." } });
    const filter = { _id: req.params.quizId, ...quizScope(req.user) };
    if (req.user.role === "INSTRUCTOR") filter.createdBy = req.user.id;
    const quiz = await Quiz.findOne(filter).select("_id institutionId");
    if (!quiz)
      return res.status(404).json({
        error: {
          code: "QUIZ_NOT_FOUND",
          message: "Quiz was not found in your authorized workspace.",
        },
      });
    const attempts = await QuizAttempt.find({ quizId: quiz._id, institutionId: quiz.institutionId })
      .populate("userId", "name email")
      .sort({ submittedAt: -1 })
      .limit(500)
      .lean();
    res.json({
      items: attempts.map((attempt) => ({
        id: attempt._id,
        student: attempt.userId ? { name: attempt.userId.name, email: attempt.userId.email } : null,
        score: attempt.score,
        correct: attempt.correct,
        total: attempt.total,
        submittedAt: attempt.submittedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
