import { Router } from "express";

const router = Router();
const resources = [
  {
    id: "moe-school-safety",
    title: "Guidelines on School Safety and Security",
    topic: "School safety policy",
    audience: "School leaders, teachers, families",
    publisher: "Ministry of Education, Government of India",
    region: "India",
    url: "https://dsel.education.gov.in/sites/default/files/2021-10/guidelines_sss.pdf",
    note: "Advisory guidance circulated to States/UTs; local rules and notifications apply.",
  },
  {
    id: "pib-school-safety",
    title: "School safety guidelines and institutional accountability",
    topic: "Institutional responsibilities",
    audience: "School communities",
    publisher: "Press Information Bureau, Government of India",
    region: "India",
    url: "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2048042",
    note: "Official PIB release dated 23 August 2024.",
  },
  {
    id: "nidm-school",
    title: "School Safety",
    topic: "Preparedness and drills",
    audience: "School administrators and educators",
    publisher: "National Institute of Disaster Management",
    region: "India",
    url: "https://nidm.mha.gov.in/safety_school.asp",
    note: "NIDM overview and links to school safety materials.",
  },
  {
    id: "cssf-2022",
    title: "Comprehensive School Safety Framework 2022–2030",
    topic: "Global school safety framework",
    audience: "Education authorities and institutions",
    publisher: "UNDRR / GADRRRES",
    region: "Global",
    url: "https://www.undrr.org/publication/comprehensive-school-safety-framework-2017",
    note: "The publication page indicates the 2022–2030 edition is available; review the current edition through that page.",
  },
  {
    id: "undrr-guidance",
    title: "School emergency and disaster preparedness: guidance note",
    topic: "Emergency planning and exercises",
    audience: "School administrators, staff, teachers and students",
    publisher: "UNDRR Regional Office for Asia and Pacific",
    region: "Global",
    url: "https://www.undrr.org/publication/school-emergency-and-disaster-preparedness-guidance-note",
    note: "Published in 2010; useful process guidance, not a substitute for current local requirements.",
  },
  {
    id: "ndma-sachet",
    title: "SACHET National Disaster Alert Portal: Do's and Don'ts",
    topic: "Hazard safety guidance",
    audience: "Public and education communities",
    publisher: "National Disaster Management Authority",
    region: "India",
    url: "https://sachet.ndma.gov.in/DosDont",
    note: "Hazard guidance is available across multiple Indian languages; follow current local authority directions.",
  },
  {
    id: "usgs-earthquake",
    title: "USGS Earthquake Catalog API",
    topic: "Earthquake observations",
    audience: "Educators and learners",
    publisher: "United States Geological Survey",
    region: "Global",
    url: "https://earthquake.usgs.gov/fdsnws/event/1/",
    note: "USGS recommends its real-time GeoJSON feeds for automated display where possible.",
  },
  {
    id: "gdacs-api",
    title: "GDACS API",
    topic: "Global multi-hazard observations",
    audience: "Educators and safety coordinators",
    publisher: "Global Disaster Awareness and Coordination System",
    region: "Global",
    url: "https://www.gdacs.org/gdacsapi/swagger/index.html",
    note: "Acknowledge GDACS as the data source and review its disclaimer and terms.",
  },
  {
    id: "firms",
    title: "NASA FIRMS Active Fire Data",
    topic: "Satellite fire detections",
    audience: "Educators and analysts",
    publisher: "NASA Earthdata",
    region: "Global",
    url: "https://firms.modaps.eosdis.nasa.gov/content/active_fire/",
    note: "Data access requires Earthdata registration for some downloads. Satellite detections are not a complete fire perimeter or local warning.",
  },
];
router.get("/", (req, res) => {
  const q = String(req.query.q || "")
    .trim()
    .toLowerCase();
  const topic = String(req.query.topic || "")
    .trim()
    .toLowerCase();
  const items = resources.filter(
    (resource) =>
      (!q ||
        `${resource.title} ${resource.topic} ${resource.publisher}`.toLowerCase().includes(q)) &&
      (!topic || resource.topic.toLowerCase().includes(topic))
  );
  res.json({ items, verifiedAt: "2026-10-27" });
});
export default router;
