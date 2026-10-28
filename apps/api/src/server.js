import "./config/env.js";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT || 5000);
if (
  !process.env.SESSION_SECRET ||
  process.env.SESSION_SECRET.length < 32 ||
  process.env.SESSION_SECRET === "replace_with_at_least_32_random_characters"
) {
  console.error(
    "Set SESSION_SECRET to a random value of at least 32 characters before starting the API."
  );
  process.exit(1);
}
connectDatabase().catch((error) =>
  console.error(`Database unavailable; public feeds remain available: ${error.message}`)
);
app.listen(port, () => console.log(`AtmosWatch API listening on http://localhost:${port}`));
