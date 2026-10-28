const ndma = { publisher: "NDMA SACHET", url: "https://sachet.ndma.gov.in/DosDont" };
const ndrf = {
  publisher: "National Disaster Response Force",
  url: "https://www.ndrf.gov.in/en/disaster-awareness",
};
const nidm = {
  publisher: "National Institute of Disaster Management",
  url: "https://nidm.mha.gov.in/iec.asp",
};
const ready = { publisher: "Ready.gov", url: "https://www.ready.gov/" };

const topics = [
  {
    slug: "earthquake",
    title: "Earthquakes",
    category: "Geological",
    level: "Beginner",
    icon: "activity",
    overview:
      "An earthquake is ground shaking caused by sudden movement in the Earth. Shaking can damage structures and utilities, and may trigger aftershocks, landslides, fires, or (in some coastal settings) a tsunami.",
    causes:
      "Most damaging earthquakes result from movement on faults as tectonic stress is released. Local soil, building design, distance, depth, and construction quality affect how strongly a place shakes.",
    signs:
      "Most earthquakes cannot be predicted reliably. Follow official alerts where an authorized warning system exists; do not treat a phone notification or animal behaviour as a dependable prediction.",
    myth: "Standing in a doorway is not a universal safest action. During shaking indoors, Drop, Cover, and Hold On where practical; follow local guidance for your building and situation.",
    context:
      "Earthquake exposure varies across India, including Himalayan and other seismic zones. A national zone map does not determine whether a particular building is safe.",
    before: [
      "Learn the institution's safe-cover locations, exits, assembly area, and communication plan.",
      "Secure heavy items through facilities staff; keep exit routes clear.",
      "Practise Drop, Cover, and Hold On and accessible alternatives during approved drills.",
      "Know how your group will account for everyone and support mobility, hearing, vision, or communication needs.",
    ],
    during: [
      "Indoors: get low, cover your head and neck under sturdy furniture if close, and hold on; stay away from glass.",
      "Do not run outside or use stairs while the building is shaking.",
      "Outdoors: move away from buildings, poles, trees, and overhead lines if you can do so safely.",
      "In a vehicle: stop in a clear place away from structures and wires; follow official directions.",
    ],
    after: [
      "When shaking stops, expect aftershocks. Follow staff and authority instructions; evacuate using the planned route when directed and safe.",
      "Do not use lifts or re-enter a damaged structure until authorities say it is safe.",
      "Report injuries, fire, gas odours, and hazards to responsible adults or emergency services; do not touch damaged utilities.",
      "If near a coast, follow tsunami warnings and evacuation directions; strong or long shaking may require immediate movement to high ground under local plans.",
    ],
    evacuation:
      "Protect yourself during shaking first. Evacuate after it stops only when the route is safe or officials direct you; use accessible routes and the designated assembly point.",
    quiz: {
      prompt: "Shaking starts while you are in class. What is the safest immediate action?",
      choices: [
        ["cover", "Drop, Cover, and Hold On where practical"],
        ["run", "Run to the stairs"],
        ["door", "Stand in a doorway"],
      ],
      answer: "cover",
      explanation:
        "Protect your head and neck during shaking; evacuate only after it stops and it is safe or directed.",
    },
    scenarios: [
      "Classroom shaking",
      "Earthquake at home",
      "Shaking outdoors",
      "Post-shaking evacuation",
      "Aftershock and damaged building",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      {
        publisher: "USGS Earthquake Hazards Program",
        url: "https://www.usgs.gov/programs/earthquake-hazards",
      },
      ready,
    ],
  },
  {
    slug: "flood",
    title: "Floods and urban flooding",
    category: "Water-related",
    level: "Beginner",
    icon: "waves",
    overview:
      "Flooding occurs when water covers land that is usually dry. River floods, intense rainfall, drainage overflow, coastal surge, and dam or embankment failures have different warning and evacuation needs.",
    causes:
      "Heavy or prolonged rain, saturated ground, blocked or undersized drains, river overflow, storm surge, and infrastructure failure can contribute. Urban surfaces can make runoff rise quickly.",
    signs:
      "Use official weather, river, and local authority alerts. Rising water, fast runoff, drain backflow, and road closures are danger signs; conditions can change faster than a forecast suggests.",
    myth: "A shallow-looking crossing is not safe. Water depth, current, hidden openings, contamination, and electrical hazards are difficult to judge.",
    context:
      "Monsoon rainfall, river basins, coastal exposure, and drainage vary widely in India. Follow district and institution-specific plans rather than a generic map or social post.",
    before: [
      "Know local flood warnings, safe higher locations, and alternate accessible routes.",
      "Keep essential medicines, documents, water, and communication needs in a ready kit as directed by local plans.",
      "Protect important items from water only when there is time and doing so is safe.",
      "Agree how staff will account for learners and communicate with families.",
    ],
    during: [
      "Move away from rising water to the designated safer place; follow evacuation orders promptly.",
      "Never walk, swim, or drive through floodwater; do not enter underpasses or drains.",
      "Avoid fallen wires, wet electrical equipment, and contact with potentially contaminated water.",
      "If trapped, move to a safer upper location only if the building plan and authorities direct; signal for help and do not enter roof or flowing water without instruction.",
    ],
    after: [
      "Wait for official all-clear and re-entry directions; floodwater may hide debris, contamination, and unstable ground.",
      "Do not operate electrical equipment that has been wet; report hazards to adults and utilities.",
      "Use safe water guidance from local authorities and seek medical help for injury or illness.",
      "Expect renewed rainfall, river rise, and damaged roads; use official updates, not rumours.",
    ],
    evacuation:
      "Leave early when authorities or the site plan instruct. Use the designated route to higher, safer ground; never use a route that crosses floodwater.",
    quiz: {
      prompt: "Your usual campus path is covered by moving water. What should you do?",
      choices: [
        ["cross", "Cross if it looks shallow"],
        ["avoid", "Stay out of the water and follow the safe route with staff"],
        ["film", "Walk closer to inspect it"],
      ],
      answer: "avoid",
      explanation:
        "Floodwater can hide hazards and move people or vehicles; use official instructions and a route clear of water.",
    },
    scenarios: [
      "Flood warning before school",
      "Urban underpass flooding",
      "Rising water on campus",
      "A flooded road crossing",
      "Re-entry after floodwater",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "Central Water Commission", url: "https://cwc.gov.in/flood-forecasting" },
      ready,
    ],
  },
  {
    slug: "fire",
    title: "Fire and building fires",
    category: "Fire and smoke",
    level: "Beginner",
    icon: "flame",
    overview:
      "A fire can spread heat, smoke, and toxic gases quickly. Building layout, materials, ventilation, alarm systems, and the fire's location affect the safest exit.",
    causes:
      "Electrical faults, cooking, open flames, laboratory work, unsafe storage, and deliberate ignition can start fires. Prevention belongs to trained adults and facilities teams.",
    signs:
      "Treat an alarm, visible flame, unusual smoke, or burning smell as a potential emergency. Raise the alarm using the approved method and notify staff; do not investigate alone.",
    myth: "Smoke is dangerous even when flames are not visible. Do not assume a familiar exit is usable if smoke or heat blocks it.",
    context:
      "Fire exits, alarm systems, and assembly locations are site-specific. Schools and colleges should follow local fire codes and the approved building plan.",
    before: [
      "Learn the alarm signal, at least two planned exits where available, and assembly point.",
      "Keep corridors and fire doors clear; report damaged alarms or blocked exits to staff.",
      "Laboratory, kitchen, electrical, and equipment risks must be managed by trained staff.",
      "Practise drills that include people needing assistance and do not use lifts in a fire evacuation.",
    ],
    during: [
      "Raise the alarm and call local emergency services through a responsible adult or approved procedure.",
      "Leave belongings; use a safe marked exit and follow staff. Avoid smoke and heat; if a route is unsafe, use the site's alternate procedure.",
      "Close doors behind you if safe and without delaying; never re-enter to retrieve people or belongings.",
      "At the assembly point, stay with your group and tell staff about anyone missing or injured.",
    ],
    after: [
      "Do not re-enter until fire services or responsible authorities give the all-clear.",
      "Report injuries or smoke exposure and seek medical help as directed.",
      "Stay clear of damaged structures, electrical hazards, and hot materials.",
      "Participate in a calm debrief and use school support services if the event was distressing.",
    ],
    evacuation:
      "Use the building's fire plan and the nearest safe designated exit. If smoke or heat blocks it, use the alternate procedure and alert responders to your location; never use a lift.",
    quiz: {
      prompt: "A fire alarm sounds during class. What is the best response?",
      choices: [
        ["bag", "Collect your bag first"],
        ["exit", "Leave belongings and follow the safe planned exit"],
        ["return", "Go back if you forgot something"],
      ],
      answer: "exit",
      explanation:
        "Belongings delay evacuation. Follow the site plan and never re-enter until authorized.",
    },
    scenarios: [
      "Alarm during a lesson",
      "Smoke in a corridor",
      "Laboratory alarm",
      "Assembly headcount",
      "After a building fire",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      {
        publisher: "National Fire Protection Association - Public Education",
        url: "https://www.nfpa.org/education-and-research/home-fire-safety",
      },
      ready,
    ],
  },
  {
    slug: "cyclone",
    title: "Cyclones and severe storms",
    category: "Severe weather",
    level: "Beginner",
    icon: "cloud-lightning",
    overview:
      "A tropical cyclone is an organized rotating storm over warm ocean water. Dangerous winds, extreme rain, storm surge, flooding, and landslides may affect different areas at different times.",
    causes:
      "Cyclones form under suitable ocean, atmospheric, and rotation conditions. A storm's track and impacts can change; the forecast cone is not a precise boundary of danger.",
    signs:
      "Follow IMD bulletins, NDMA/SACHET alerts, and local administration instructions. Worsening wind, rain, surge, and official evacuation messages require action before conditions deteriorate.",
    myth: "A brief lull does not mean the cyclone has ended; the eye may pass before destructive winds return.",
    context:
      "India's Bay of Bengal and Arabian Sea coasts have differing cyclone exposure. Local shelter, surge, river, and evacuation plans determine the correct action.",
    before: [
      "Monitor IMD and local-authority alerts; identify the designated shelter and evacuation timing.",
      "Secure loose items only before dangerous weather and only if authorities say it is safe.",
      "Prepare water, medicines, essential documents, and accessible transport with your family or institution.",
      "Know family reunification and school closure communication procedures.",
    ],
    during: [
      "Follow evacuation orders early; go to the designated shelter and stay there until the official all-clear.",
      "If told to shelter, stay in the strongest designated interior room away from windows; follow local guidance.",
      "Keep away from floodwater, storm surge, fallen trees, wires, and damaged buildings.",
      "Do not go outdoors during a lull; avoid coastal areas and exposed bridges.",
    ],
    after: [
      "Wait for local authorities to confirm it is safe to leave or return.",
      "Avoid floodwater, downed lines, unstable trees, and damaged structures.",
      "Use official information and safe-water guidance; report hazards to adults or authorities.",
      "Expect secondary flooding and landslides after rain continues.",
    ],
    evacuation:
      "Evacuate when ordered, before winds and water make travel unsafe. Use the official shelter and accessible route; never improvise across surge or floodwater.",
    quiz: {
      prompt: "An evacuation order arrives before severe winds. What should your group do?",
      choices: [
        ["wait", "Wait until the wind is strongest"],
        ["move", "Follow the order and go to the designated shelter"],
        ["coast", "Go to the shore to watch"],
      ],
      answer: "move",
      explanation:
        "Early evacuation keeps routes usable and reduces exposure; follow local authorities.",
    },
    scenarios: [
      "Cyclone watch at school",
      "Preparing for shelter",
      "Evacuation before landfall",
      "The calm eye passes",
      "Returning after the storm",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "India Meteorological Department", url: "https://mausam.imd.gov.in/" },
      ready,
    ],
  },
  {
    slug: "lightning",
    title: "Lightning and thunderstorms",
    category: "Severe weather",
    level: "Beginner",
    icon: "cloud-lightning",
    overview:
      "Lightning is an electrical discharge associated with storms. It can strike outside the rain area and cause fatal injury, fire, and power disruption.",
    causes:
      "Electrical charge separates within storm clouds and may discharge between cloud and ground. Thunder indicates lightning is close enough to be heard.",
    signs:
      "Follow IMD and local alerts. If thunder is heard, treat lightning as nearby and move promptly to a substantial enclosed building or hard-topped vehicle where available.",
    myth: "A small open shelter, tree, tent, or veranda is not equivalent to a substantial enclosed building for lightning protection.",
    context:
      "Thunderstorm timing and exposure vary by season and region in India. Outdoor assemblies and sports need a site-specific monitoring and suspension plan.",
    before: [
      "Check official thunderstorm warnings before outdoor classes, events, or travel.",
      "Identify substantial enclosed shelter and an adult-led cancellation signal.",
      "Plan accessible transport and indoor alternatives before an event begins.",
      "Keep away from isolated trees and open fields when storms threaten.",
    ],
    during: [
      "Stop outdoor activity and move into a substantial enclosed building or hard-topped vehicle.",
      "Avoid open-sided shelters, isolated trees, water, and exposed high ground.",
      "Inside, stay away from plumbing and corded electrical equipment during the storm when feasible.",
      "Wait until official advice or at least 30 minutes after the last thunder before resuming outdoor activity; follow local rules.",
    ],
    after: [
      "If someone is struck, call emergency services and follow dispatcher guidance; it is safe to touch a lightning-struck person.",
      "Provide first aid only within your training and while keeping the scene safe.",
      "Report fires, electrical damage, and injuries to responsible adults.",
      "Do not resume outdoor activity while thunderstorm danger remains.",
    ],
    evacuation:
      "Move calmly to substantial indoor shelter immediately; do not shelter under trees or open structures. Follow the institution's accessible shelter plan.",
    quiz: {
      prompt: "You hear thunder while outside on a sports field. What should happen?",
      choices: [
        ["tree", "Stand under the nearest tree"],
        ["building", "Move to a substantial enclosed building or hard-topped vehicle"],
        ["continue", "Finish the game first"],
      ],
      answer: "building",
      explanation:
        "Thunder means lightning is close enough to pose a risk; seek substantial shelter promptly.",
    },
    scenarios: [
      "Thunder during sports",
      "Outdoor assembly",
      "Bus stop during a storm",
      "Indoor shelter choices",
      "Return to outdoor activity",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "India Meteorological Department", url: "https://mausam.imd.gov.in/" },
      {
        publisher: "National Weather Service Lightning Safety",
        url: "https://www.weather.gov/safety/lightning",
      },
    ],
  },
  {
    slug: "landslide",
    title: "Landslides and debris flows",
    category: "Geological",
    level: "Advanced",
    icon: "mountain",
    overview:
      "A landslide is the movement of rock, earth, or debris down a slope. Debris flows can move rapidly and follow channels beyond the immediate slope.",
    causes:
      "Intense or prolonged rainfall, earthquakes, slope cutting, drainage changes, erosion, and weak geology can contribute. Risk depends on local terrain and conditions.",
    signs:
      "Possible warning signs include new ground cracks, tilting trees or poles, unusual slope sounds, sudden muddy seepage, or doors/windows newly sticking; report them and follow official advice.",
    myth: "A slope that has been stable before is not guaranteed to remain safe after heavy rain or ground disturbance.",
    context:
      "Himalayan and Western Ghats regions and other hilly terrain can face slope hazards. Local geologists and authorities provide site-specific risk and evacuation advice.",
    before: [
      "Know whether your campus or route lies below steep slopes, cuttings, or debris channels.",
      "Monitor official rain and local slope advisories; report new cracks or water seepage to staff.",
      "Plan safe routes that avoid slope toes and channels, with accessible options.",
      "Do not dig, alter drainage, or inspect a suspected slope without qualified staff.",
    ],
    during: [
      "If a slide is occurring nearby, move away from its path and channels toward a safer location if that can be done immediately.",
      "Follow evacuation instructions; do not approach to take photos or cross debris.",
      "If escape is not possible, seek the safest available shelter and call for help without entering the slide path.",
      "Warn others only if it is safe; avoid river channels that may carry debris.",
    ],
    after: [
      "Stay away from the slide area; additional movement may occur and debris may conceal hazards.",
      "Report missing or injured people to authorities; do not conduct an untrained search.",
      "Avoid damaged roads, bridges, utilities, and riverbanks.",
      "Return only when officials and qualified personnel confirm access is safe.",
    ],
    evacuation:
      "Move perpendicular away from the known slide path where possible and use pre-identified routes away from slopes/channels. Follow local direction; terrain-specific decisions matter.",
    quiz: {
      prompt:
        "After heavy rain, you notice fresh cracks and muddy water from a slope near campus. What is best?",
      choices: [
        ["inspect", "Walk closer to inspect the crack"],
        ["report", "Move away and report it promptly to staff/authorities"],
        ["ignore", "Assume it is harmless"],
      ],
      answer: "report",
      explanation:
        "Possible slope changes should be reported from a safe place; do not approach or attempt a technical assessment.",
    },
    scenarios: [
      "Fresh slope cracks",
      "Heavy rain near a hillside school",
      "Debris crossing a route",
      "A slide affects the campus road",
      "Re-entry near an unstable slope",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "Geological Survey of India", url: "https://www.gsi.gov.in/" },
      ready,
    ],
  },
  {
    slug: "heatwave",
    title: "Heatwaves and extreme temperatures",
    category: "Weather and health",
    level: "Beginner",
    icon: "sun",
    overview:
      "A heatwave is a period of unusually high temperature for a place and season. Heat can strain the body's cooling system, worsen health conditions, and disrupt school activities.",
    causes:
      "Persistent high temperatures, humidity, limited shade, hot buildings, exertion, dehydration, and some medicines or health conditions can raise heat risk.",
    signs:
      "Follow IMD heat alerts and local health advisories. Headache, dizziness, weakness, cramps, nausea, confusion, fainting, or very hot skin require adult attention; severe symptoms need urgent medical help.",
    myth: "Not everyone experiences heat illness in the same way, and thirst alone is not a reliable measure of every person's needs.",
    context:
      "Heat risk differs by local climate, housing, humidity, power access, and individual health. Follow local plans for school schedules and activity changes.",
    before: [
      "Check IMD/local heat advisories and the institution's hot-weather activity plan.",
      "Ensure water, shaded/cool rest areas, and accessible adjustments are available under staff supervision.",
      "Tell a responsible adult about health needs and medicines that affect heat response.",
      "Plan buddy checks for outdoor learning, sports, transport, and vulnerable students.",
    ],
    during: [
      "Reduce exertion and move to a cooler or shaded area as directed.",
      "Tell a responsible adult promptly if anyone feels unwell; do not leave a symptomatic person alone.",
      "Follow staff guidance on fluids and cooling; do not force fluids on an unconscious person.",
      "For confusion, collapse, or severe symptoms, seek emergency medical assistance immediately.",
    ],
    after: [
      "Resume activity only when staff/local health guidance says it is appropriate.",
      "Continue checking on people with symptoms and seek medical advice when needed.",
      "Report hot rooms, water outages, or unsafe conditions to facilities staff.",
      "Review schedules and access arrangements after an event, including students with health needs.",
    ],
    evacuation:
      "Usually this is a shelter/cooling and activity-modification response rather than evacuation. Move to an institution-designated cool space; follow medical and local authority instructions.",
    quiz: {
      prompt: "A classmate becomes confused and collapses on a hot day. What is the priority?",
      choices: [
        ["rest", "Leave them alone in the shade"],
        ["adult", "Get an adult and urgent medical help immediately"],
        ["exercise", "Ask them to walk it off"],
      ],
      answer: "adult",
      explanation:
        "Confusion or collapse can signal a life-threatening emergency; call emergency help and follow trained guidance.",
    },
    scenarios: [
      "Outdoor class during heat alert",
      "A student feels dizzy",
      "Hot classroom and limited water",
      "Sports event planning",
      "Checking on a student after heat illness",
    ],
    sources: [
      ndma,
      nidm,
      { publisher: "India Meteorological Department", url: "https://mausam.imd.gov.in/" },
      { publisher: "National Centre for Disease Control", url: "https://ncdc.mohfw.gov.in/" },
      ready,
    ],
  },
  {
    slug: "wildfire",
    title: "Wildfires and smoke",
    category: "Fire and smoke",
    level: "Advanced",
    icon: "flame",
    overview:
      "A wildfire is an uncontrolled fire in vegetation. Wind, dry fuel, terrain, and changing weather can drive rapid spread; smoke can affect areas far from flames.",
    causes:
      "Ignition may be natural or human-caused; dry vegetation, wind, and terrain influence spread. Students should never investigate or attempt to suppress a wildfire.",
    signs:
      "Follow local forest/fire authority alerts and evacuation orders. Smoke, ash, changing wind, or a nearby fire report should prompt adults to check official updates.",
    myth: "A visible flame is not the only danger; smoke and changing roads can make a distant fire unsafe.",
    context:
      "Forest and grassland fire risk varies by ecosystem and season across India. Local forest departments and district authorities set closures and evacuation directions.",
    before: [
      "Know school communication, evacuation, and reunification procedures for smoke/fire alerts.",
      "Keep indoor air plans and accessible transport options ready where advised.",
      "Do not play with matches or burn waste; report smoke/fire from a safe place.",
      "Staff should monitor official local fire and air-quality advice and account for respiratory needs.",
    ],
    during: [
      "Follow evacuation instructions promptly and move away from fire; do not wait to observe it.",
      "Use only routes authorities identify as safe; roads can close or change rapidly.",
      "If instructed to shelter, close openings and follow official indoor-air advice; this is not a substitute for an evacuation order.",
      "Avoid smoke exposure and tell staff about breathing difficulty or other symptoms.",
    ],
    after: [
      "Return only after authorities reopen the area and confirm it is safe.",
      "Avoid ash, hot spots, damaged trees, power lines, and unstable structures.",
      "Follow local advice on masks, air quality, water, and cleanup; students should not handle ash or debris.",
      "Seek medical advice for breathing or eye symptoms and use institution support after displacement.",
    ],
    evacuation:
      "Follow fire officials' order and route; evacuate early before smoke or traffic blocks travel. Never approach a fire to document it.",
    quiz: {
      prompt:
        "Smoke is visible near a school route, but no flame is nearby. What should students do?",
      choices: [
        ["watch", "Walk toward the smoke to check"],
        ["follow", "Stay with staff and follow official route or shelter instructions"],
        ["post", "Share an unverified evacuation message"],
      ],
      answer: "follow",
      explanation:
        "Smoke and changing conditions can be dangerous. Use verified authority instructions and the institution plan.",
    },
    scenarios: [
      "Smoke advisory before class",
      "Fire approaches a rural campus",
      "Evacuation route changes",
      "Shelter during smoke",
      "Returning after a wildfire",
    ],
    sources: [
      ndma,
      ndrf,
      { publisher: "Forest Survey of India", url: "https://fsi.nic.in/" },
      { publisher: "NASA Earth Observatory", url: "https://earthobservatory.nasa.gov/topic/fires" },
      ready,
    ],
  },
  {
    slug: "tsunami",
    title: "Tsunamis and coastal hazards",
    category: "Coastal",
    level: "Advanced",
    icon: "waves",
    overview:
      "A tsunami is a series of long waves, usually caused by undersea earthquakes, landslides, or volcanic activity. Waves may arrive as powerful surges and can continue for hours.",
    causes:
      "Large displacement of water can generate tsunami waves. Near-source events may leave little time for official warning, so natural warning signs matter in mapped coastal zones.",
    signs:
      "After strong or long coastal shaking, a sudden sea-level change, or a loud ocean roar, move immediately to high ground or inland under the local plan; do not wait to watch.",
    myth: "The first wave may not be the largest, and the sea may not simply form a dramatic wall of water.",
    context:
      "Coastal districts and islands have different evacuation maps and routes. Follow INCOIS/NDMA alerts and district instructions for the exact location.",
    before: [
      "Know mapped evacuation routes, high-ground shelters, and accessible transport arrangements.",
      "Identify natural warning signs and practice moving inland or uphill with staff.",
      "Keep emergency communication and family reunification plans ready.",
      "Check official coastal warnings before field trips and events.",
    ],
    during: [
      "If strong/long shaking or an official warning occurs in a coastal hazard zone, move immediately to designated high ground or inland.",
      "Use marked routes; do not go to the shore, harbour, or river mouth to observe.",
      "If evacuation is directed, go on foot if safe and appropriate; avoid congested coastal roads and follow staff.",
      "Remain in the safe area through all-clear; multiple waves may occur.",
    ],
    after: [
      "Do not return until authorities explicitly cancel the warning and reopen areas.",
      "Avoid floodwater, debris, damaged structures, and downed wires.",
      "Account for students through the agreed group process and report injuries/missing persons.",
      "Follow safe-water and health instructions during recovery.",
    ],
    evacuation:
      "Move quickly to the pre-identified high ground or inland area; use local maps and accessible routes. Do not wait for a formal message after strong/long shaking in a tsunami zone.",
    quiz: {
      prompt: "At the coast, strong shaking lasts a long time. What should you do?",
      choices: [
        ["shore", "Go to the beach to see whether waves are coming"],
        ["high", "Move immediately inland or to designated high ground"],
        ["wait", "Wait for a second alert before moving"],
      ],
      answer: "high",
      explanation:
        "Strong or long shaking is a natural warning in tsunami-prone areas; evacuate immediately under the local plan.",
    },
    scenarios: [
      "Strong shaking on a coastal trip",
      "Tsunami alert at school",
      "Route to high ground",
      "Waiting through multiple waves",
      "Coastal re-entry after warning",
    ],
    sources: [
      ndma,
      ndrf,
      {
        publisher: "Indian National Centre for Ocean Information Services",
        url: "https://incois.gov.in/",
      },
      {
        publisher: "USGS Tsunami Hazards",
        url: "https://www.usgs.gov/programs/earthquake-hazards/tsunamis",
      },
      ready,
    ],
  },
  {
    slug: "drought",
    title: "Drought and water scarcity",
    category: "Climate and water",
    level: "Advanced",
    icon: "sun",
    overview:
      "Drought is a prolonged period of water shortage relative to local needs. It develops over time and can affect drinking water, sanitation, agriculture, health, and school operations.",
    causes:
      "Low or irregular rainfall, high demand, groundwater stress, heat, and water-management conditions can contribute. Drought is measured in different ways and does not have a single universal threshold.",
    signs:
      "Follow official water-supply and health notices, not rumours. Restrictions, falling reservoir/groundwater levels, and service interruptions should be handled through local plans.",
    myth: "A drought is not solved by unsafe water use or by asking children to carry out risky water collection.",
    context:
      "Water availability is highly local across India. District authorities and water utilities determine restrictions, sources, and school-continuity plans.",
    before: [
      "Know the institution's water-conservation, drinking-water, and sanitation continuity plans.",
      "Use water safely and avoid waste under posted local rules.",
      "Report leaks and supply issues to facilities staff; learners should not repair systems.",
      "Plan continuity for hygiene, heat, disability-related needs, and exam/meal schedules.",
    ],
    during: [
      "Follow official restrictions and use only approved safe drinking-water sources.",
      "Tell staff if you have no safe water or sanitation access; do not drink from an unverified source.",
      "Keep hygiene and heat precautions in the school plan, including accessible alternatives.",
      "Do not enter wells, tanks, or restricted utility areas.",
    ],
    after: [
      "Follow water-safety notices until authorities confirm supply quality.",
      "Report illness or service failures to responsible adults and health authorities.",
      "Support water conservation without blame or unsafe rationing.",
      "Review school continuity and support for affected families using official services.",
    ],
    evacuation:
      "Drought generally requires continuity, water-safety, and health measures rather than evacuation. Relocation or closure decisions belong to authorities and school leadership.",
    quiz: {
      prompt:
        "The school water supply is interrupted and the source of a nearby well is unknown. What should students do?",
      choices: [
        ["drink", "Use the well because water is visible"],
        ["ask", "Tell staff and use only a source authorities approve as safe"],
        ["collect", "Enter the well area to investigate"],
      ],
      answer: "ask",
      explanation:
        "Water can be contaminated even when it looks clear; use verified sources and adult guidance.",
    },
    scenarios: [
      "Water restriction notice",
      "Unknown water source",
      "School sanitation continuity",
      "Reporting a leaking tap",
      "Reopening after water service returns",
    ],
    sources: [
      ndma,
      nidm,
      { publisher: "Central Ground Water Board", url: "https://cgwb.gov.in/" },
      { publisher: "India Meteorological Department", url: "https://mausam.imd.gov.in/" },
      ready,
    ],
  },
  {
    slug: "chemical-incident",
    title: "Chemical and laboratory incidents",
    category: "Hazardous materials",
    level: "Advanced",
    icon: "flask-conical",
    overview:
      "A chemical incident is an uncontrolled release, fire, or exposure involving a hazardous substance. Risks depend on the material, quantity, location, and ventilation; identification is for trained responders.",
    causes:
      "Spills, incompatible storage, equipment failure, transport accidents, or process releases can cause exposure. Laboratory and facilities controls must be handled by trained staff.",
    signs:
      "A spill, unusual vapour, warning alarm, or sudden irritation may indicate danger. Do not touch, smell, or approach a substance to identify it; alert staff from a safe place.",
    myth: "There is no single safe response for all chemical releases. Authorities may instruct evacuation or shelter-in-place depending on the material and wind/building conditions.",
    context:
      "School laboratories and nearby industrial facilities each require a site-specific chemical inventory, emergency plan, and trained response arrangements.",
    before: [
      "Only trained, authorized adults manage chemicals, labels, storage, and spill equipment.",
      "Know the lab alarm, exit/shelter instructions, eyewash/shower locations, and how to summon staff.",
      "Review accessible communication and assistance arrangements in drills.",
      "Never mix, handle, or transport unknown substances.",
    ],
    during: [
      "Warn others and move away without touching or investigating; alert the teacher or emergency coordinator.",
      "Follow the site plan and responder instructions: this may be evacuation or shelter-in-place.",
      "Do not use lifts, cross a visible plume, or re-enter to collect belongings.",
      "If exposed, tell staff immediately and follow trained first-aid/medical instructions; do not apply improvised treatments.",
    ],
    after: [
      "Do not re-enter until hazardous-material responders and authorities give an all-clear.",
      "Report symptoms and possible exposure honestly; seek medical assessment as directed.",
      "Do not clean residues or handle contaminated clothing/equipment unless trained responders instruct.",
      "Use school support and incident review processes; protect personal privacy.",
    ],
    evacuation:
      "Evacuate or shelter only as directed by the incident plan/authorities; wind direction and chemical identity matter. Move crosswind/upwind only if trained local instructions specify it.",
    quiz: {
      prompt: "An unknown liquid spills in a laboratory. What should a student do?",
      choices: [
        ["smell", "Smell it to identify the chemical"],
        ["alert", "Move away and alert the teacher without touching it"],
        ["wipe", "Clean it with paper towels"],
      ],
      answer: "alert",
      explanation:
        "Unknown chemicals can injure through contact or vapour; trained staff and responders assess the hazard.",
    },
    scenarios: [
      "Unknown laboratory spill",
      "Alarm in a science room",
      "Outdoor chemical plume advisory",
      "A classmate reports exposure",
      "Re-entry after hazardous-material response",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "US Chemical Safety Board - Safety Videos", url: "https://www.csb.gov/videos/" },
      ready,
    ],
  },
  {
    slug: "biological-hazard",
    title: "Biological hazards and public health",
    category: "Health emergency",
    level: "Advanced",
    icon: "shield-plus",
    overview:
      "A biological emergency involves an infectious disease or other biological agent affecting health. Transmission, severity, and protective measures depend on the specific illness and current public-health advice.",
    causes:
      "Infections spread by different routes, including respiratory droplets/aerosols, contact, food/water, or vectors. There is no one prevention measure that fits every pathogen.",
    signs:
      "Use health authority notices and school procedures. Symptoms alone do not identify a disease; report illness through the approved confidential process and follow current medical guidance.",
    myth: "Rumours, stigma, and unverified remedies can harm people. Do not diagnose classmates or share private health details.",
    context:
      "India's disease surveillance and public-health instructions are issued by competent health authorities and can change during an outbreak.",
    before: [
      "Know school illness reporting, hand hygiene, ventilation, and continuity policies.",
      "Follow current vaccination and health advice from qualified providers and public authorities.",
      "Keep emergency contacts and necessary accommodations/private care plans updated with responsible staff.",
      "Use credible health sources and avoid spreading unverified claims.",
    ],
    during: [
      "Follow the current instructions from public-health authorities and school leadership.",
      "If unwell, tell a responsible adult and follow the designated care/transport plan; protect other people's privacy.",
      "Use hygiene or protective equipment only as instructed and ensure it fits and is appropriate.",
      "Do not stigmatize, confront, or isolate someone outside the established health procedure.",
    ],
    after: [
      "Follow health authority advice about return, testing, treatment, or monitoring.",
      "Protect confidential health information and avoid forwarding rumours.",
      "Seek support for missed learning, wellbeing, and access needs.",
      "Update school procedures based on public-health review, not speculation.",
    ],
    evacuation:
      "A disease event typically uses health measures, isolation/care, ventilation, or remote learning rather than a rapid evacuation. Follow public-health officials and the school's current plan.",
    quiz: {
      prompt: "A classmate reports a possible infectious illness. What is an appropriate response?",
      choices: [
        ["post", "Share their name and symptoms online"],
        ["report", "Tell the designated adult privately and follow health guidance"],
        ["diagnose", "Decide what disease it is"],
      ],
      answer: "report",
      explanation:
        "Report through the confidential school process; only qualified health professionals assess illness.",
    },
    scenarios: [
      "A student feels unwell in class",
      "Health notice from authorities",
      "Rumour in a class group",
      "Supporting a student returning",
      "School continuity during an outbreak",
    ],
    sources: [
      ndma,
      nidm,
      { publisher: "National Centre for Disease Control", url: "https://ncdc.mohfw.gov.in/" },
      { publisher: "World Health Organization", url: "https://www.who.int/health-topics" },
      ready,
    ],
  },
  {
    slug: "industrial-incident",
    title: "Industrial and infrastructure incidents",
    category: "Technological",
    level: "Advanced",
    icon: "factory",
    overview:
      "Industrial and infrastructure incidents include major fires, explosions, structural failures, transport accidents, and releases from facilities or utilities.",
    causes:
      "Equipment failure, unsafe processes, transport incidents, natural hazards, or human error may contribute. The hazard and safest action depend on the event and site.",
    signs:
      "Use verified emergency alerts and site procedures. Sirens, official messages, visible damage, smoke, or service disruption are cues to follow instructions, not investigate.",
    myth: "Evacuation is not always safest; authorities may direct people to shelter indoors for a nearby release or external hazard.",
    context:
      "Industrial exposure varies by facility, transport corridor, and infrastructure. Local emergency plans determine warning zones and school actions.",
    before: [
      "Know the school's external-hazard notification, shelter, and evacuation procedures.",
      "Understand the designated communication channel and who makes closure/relocation decisions.",
      "Keep routes accessible and account for medical, mobility, hearing, and communication needs.",
      "Do not enter construction, utility, railway, or industrial areas without authorization.",
    ],
    during: [
      "Move away from the immediate hazard and follow the official action message: shelter or evacuate as instructed.",
      "Do not approach smoke, debris, damaged infrastructure, or downed wires.",
      "Keep students together and use approved communication; avoid sharing unverified details.",
      "Report injury or missing people to staff/responders without entering the hazard area.",
    ],
    after: [
      "Wait for official all-clear and re-entry directions.",
      "Avoid damaged structures, utilities, contaminated areas, and traffic-control zones.",
      "Follow public-health or environmental cleanup instructions; students must not handle debris.",
      "Use school support and recovery procedures; report concerns through responsible adults.",
    ],
    evacuation:
      "Follow incident-command and local authority instructions. The correct choice may be evacuation, shelter-in-place, or moving to a designated safe zone.",
    quiz: {
      prompt:
        "An official alert says shelter indoors for an external incident. What should the class do?",
      choices: [
        ["leave", "Evacuate immediately without checking the school plan"],
        ["shelter", "Follow the shelter procedure and staff instructions"],
        ["investigate", "Go outside to identify the event"],
      ],
      answer: "shelter",
      explanation:
        "External conditions may make outdoor movement more dangerous; follow the current authority instruction.",
    },
    scenarios: [
      "Industrial siren near campus",
      "Road incident on a school trip",
      "Power infrastructure damage",
      "Shelter versus evacuation alert",
      "Reopening after an incident",
    ],
    sources: [
      ndma,
      ndrf,
      nidm,
      { publisher: "National Disaster Management Authority", url: "https://ndma.gov.in/" },
      ready,
    ],
  },
  {
    slug: "campus-evacuation",
    title: "Emergency evacuation and campus safety",
    category: "Preparedness",
    level: "Beginner",
    icon: "door-open",
    overview:
      "Evacuation is an organized movement away from a hazard to a safer place. The route, timing, and whether to evacuate depend on the incident and instructions from authorities.",
    causes:
      "Fire, structural damage, severe weather, security incidents, or other hazards may require relocation. Some incidents instead require sheltering in place.",
    signs:
      "Use the building alarm, official alerts, staff directions, and posted plan. Never treat an unfamiliar alarm or message as a reason to improvise; tell staff immediately.",
    myth: "The nearest exit is not always the safest or accessible route, and evacuation is not correct for every emergency.",
    context:
      "Each campus needs a locally approved plan with accessible routes, assembly areas, headcounts, communication, and responder coordination.",
    before: [
      "Learn the alarm, primary and alternate routes, assembly points, and reunification process.",
      "Identify assigned assistance and accessible evacuation arrangements; discuss needs privately with staff.",
      "Keep doors, stairs, ramps, and exits clear and report obstacles.",
      "Participate in announced, supervised drills; drills should be accessible and age-appropriate.",
    ],
    during: [
      "Pause and listen for the incident-specific instruction: evacuate, shelter, or move to another zone.",
      "Stay with staff and group; use the designated accessible route and leave belongings if evacuation is ordered.",
      "Do not use lifts unless the emergency plan specifically provides a safe approved procedure.",
      "At the assembly point, check in and tell staff about missing or injured people; do not leave without authorization.",
    ],
    after: [
      "Remain at the assembly point until headcount and instructions are complete.",
      "Do not re-enter until authorities and campus leads authorize it.",
      "Report route problems and accessibility barriers during the debrief.",
      "Use reunification and wellbeing support arrangements after disruption.",
    ],
    evacuation:
      "Follow the incident-specific plan. Staff lead the group, use accessible alternatives, account for everyone, and coordinate with responders; students do not self-deploy.",
    quiz: {
      prompt:
        "An alarm sounds, but a teacher instructs the class to shelter for this incident. What should you do?",
      choices: [
        ["listen", "Follow the teacher's incident-specific instruction"],
        ["run", "Always run to the nearest exit"],
        ["leave", "Leave campus alone"],
      ],
      answer: "listen",
      explanation:
        "Some hazards make evacuation more dangerous; follow the current approved plan and authority instructions.",
    },
    scenarios: [
      "Fire alarm and accessible exit",
      "External hazard shelter instruction",
      "A classmate needs evacuation support",
      "Headcount at the assembly point",
      "Reunification after campus closure",
    ],
    sources: [
      ndrf,
      {
        publisher: "NDRF School Safety and Mock Exercise",
        url: "https://www.ndrf.gov.in/en/school-safety-and-mock-exercise",
      },
      nidm,
      ndma,
      ready,
    ],
  },
];

