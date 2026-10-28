import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedScenarioPlayer, ScenarioIllustration } from "./disasters.jsx";

const topic = {
  slug: "earthquake",
  icon: "activity",
  quiz: { prompt: "What should you do?", choices: [{ id: "safe", text: "Take the safe action" }] },
};

const scenario = {
  id: "earthquake-1",
  title: "Classroom shaking",
  durationSeconds: 45,
  objective: "Choose a safe response.",
  setting: "A classroom begins to shake.",
  decision: "What will you do?",
  action: "Protect your head and neck.",
  explanation: "This reduces exposure to falling objects.",
  attribution: "Safety guidance references NDMA.",
  checkpoint: {
    question: "What is safest?",
    choices: [{ id: "safe", text: "Take the safe action" }],
  },
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("animated disaster scenarios", () => {
  it("renders the current scene as an accessible hazard illustration", () => {
    const { container } = render(
      <ScenarioIllustration
        topic={topic}
        step={2}
        frame={{ title: "Move", text: "Use the planned route." }}
      />
    );
    expect(screen.getByRole("img", { name: "Move: Use the planned route." })).toBeInTheDocument();
    expect(container.querySelector(".scene-phase-2 .scene-route")).toBeInTheDocument();
    expect(screen.getByText(/not real incident footage/)).toBeInTheDocument();
  });

  it("plays through the captioned sequence, submits a checkpoint, and saves completion", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        correct: true,
        completed: true,
        explanation: "Correct. Stay with the group.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimatedScenarioPlayer
        scenario={scenario}
        topic={topic}
        number={1}
        complete={false}
        onRefresh={onRefresh}
        onError={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Play scenario" }));
    await act(async () => {
      vi.advanceTimersByTime(13_000);
    });
    expect(container.querySelector(".scene-phase-3")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Learning checkpoint" })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Take the safe action"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit checkpoint" }));
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/learning/disasters/earthquake/scenarios/earthquake-1/checkpoint",
      expect.objectContaining({ method: "POST" })
    );
    expect(screen.getByText("Scenario complete")).toBeInTheDocument();
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
