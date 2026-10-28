import test from "node:test";
import assert from "node:assert/strict";
import {
  disasterTopics,
  disasterTopicForLearner,
  validateDisasterScenarioCatalog,
} from "../src/data/disaster-learning.js";
import { normalizeNasaStories } from "../src/modules/public/disaster-updates.js";

test("all 14 hazard pathways contain five distinct original animated lessons", () => {
  assert.equal(disasterTopics.length, 14);
  assert.equal(validateDisasterScenarioCatalog(), true);
  for (const topic of disasterTopics) {
    assert.equal(topic.lessons.length, 5, topic.slug);
    assert.equal(topic.scenarios.length, 5, topic.slug);
    assert.equal(new Set(topic.scenarios.map((item) => item.id)).size, 5, topic.slug);
    assert.ok(
      topic.scenarios.every(
        (item) => item.contentType === "ANIMATED_SCENARIO" && item.learningObjectives.length > 0
      ),
      topic.slug
    );
    assert.ok(
      topic.scenarios.every((item) => item.assetUrl === null && item.embeddingUrl === null),
      topic.slug
    );
    assert.ok(topic.before.length >= 4, topic.slug);
    assert.ok(topic.during.length >= 4, topic.slug);
    assert.ok(topic.after.length >= 4, topic.slug);
    assert.ok(
      topic.sources.every((source) => source.url.startsWith("https://")),
      topic.slug
    );
  }
});

test("learner topic serialization does not expose quiz or scenario answers", () => {
  for (const topic of disasterTopics) {
    const safe = disasterTopicForLearner(topic);
    assert.equal("answer" in safe.quiz, false, topic.slug);
    assert.equal("answer" in safe.scenarios[0].checkpoint, false, topic.slug);
  }
});

test("NASA feed normalization retains verified publisher, image credit, dates, and source URL", () => {
  const xml = `<?xml version="1.0"?><rss><channel><item>
    <title><![CDATA[Wildfire Smoke Observed from Space]]></title>
    <link>https://science.nasa.gov/earth/earth-observatory/wildfire-smoke/</link>
    <pubDate>Tue, 27 Oct 2026 04:00:00 +0000</pubDate>
    <category><![CDATA[Wildfires]]></category>
    <description><![CDATA[<p>Satellites observe smoke from a wildfire.</p>]]></description>
    <content:encoded><![CDATA[<figure><img src="https://images-assets.nasa.gov/image/test/test~large.jpg" alt="Satellite image of smoke"><figcaption>Image: NASA Earth Observatory / Test Team</figcaption></figure>]]></content:encoded>
  </item></channel></rss>`;
  const [story] = normalizeNasaStories(xml);
  assert.equal(story.title, "Wildfire Smoke Observed from Space");
  assert.equal(story.publisher, "NASA Earth Observatory");
  assert.equal(story.category, "Wildfire and smoke");
  assert.equal(story.publishedAt, "2026-10-27T04:00:00.000Z");
  assert.equal(story.imageUrl, "https://images-assets.nasa.gov/image/test/test~large.jpg");
  assert.equal(story.imageCredit, "Image: NASA Earth Observatory / Test Team");
  assert.equal(story.eventAt, null);
  assert.doesNotMatch(story.summary, /appeared first on/i);
});

test("feed normalization rejects unrelated stories and untrusted image hosts", () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Clear Skies</title><link>https://science.nasa.gov/earth/clear-skies/</link><description>Cloud patterns</description></item>
    <item><title>Flood Signals</title><link>https://science.nasa.gov/earth/flood-signals/</link><pubDate>Tue, 27 Oct 2026 04:00:00 +0000</pubDate><category>Flood</category><content:encoded><![CDATA[<figure><img src="https://untrusted.example/image.jpg"><figcaption>Credit: unknown source</figcaption></figure>]]></content:encoded></item>
  </channel></rss>`;
  const stories = normalizeNasaStories(xml);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].imageUrl, null);
  assert.equal(stories[0].imageCredit, "Credit: unknown source");
});