export const disasterTopics = topics.map((topic) => ({
  ...topic,
  id: `disaster-${topic.slug}`,
  reviewDate: "2026-10-28",
  limitations:
    "General education only. Conditions and protective actions depend on location, building, hazard, accessibility needs, and competent local authorities. Follow your institution's approved plan and current official instructions.",
  schoolGuidance:
    "Schools and colleges should maintain a locally approved, accessible emergency plan, trained staff roles, reliable official-warning channels, drills appropriate to the hazard, student accountability, family reunification, and post-event support. Site leaders and competent responders choose the protective action for the actual incident.",
  studentGuidance:
    "Stay with your group, listen to responsible staff and official alerts, tell an adult about injuries or access needs, and do not investigate hazards, share rumours, or attempt rescues beyond your training.",
  staffGuidance:
    "Staff should activate the site plan, communicate the specific protective action, use assigned roles and accessible methods, account for learners, contact responders, and avoid actions outside their training.",
  accessibilityGuidance:
    "Plan in advance with the person: accessible routes/shelter, communication formats, mobility devices, medication, sensory needs, and a named support arrangement. Do not separate people from mobility or communication aids unless responders direct otherwise.",
  commonMistakes: [
    "Following unverified social-media posts instead of official instructions.",
    "Returning to a hazard area for belongings or photos.",
    "Assuming every emergency requires the same evacuation action.",
    "Leaving a group or attempting a rescue without training.",
  ],
  doActions: [
    "Follow current local alerts and the institution's incident-specific plan.",
    "Tell staff about injury, danger, or support needs from a safe place.",
    "Wait for an official all-clear before returning.",
  ],
  dontActions: [
    "Do not enter floodwater, smoke, damaged structures, or unknown substances.",
    "Do not spread unverified warnings or expose another person's private information.",
    "Do not treat this guide as an emergency service or site inspection.",
  ],
  sources: topic.sources,
  lessons: [
    {
      id: "understand",
      title: "Understand the hazard",
      content: `${topic.overview} ${topic.causes} ${topic.signs} ${topic.context}`,
    },
    { id: "before", title: "Prepare before an incident", content: topic.before.join(" ") },
    { id: "during", title: "Respond during an incident", content: topic.during.join(" ") },
    { id: "after", title: "Recover and stay safe afterward", content: topic.after.join(" ") },
    {
      id: "campus",
      title: "School and campus responsibilities",
      content: `${topic.schoolGuidance} ${topic.studentGuidance} ${topic.staffGuidance} ${topic.accessibilityGuidance}`,
    },
  ],
  scenarios: topic.scenarios.map((title, index) => ({
    id: `${topic.slug}-${index + 1}`,
    title,
    hazardCategory: topic.title,
    scenario: title,
    description: `Original illustrated scenario about ${title.toLowerCase()} with an instructional decision point and safety checkpoint.`,
    type: "ANIMATED_SCENARIO",
    contentType: "ANIMATED_SCENARIO",
    publisher: "AtmosWatch original educational animation",
    language: "English",
    audience: topic.level,
    durationSeconds: 45,
    captionAvailable: true,
    transcriptAvailable: true,
    sourceUrl: topic.sources[0].url,
    originalSourceUrl: topic.sources[0].url,
    embeddingUrl: null,
    assetUrl: null,
    attribution: `Safety guidance references ${topic.sources.map((source) => source.publisher).join(", ")}. Scenario illustration and sequence are original AtmosWatch educational content.`,
    objective: `Choose a safe action during: ${title.toLowerCase()}.`,
    learningObjectives: [`Choose a safe action during: ${title.toLowerCase()}.`],
    publicationStatus: "PUBLISHED",
    lastVerifiedDate: null,
    sourceReviewDate: "2026-10-28",
    setting: "",
    decision: topic.quiz.prompt,
    action: topic.during[index % topic.during.length],
    explanation: topic.quiz.explanation,
    checkpoint: {
      question: topic.quiz.prompt,
      choices: topic.quiz.choices.map(([id, text]) => ({ id, text })),
    },
  })),
}));

