import { describe, expect, it } from "vitest";
import { roleCanAccessPath, roleHome } from "./routing.js";

describe("role-aware navigation", () => {
  it("sends each role to its own dashboard", () => {
    expect(roleHome("ADMIN")).toBe("/admin/dashboard");
    expect(roleHome("INSTRUCTOR")).toBe("/instructor/dashboard");
    expect(roleHome("STUDENT")).toBe("/student/dashboard");
  });

  it("keeps role-specific and account administration pages scoped", () => {
    expect(roleCanAccessPath("ADMIN", "/admin/audit")).toBe(true);
    expect(roleCanAccessPath("STUDENT", "/admin/audit")).toBe(false);
    expect(roleCanAccessPath("INSTRUCTOR", "/users")).toBe(true);
    expect(roleCanAccessPath("STUDENT", "/users")).toBe(false);
  });

  it("allows shared learning tools to all signed-in roles", () => {
    for (const role of ["ADMIN", "INSTRUCTOR", "STUDENT"]) {
      expect(roleCanAccessPath(role, "/academy/heat-safety")).toBe(true);
      expect(roleCanAccessPath(role, "/simulations")).toBe(true);
      expect(roleCanAccessPath(role, "/learning/disasters/earthquake")).toBe(true);
    }
    expect(roleCanAccessPath("STUDENT", "/about")).toBe(false);
  });
});
