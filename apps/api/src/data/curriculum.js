export const modules = [
  {
    id: "earthquake-ready",
    title: "When the ground shakes",
    hazard: "Earthquake",
    level: "All learners",
    minutes: 8,
    summary: "Practise immediate classroom actions and what to do after shaking stops.",
    source: "https://www.nidm.gov.in/PDF/pubs/NDMA/17.pdf",
    lessons: [
      {
        id: "during-shaking",
        title: "During shaking",
        content:
          "Drop to your hands and knees, take cover under a sturdy desk or table if one is close, and hold on. Protect your head and neck. Stay away from windows. If no cover is nearby, get low beside an interior wall and protect your head. Follow the school plan and the directions of staff.",
      },
      {
        id: "after-shaking",
        title: "After shaking",
        content:
          "Wait for the shaking to stop, then follow staff instructions and the planned route. Expect aftershocks. Do not use lifts. Do not re-enter damaged buildings until competent authorities say it is safe. Help others only when you can do so safely.",
      },
      {
        id: "prepare",
        title: "Prepare together",
        content:
          "Know the planned safe places, exits, assembly area, and how adults will account for the group. Keep heavy items secured through the institution's maintenance process. Practise with accessible options for people who need mobility, hearing, vision, or communication support.",
      },
    ],
    quiz: [
      {
        id: "q-cover",
        prompt: "Shaking starts while you are seated in class. What is the first response?",
        options: [
          { id: "a", text: "Run to the stairs" },
          { id: "b", text: "Drop, take cover, and hold on" },
          { id: "c", text: "Stand beside the window" },
        ],
        answer: "b",
        explanation:
          "Getting low and protecting your head under sturdy cover reduces exposure to falling objects. Follow staff and your local plan.",
      },
      {
        id: "q-lift",
        prompt: "After shaking stops, should you use a lift to leave?",
        options: [
          { id: "a", text: "Yes, if it is working" },
          { id: "b", text: "No, use the planned route when staff direct you" },
        ],
        answer: "b",
        explanation:
          "Lifts may fail or be unsafe after an earthquake. Use the designated route as directed.",
      },
    ],
  },
  {
    id: "flood-smart",
    title: "Flood water is not a pathway",
    hazard: "Flood",
    level: "All learners",
    minutes: 7,
    summary: "Recognize flood hazards, move to safer ground with adults, and avoid moving water.",
    source: "https://sachet.ndma.gov.in/DosDont",
    lessons: [
      {
        id: "spot-risk",
        title: "Spot the risk",
        content:
          "Heavy rain can flood roads, underpasses, school grounds, and nearby streams. Water can hide holes, debris, or electrical hazards. A familiar route can become unsafe quickly.",
      },
      {
        id: "move-safely",
        title: "Move with the plan",
        content:
          "Follow school staff and local authority instructions. Move away from floodwater toward the planned safe location. Never walk, swim, or drive through moving floodwater. Do not touch fallen wires or electrical equipment in wet areas.",
      },
      {
        id: "stay-informed",
        title: "Stay informed",
        content:
          "Use official local updates and the institution's communication plan. Do not spread unverified messages. If separated, use the agreed reunification process rather than improvising a route.",
      },
    ],
    quiz: [
      {
        id: "q-water",
        prompt: "A shortcut crosses moving water. What should you do?",
        options: [
          { id: "a", text: "Try it if the water looks shallow" },
          { id: "b", text: "Avoid the water and follow the safe route with staff" },
        ],
        answer: "b",
        explanation:
          "Depth and current can be hard to judge, and water may conceal dangerous conditions.",
      },
    ],
  },
  {
    id: "campus-fire",
    title: "Responding to a fire alarm",
    hazard: "Fire",
    level: "All learners",
    minutes: 6,
    summary: "Learn orderly evacuation, assembly, and reporting actions for a campus fire alarm.",
    source: "https://nidm.mha.gov.in/safety_school.asp",
    lessons: [
      {
        id: "alarm",
        title: "When an alarm sounds",
        content:
          "Stop the activity and follow the posted fire plan and staff instructions. Leave belongings. Use the marked exit route if safe, keep moving, and do not use lifts. Do not re-enter to collect items.",
      },
      {
        id: "assembly",
        title: "At the assembly point",
        content:
          "Move to the institution-designated assembly location. Stay with your group so staff can account for everyone. Report anyone missing or needing assistance to a responsible adult. Re-enter only when authorized.",
      },
      {
        id: "accessibility",
        title: "Plan for everyone",
        content:
          "Evacuation arrangements must include people who need assistance. Know the agreed support procedure and communicate needs to responsible staff before drills.",
      },
    ],
    quiz: [
      {
        id: "q-alarm",
        prompt: "The alarm sounds during class. What should you take?",
        options: [
          { id: "a", text: "Your bag and phone" },
          { id: "b", text: "Nothing; follow the planned exit with the group" },
        ],
        answer: "b",
        explanation:
          "Belongings delay evacuation and can block routes. Follow staff and the site-specific fire plan.",
      },
    ],
  },
  {
    id: "heatwave-campus",
    title: "Heat and learning safely",
    hazard: "Heatwave",
    level: "All learners",
    minutes: 5,
    summary: "Recognize heat stress, use prevention steps, and involve responsible adults early.",
    source: "https://sachet.ndma.gov.in/DosDont",
    lessons: [
      {
        id: "reduce-heat",
        title: "Reduce exposure",
        content:
          "Follow local heat guidance and school decisions about outdoor activity. Use shaded or cooler spaces when directed, take breaks, and drink water as advised by responsible adults.",
      },
      {
        id: "tell-an-adult",
        title: "Speak up early",
        content:
          "Tell a teacher or responsible adult if you or a classmate feels unwell in the heat. Confusion, fainting, or severe symptoms need urgent adult attention and medical advice. Do not try to diagnose or treat a serious condition alone.",
      },
      {
        id: "include-everyone",
        title: "Plan inclusively",
        content:
          "People can be affected differently by heat. Staff should plan access to water, rest, shade, and modified activities using local health guidance.",
      },
    ],
    quiz: [
      {
        id: "q-heat",
        prompt: "A classmate feels faint during an outdoor activity. What is the best next step?",
        options: [
          { id: "a", text: "Tell a responsible adult immediately and follow their instructions" },
          { id: "b", text: "Ask them to finish the activity first" },
        ],
        answer: "a",
        explanation:
          "Early adult support matters. Staff should follow local health guidance and seek medical help when needed.",
      },
    ],
  },
];