// Keep the manifest count explicit so automated checks catch missing scenario lessons.
const scenarioLessons = {
  earthquake: [
    "A classroom begins to shake during a lesson.",
    "Shaking starts at home while studying.",
    "A tremor begins outdoors near campus.",
    "Shaking stops and staff prepare to evacuate.",
    "An aftershock occurs near a visibly damaged building.",
  ],
  flood: [
    "An official flood watch arrives before school.",
    "Rainwater rises around an urban underpass.",
    "Water enters the school grounds during class.",
    "A student reaches a road crossing with moving water.",
    "Floodwater recedes and families ask to re-enter campus.",
  ],
  fire: [
    "The classroom fire alarm activates during a lesson.",
    "Smoke is noticed in the corridor on the usual exit route.",
    "An alarm sounds during a supervised laboratory class.",
    "A group reaches the assembly point after evacuation.",
    "The building fire is out but re-entry has not been approved.",
  ],
  cyclone: [
    "A cyclone watch is announced while the school day is underway.",
    "Staff prepare a class for the designated cyclone shelter.",
    "An evacuation order arrives before destructive winds.",
    "A quiet lull follows strong cyclone winds.",
    "The storm passes and students ask to return to campus.",
  ],
  lightning: [
    "Thunder is heard during an outdoor sports lesson.",
    "A school assembly is planned as a storm approaches.",
    "A student waits at an exposed roadside stop during thunder.",
    "The class must choose between an open shelter and a building.",
    "The last thunder has just stopped and a coach wants to resume play.",
  ],
  landslide: [
    "A student notices fresh cracks on a slope after heavy rain.",
    "Heavy rain continues near a hillside school.",
    "Debris covers the usual route from a campus building.",
    "A slide blocks the road used by the school bus.",
    "Students approach a slope after the first slide has stopped.",
  ],
  heatwave: [
    "An outdoor class is scheduled during a heat alert.",
    "A learner feels dizzy during a supervised activity.",
    "A classroom becomes hot during a water-service interruption.",
    "A sports event is planned during extreme heat.",
    "A learner returns after staff responded to heat illness.",
  ],
  wildfire: [
    "A smoke advisory is issued before students arrive.",
    "A wildfire is reported near a rural campus.",
    "Authorities close the planned evacuation road.",
    "Officials instruct the school to reduce indoor smoke exposure.",
    "The fire is contained but the area remains closed.",
  ],
  tsunami: [
    "Strong, long shaking occurs during a coastal school trip.",
    "An official tsunami message arrives during class.",
    "The group must choose a route to mapped high ground.",
    "The first wave has passed but no all-clear is issued.",
    "A coastal warning is lifted for one area but roads remain damaged.",
  ],
  drought: [
    "The school receives an official water-restriction notice.",
    "A student sees an unverified well offered as drinking water.",
    "The campus plans sanitation during a supply interruption.",
    "A learner spots a leaking tap in a school building.",
    "Water service returns but the quality notice is pending.",
  ],
  "chemical-incident": [
    "An unknown liquid spills in a supervised laboratory.",
    "A chemical alarm sounds in the science block.",
    "Authorities issue an outdoor plume advisory near campus.",
    "A classmate reports possible contact with a substance.",
    "Responders complete the incident but have not cleared re-entry.",
  ],
  "biological-hazard": [
    "A student feels unwell during a classroom lesson.",
    "A public-health notice changes school precautions.",
    "An unverified disease rumour spreads in a class chat.",
    "A student returns after an illness-related absence.",
    "School leaders plan learning continuity during an outbreak.",
  ],
  "industrial-incident": [
    "An industrial siren sounds near the school.",
    "A road incident affects a supervised school trip.",
    "A damaged utility is reported near the campus boundary.",
    "An official message directs nearby buildings to shelter indoors.",
    "The incident is contained but re-entry guidance is pending.",
  ],
  "campus-evacuation": [
    "A fire alarm activates and a learner needs an accessible route.",
    "An external incident prompts a shelter instruction.",
    "A classmate needs support during an evacuation drill.",
    "The class reaches an assembly point and begins headcount.",
    "Families arrive during a campus reunification process.",
  ],
};

