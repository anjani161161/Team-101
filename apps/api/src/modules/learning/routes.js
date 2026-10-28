import { Router } from "express";
import { z } from "zod";
import { modules } from "../../data/curriculum.js";
import { LessonProgress } from "../../models/index.js";
import { requireAuth } from "../../middleware/auth.js";
import { scoreQuiz } from "./scoring.js";
import {
  disasterTopics,
  disasterTopicForLearner,
  getDisasterTopic,
} from "../../data/disaster-learning.js";

const router = Router();
router.get("/disasters", requireAuth, async (req, res, next) => {
  try {
    const progress = await LessonProgress.find({
      userId: req.user.id,
      moduleId: /^disaster-/,
    }).lean();
    const byId = new Map(progress.map((item) => [item.moduleId, item]));
    res.json({
      items: disasterTopics.map((topic) => {
        const safeTopic = disasterTopicForLearner(topic);
        const saved = byId.get(topic.id);
        const total = topic.lessons.length + topic.scenarios.length;
        return {
          ...safeTopic,
          progress: {
            completed: saved?.completedLessons?.length || 0,
            total,
            percent: total ? Math.round(((saved?.completedLessons?.length || 0) / total) * 100) : 0,
            quizScore: saved?.quizScore ?? null,
            completedLessons: saved?.completedLessons || [],
          },
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});
router.get("/disasters/:slug", requireAuth, async (req, res, next) => {
  try {
    const topic = getDisasterTopic(req.params.slug);
    if (!topic)
      return res
        .status(404)
        .json({ error: { code: "TOPIC_NOT_FOUND", message: "Disaster topic was not found." } });
    const progress = await LessonProgress.findOne({
      userId: req.user.id,
      moduleId: topic.id,
    }).lean();
    res.json({ item: { ...disasterTopicForLearner(topic), progress: progress || null } });
  } catch (error) {
    next(error);
  }
});
router.get("/disasters/:slug/videos", requireAuth, (req, res) => {
  const topic = getDisasterTopic(req.params.slug);
  if (!topic)
    return res
      .status(404)
      .json({ error: { code: "TOPIC_NOT_FOUND", message: "Disaster topic was not found." } });
  res.json({ items: topic.scenarios, contentType: "ANIMATED_SCENARIO", externalVideoCount: 0 });
});
router.post("/disasters/:slug/quiz", requireAuth, async (req, res, next) => {
  try {
    const topic = getDisasterTopic(req.params.slug);
    if (!topic)
      return res
        .status(404)
        .json({ error: { code: "TOPIC_NOT_FOUND", message: "Disaster topic was not found." } });
    const input = z
      .object({ choiceId: z.string().min(1).max(40) })
      .strict()
      .parse(req.body);
    const optionIds = topic.quiz.choices.map(([id]) => id);
    if (!optionIds.includes(input.choiceId))
      return res
        .status(400)
        .json({ error: { code: "INVALID_ANSWER", message: "Choose one of the listed answers." } });
    const correct = input.choiceId === topic.quiz.answer;
    const result = { score: correct ? 100 : 0, correct, explanation: topic.quiz.explanation };
    await LessonProgress.findOneAndUpdate(
      { userId: req.user.id, moduleId: topic.id },
      {
        $set: { quizScore: result.score },
        $setOnInsert: { userId: req.user.id, moduleId: topic.id },
      },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.post(
  "/disasters/:slug/scenarios/:scenarioId/checkpoint",
  requireAuth,
  async (req, res, next) => {
    try {
      const topic = getDisasterTopic(req.params.slug);
      const scenario = topic?.scenarios.find((item) => item.id === req.params.scenarioId);
      if (!topic || !scenario)
        return res.status(404).json({
          error: { code: "SCENARIO_NOT_FOUND", message: "Animated scenario was not found." },
        });
      const input = z
        .object({ choiceId: z.string().min(1).max(40) })
        .strict()
        .parse(req.body);
      if (!scenario.checkpoint.choices.some((choice) => choice.id === input.choiceId))
        return res.status(400).json({
          error: { code: "INVALID_ANSWER", message: "Choose one of the listed answers." },
        });
      const correct = input.choiceId === topic.quiz.answer;
      if (correct) {
        await LessonProgress.findOneAndUpdate(
          { userId: req.user.id, moduleId: topic.id },
          {
            $setOnInsert: { userId: req.user.id, moduleId: topic.id },
            $addToSet: { completedLessons: `scenario:${scenario.id}` },
          },
          { upsert: true, new: true, runValidators: true }
        );
      }
      res.json({ correct, explanation: topic.quiz.explanation, completed: correct });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/modules", (_req, res) =>
  res.json({
    items: modules.map(({ quiz, ...item }) => item),
    source: "curated-education",
    demo: false,
  })
);
router.get("/modules/:moduleId", (req, res) => {
  const item = modules.find((module) => module.id === req.params.moduleId);
  if (!item)
    return res
      .status(404)
      .json({ error: { code: "MODULE_NOT_FOUND", message: "Learning module was not found." } });
  res.json({ ...item, quiz: item.quiz.map(({ answer, ...question }) => question) });
});
router.get("/progress", requireAuth, async (req, res, next) => {
  try {
    res.json({ items: await LessonProgress.find({ userId: req.user.id }).lean() });
  } catch (error) {
    next(error);
  }
});
router.post("/modules/:moduleId/quiz", requireAuth, async (req, res, next) => {
  try {
    const module = modules.find((item) => item.id === req.params.moduleId);
    if (!module)
      return res
        .status(404)
        .json({ error: { code: "MODULE_NOT_FOUND", message: "Learning module was not found." } });
    const input = z
      .object({
        answers: z
          .array(z.object({ questionId: z.string(), choiceId: z.string() }))
          .length(module.quiz.length),
      })
      .parse(req.body);
    const result = scoreQuiz(module, input.answers);
    await LessonProgress.findOneAndUpdate(
      { userId: req.user.id, moduleId: module.id },
      { userId: req.user.id, moduleId: module.id, quizScore: result.score },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.put("/progress/:moduleId", requireAuth, async (req, res, next) => {
  try {
    const module =
      modules.find((item) => item.id === req.params.moduleId) ||
      disasterTopics.find((item) => item.id === req.params.moduleId);
    if (!module)
      return res
        .status(404)
        .json({ error: { code: "MODULE_NOT_FOUND", message: "Learning module was not found." } });
    const lessonIds = module.lessons.map((lesson) => lesson.id);
    const schema = z
      .object({
        completedLessons: z.array(z.string()).max(lessonIds.length),
      })
      .strict();
    const input = schema.parse(req.body);
    if (
      input.completedLessons.length > lessonIds.length ||
      input.completedLessons.some((id) => !lessonIds.includes(id))
    )
      return res.status(400).json({
        error: { code: "INVALID_LESSON", message: "One or more lesson identifiers are invalid." },
      });
    const progress = await LessonProgress.findOneAndUpdate(
      { userId: req.user.id, moduleId: module.id },
      { ...input, userId: req.user.id, moduleId: module.id },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ item: progress });
  } catch (error) {
    next(error);
  }
});
export default router;