export const scenarios = [
  {
    id: "classroom-earthquake",
    title: "Classroom earthquake",
    hazard: "Earthquake",
    description:
      "A classroom begins shaking during a lesson. Choose the safest response at each step.",
    source: "https://www.nidm.gov.in/PDF/pubs/NDMA/17.pdf",
    steps: [
      {
        id: "first",
        prompt: "Shaking begins while you are at your desk. What do you do?",
        choices: [
          {
            id: "drop",
            label: "Drop low, take cover under a sturdy desk, and hold on",
            correct: true,
            feedback: "Correct. Protect your head and neck, and hold on until shaking stops.",
          },
          {
            id: "run",
            label: "Run for the stairs immediately",
            correct: false,
            feedback:
              "Moving during shaking can expose you to falling objects. Protect yourself first.",
          },
          {
            id: "window",
            label: "Stand by the window to see what is happening",
            correct: false,
            feedback: "Windows can break. Move away and protect your head.",
          },
        ],
      },
      {
        id: "next",
        prompt: "The shaking has stopped. What next?",
        choices: [
          {
            id: "staff",
            label: "Wait for staff direction, then use the planned route",
            correct: true,
            feedback:
              "Correct. The planned route and adult guidance support an orderly evacuation.",
          },
          {
            id: "lift",
            label: "Take the lift before it gets busy",
            correct: false,
            feedback:
              "Do not use lifts after an earthquake. Follow staff directions and the local plan.",
          },
        ],
      },
    ],
  },
  {
    id: "campus-fire",
    title: "Campus fire alarm",
    hazard: "Fire",
    description: "An alarm sounds while your class is working in a campus building.",
    source: "https://nidm.mha.gov.in/safety_school.asp",
    steps: [
      {
        id: "leave",
        prompt: "The alarm sounds. How should the group leave?",
        choices: [
          {
            id: "planned",
            label: "Leave belongings and follow staff along the marked route",
            correct: true,
            feedback: "Correct. Keep routes clear and follow the site's fire plan.",
          },
          {
            id: "bag",
            label: "Collect bags before leaving",
            correct: false,
            feedback: "Collecting belongings delays evacuation and may obstruct others.",
          },
        ],
      },
      {
        id: "assembly",
        prompt: "You reach the assembly area. What should you do?",
        choices: [
          {
            id: "report",
            label: "Stay with your group and report concerns to staff",
            correct: true,
            feedback: "Correct. Staff use the assembly area to account for groups.",
          },
          {
            id: "return",
            label: "Go back inside to find a friend",
            correct: false,
            feedback: "Never re-enter until authorized. Tell staff so they can respond safely.",
          },
        ],
      },
    ],
  },
  {
    id: "flooded-route",
    title: "Flooded route near campus",
    hazard: "Flood",
    description: "Rain has flooded part of a route used by students leaving campus.",
    source: "https://sachet.ndma.gov.in/DosDont",
    steps: [
      {
        id: "route",
        prompt: "Water is moving across the usual route. What is safest?",
        choices: [
          {
            id: "avoid",
            label: "Stay away and follow staff to the designated safe location",
            correct: true,
            feedback:
              "Correct. Never enter moving floodwater; follow local authorities and the campus plan.",
          },
          {
            id: "cross",
            label: "Cross carefully if it looks shallow",
            correct: false,
            feedback: "Water depth and current are difficult to judge and can conceal hazards.",
          },
        ],
      },
    ],
  },
];