const scenarioActions = {
  earthquake: [
    "Drop, Cover, and Hold On; protect your head and neck.",
    "Get low beside sturdy cover and stay away from glass.",
    "Move away from buildings and overhead hazards when safe.",
    "Wait for shaking to stop, then follow staff to the planned assembly point.",
    "Stay away from damaged structures and report hazards from a safe place.",
  ],
  flood: [
    "Check the official warning and follow the school's decision.",
    "Stay out of the underpass and move to the planned safer route.",
    "Move away from rising water with staff.",
    "Never enter moving floodwater; alert an adult.",
    "Wait for official re-entry clearance and safe-water advice.",
  ],
  fire: [
    "Follow staff and the current alarm/closure instructions.",
    "Use an alternate safe exit; do not enter a smoke-filled route.",
    "Leave items and follow the supervised laboratory evacuation plan.",
    "Stay with your class for the headcount.",
    "Do not re-enter until responders authorize it.",
  ],
  cyclone: [
    "Monitor official messages and prepare for the site-specific action.",
    "Go to the designated shelter as instructed.",
    "Evacuate early to the official shelter.",
    "Remain sheltered; a lull can be followed by severe winds.",
    "Wait for local authorities to reopen the area.",
  ],
  lightning: [
    "Stop activity and move into substantial enclosed shelter.",
    "Move the assembly indoors or postpone it.",
    "Leave the exposed stop for substantial shelter if safe.",
    "Choose the enclosed building, not an open shelter.",
    "Wait until the local lightning stand-down period is met.",
  ],
  landslide: [
    "Stay back and report new cracks to staff.",
    "Follow the school's local slope and rain procedure.",
    "Do not cross debris; follow a safe route away from slopes.",
    "Follow staff and authorities; do not use the blocked road.",
    "Keep away; additional slope movement can occur.",
  ],
  heatwave: [
    "Check the alert and move the lesson to the planned safer setting.",
    "Tell an adult immediately and follow their medical response.",
    "Follow the school's water and cooling plan.",
    "Reschedule or modify activity using official heat guidance.",
    "Follow the care plan and return-to-activity guidance.",
  ],
  wildfire: [
    "Follow the verified smoke/evacuation message.",
    "Use the official evacuation instruction and route.",
    "Follow the newly designated safe route; do not improvise toward fire.",
    "Follow local shelter or evacuation advice and report symptoms.",
    "Stay out until authorities confirm reopening.",
  ],
  tsunami: [
    "Move immediately to mapped high ground or inland.",
    "Follow the official warning and campus route.",
    "Use the marked route away from the shore.",
    "Remain in the safe area until an all-clear.",
    "Follow the official all-clear and road access instructions.",
  ],
  drought: [
    "Follow official restrictions and the campus continuity plan.",
    "Use only approved drinking water and tell staff.",
    "Follow hygiene, sanitation, and accommodation arrangements.",
    "Report the leak to facilities staff.",
    "Wait for water quality confirmation before use.",
  ],
  "chemical-incident": [
    "Do not touch or identify it; alert trained staff from a safe place.",
    "Follow the lab's incident-specific instruction.",
    "Follow authority advice to shelter or evacuate; do not cross a plume.",
    "Tell staff promptly and follow trained first-aid/medical advice.",
    "Wait for hazardous-material responders to clear re-entry.",
  ],
  "biological-hazard": [
    "Tell the designated adult privately and follow the care procedure.",
    "Use the current public-health and school guidance.",
    "Do not forward the rumour; direct it to a trusted adult.",
    "Follow the confidential return-to-school process.",
    "Use the official continuity and health guidance.",
  ],
  "industrial-incident": [
    "Follow the official alert; do not investigate the siren.",
    "Stay with staff and use the trip emergency plan.",
    "Stay clear of the utility and alert responsible adults.",
    "Follow the shelter instruction and staff direction.",
    "Wait for the official all-clear and site approval.",
  ],
  "campus-evacuation": [
    "Use the accessible route agreed in the campus plan.",
    "Shelter as instructed instead of automatically evacuating.",
    "Follow the assigned support procedure and stay together.",
    "Check in with staff and report missing people.",
    "Follow the controlled reunification process.",
  ],
};

