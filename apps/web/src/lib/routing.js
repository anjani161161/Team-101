export function roleHome(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "INSTRUCTOR") return "/instructor/dashboard";
  return "/student/dashboard";
}

export function roleCanAccessPath(role, pathname) {
  if (pathname.startsWith("/admin/")) return role === "ADMIN";
  if (pathname.startsWith("/instructor/")) return role === "INSTRUCTOR";
  if (pathname.startsWith("/student/")) return role === "STUDENT";
  if (pathname === "/users") return role === "ADMIN" || role === "INSTRUCTOR";
  return [
    "/dashboard",
    "/academy",
    "/learning/disasters",
    "/simulations",
    "/intelligence",
    "/preparedness",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
