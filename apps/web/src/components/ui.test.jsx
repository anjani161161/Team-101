import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar, StatusBadge, LoadingState, EmptyState } from "./ui.jsx";
import { BrandLogo } from "./brand-logo.jsx";

describe("shared interface primitives", () => {
  it("uses the AtmosWatch artwork variants with descriptive image text", () => {
    render(
      <>
        <BrandLogo variant="full" />
        <BrandLogo variant="compact" />
        <BrandLogo variant="symbol" />
      </>
    );
    expect(screen.getByAltText(/global disaster emblem/i)).toHaveAttribute(
      "src",
      "/brand/atmoswatch-logo-master.png"
    );
    expect(screen.getByAltText("AtmosWatch, A Safer Tomorrow, Together.")).toHaveAttribute(
      "src",
      "/brand/atmoswatch-logo-header.webp"
    );
    expect(screen.getByAltText(/mountain, globe/i)).toHaveAttribute(
      "src",
      "/brand/atmoswatch-mark.png"
    );
  });

  it("renders progress with accessible values", () => {
    render(<ProgressBar label="Pathway progress" value={67} />);
    expect(screen.getByRole("progressbar", { name: "Pathway progress" })).toHaveAttribute(
      "aria-valuenow",
      "67"
    );
  });

  it("clamps progress outside the valid range", () => {
    render(<ProgressBar label="Readiness" value={120} />);
    expect(screen.getByRole("progressbar", { name: "Readiness" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("renders semantic statuses and reusable loading and empty states", () => {
    render(
      <>
        <StatusBadge tone="amber">Simulation</StatusBadge>
        <LoadingState label="Loading lessons" />
        <EmptyState title="No drills yet" description="Schedule an exercise." />
      </>
    );
    expect(screen.getByText("Simulation")).toHaveClass("status-amber");
    expect(screen.getByRole("status")).toHaveTextContent("Loading lessons");
    expect(screen.getByText("No drills yet")).toBeInTheDocument();
  });
});