for (const topic of disasterTopics) {
  const scenes = scenarioLessons[topic.slug];
  const actions = scenarioActions[topic.slug];
  if (
    !scenes ||
    scenes.length !== 5 ||
    new Set(scenes).size !== 5 ||
    !actions ||
    actions.length !== 5
  )
    throw new Error(`Disaster scenario catalog is incomplete for ${topic.slug}`);
  topic.scenarios.forEach((scenario, index) => {
    scenario.setting = scenes[index];
    scenario.action = actions[index];
  });
}

export function getDisasterTopic(slug) {
  return disasterTopics.find((topic) => topic.slug === slug);
}

export function getDisasterModuleId(slug) {
  return getDisasterTopic(slug)?.id;
}

export function validDisasterLessonIds(topic) {
  return [
    ...topic.lessons.map((lesson) => lesson.id),
    ...topic.scenarios.map((scenario) => `scenario:${scenario.id}`),
  ];
}

export function disasterTopicForLearner(topic) {
  const { quiz, ...safeTopic } = topic;
  return {
    ...safeTopic,
    quiz: { prompt: quiz.prompt, choices: quiz.choices.map(([id, text]) => ({ id, text })) },
  };
}

export function validateDisasterScenarioCatalog() {
  return disasterTopics.every(
    (topic) =>
      topic.scenarios.length >= 5 &&
      new Set(topic.scenarios.map((item) => item.id)).size === topic.scenarios.length
  );
}
