/** Простая защита admin API (тот же пароль, что у /admin). */
export function isAdminAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  const header = request.headers.get("x-admin-password");
  return Boolean(header && header === expected);
}

export function adminUnauthorized() {
  return Response.json({ error: "Нужен пароль администратора" }, { status: 401 });
}
