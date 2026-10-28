import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

test("local Vite login/logout origins pass the credentialed CORS and mutation checks", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const allowed = await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Origin: "http://localhost:5174" },
    });
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5174");
    assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");

    const denied = await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Origin: "https://attacker.example" },
    });
    assert.equal(denied.status, 403);
    assert.equal((await denied.json()).error.code, "ORIGIN_REJECTED");

    const missing = await fetch(`${base}/api/v1/auth/logout`, { method: "POST" });
    assert.equal(missing.status, 403);
    assert.equal((await missing.json()).error.code, "ORIGIN_REQUIRED");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
