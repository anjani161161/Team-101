import { Router } from "express";
import { z } from "zod";
import { scenarios } from "../../data/curriculum.js";
import { SimulationAttempt } from "../../models/index.js";
import { requireAuth } from "../../middleware/auth.js";
import { scoreScenario } from "./scoring.js";

const router = Router();
router.get("/scenarios", (_req, res) =>
  res.json({
    items: scenarios.map(({ steps, ...scenario }) => ({ ...scenario, steps: steps.length })),
    label: "Educational simulation",
  })
);
router.get("/scenarios/:scenarioId", (req, res) => {
  const scenario = scenarios.find((item) => item.id === req.params.scenarioId);
  if (!scenario)
    return res
      .status(404)
      .json({ error: { code: "SCENARIO_NOT_FOUND", message: "Simulation was not found." } });
  res.json({
    item: {
      ...scenario,
      steps: scenario.steps.map((step) => ({
        ...step,
        choices: step.choices.map(({ correct, ...choice }) => choice),
      })),
    },
    label: "Educational simulation",
  });
});
router.get("/attempts", requireAuth, async (req, res, next) => {
  try {
    res.json({
      items: await SimulationAttempt.find({ userId: req.user.id })
        .sort({ completedAt: -1 })
        .limit(50)
        .lean(),
    });
  } catch (error) {
    next(error);
  }
});
router.post("/attempts", requireAuth, async (req, res, next) => {
  try {
    const input = z
      .object({
        scenarioId: z.string(),
        answers: z.array(z.object({ stepId: z.string(), choiceId: z.string() })).max(20),
      })
      .parse(req.body);
    const scenario = scenarios.find((item) => item.id === input.scenarioId);
    if (!scenario)
      return res
        .status(404)
        .json({ error: { code: "SCENARIO_NOT_FOUND", message: "Simulation was not found." } });
    const result = scoreScenario(scenario, input.answers);
    const attempt = await SimulationAttempt.create({
      userId: req.user.id,
      scenarioId: scenario.id,
      answers: result.answers,
      score: result.score,
    });
    res.status(201).json({ item: attempt, feedback: result.feedback });
  } catch (error) {
    next(error);
  }
});
export default router;
