import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock("../lib/api.js", () => ({ api }));

import { AuthProvider, useAuth } from "./auth.jsx";

function AuthState() {
  const { user, loading, authUnavailable, restoreSession } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="unavailable">{String(authUnavailable)}</span>
      <span data-testid="role">{user?.role || "none"}</span>
      <button onClick={restoreSession}>retry</button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  api.mockReset();
});

describe("authentication restoration", () => {
  it.each(["ADMIN", "INSTRUCTOR", "STUDENT"])("restores the server role %s", async (role) => {
    api.mockResolvedValue({ user: { id: "user-1", role } });
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await waitFor(() => expect(screen.getByTestId("role")).toHaveTextContent(role));
    expect(api).toHaveBeenCalledWith("/auth/me");
  });

  it("keeps an unavailable backend distinct from an unauthenticated response and retries", async () => {
    api.mockRejectedValueOnce(Object.assign(new Error("temporary outage"), { status: 503 }));
    api.mockResolvedValueOnce({ user: { id: "user-2", role: "INSTRUCTOR" } });
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("unavailable")).toHaveTextContent("true"));
    expect(screen.getByTestId("role")).toHaveTextContent("none");
    await act(async () => screen.getByRole("button", { name: "retry" }).click());
    await waitFor(() => expect(screen.getByTestId("role")).toHaveTextContent("INSTRUCTOR"));
    expect(screen.getByTestId("unavailable")).toHaveTextContent("false");
  });

  it("only treats a confirmed 401 as an invalid session", async () => {
    api.mockRejectedValueOnce(Object.assign(new Error("expired"), { status: 401 }));
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("role")).toHaveTextContent("none");
    expect(screen.getByTestId("unavailable")).toHaveTextContent("false");
  });
});
