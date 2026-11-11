import type { Resume } from './types';

/**
 * Single source of truth for everything on the site, transcribed from the
 * resume. The phone number is deliberately left out (a test enforces it).
 */
export const resume: Resume = {
  profile: {
    name: 'Daniel Dampson',
    headline: 'Computer Science student and software engineer',
    location: 'Prince Edward Island, Canada',
    bio: [
      "I'm a Computer Science student at the University of Prince Edward Island, minoring in Mathematics. I like building things end to end, from real-time multiplayer games to native macOS apps.",
      'Most recently I helped build a full-stack procurement portal at Amobys, and handled the data and delivery routing for PEI’s Children Summer Food Program.',
    ],
  },

  education: {
    school: 'University of Prince Edward Island',
    degree: 'Bachelor of Science in Computer Science',
    minor: 'Mathematics',
    coursework: [
      'Data Structures and Algorithms',
      'Software Engineering',
      'Operating Systems',
      'System Design',
      'Machine Learning',
    ],
  },

  experience: [
    {
      id: 'gov-pei-summer-student',
      title: 'Summer Student',
      team: 'Children Summer Food Program',
      company: 'Government of Prince Edward Island',
      dates: { start: { year: 2026, month: 6 }, end: { year: 2026, month: 9 } },
      stack: ['Excel', 'Power Query', 'Copilot'],
      bullets: [
        'Built an Excel Power Query workflow to import and clean 2,000+ household registrations from a web-form CSV export.',
        'Designed delivery routes across every city in PEI by clustering households around 7 partner vendor pickup points, with separate route sheets for 15+ drivers.',
        'Built an interactive shared Excel dashboard to track hours, mileage and delivery reports for 15+ drivers, giving supervisors a clear view of workload and ensuring accurate mileage reimbursement.',
      ],
    },
    {
      id: 'amobys-software-engineer-intern',
      title: 'Software Engineer Intern',
      company: 'Amobys',
      dates: { start: { year: 2026, month: 1 }, end: { year: 2026, month: 4 } },
      stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      bullets: [
        'Helped build and maintain a full-stack procurement portal for mining and supply, letting clients request quotes, approve orders and track deliveries.',
        'Integrated the Claude API to extract data from supplier PDFs, reducing manual entry for staff.',
        'Implemented role-based authentication so client companies can securely access only their own orders and information.',
      ],
    },
    {
      id: 'buchanan-technical-support-analyst',
      title: 'Technical Support Analyst',
      company: 'Buchanan Technologies',
      dates: { start: { year: 2025, month: 11 }, end: { year: 2026, month: 8 } },
      stack: ['Hardware', 'Software', 'Networking', 'Remote support'],
      bullets: [
        'Resolved hardware, software, account and network issues for client end users by phone, email and remote session, documenting each ticket from triage to resolution.',
        'Followed documented troubleshooting and escalation procedures, handing complex issues off to higher-tier teams with clear notes.',
        'Explained technical fixes to non-technical users in plain language, adjusting each explanation to the audience.',
      ],
    },
    {
      id: 'upei-teaching-assistant',
      title: 'Teaching Assistant',
      company: 'University of Prince Edward Island',
      dates: { start: { year: 2025, month: 9 }, end: { year: 2026, month: 4 } },
      stack: ['Java', 'Python', 'C++'],
      bullets: [
        'Mentored 40+ students in Java, Python and C++ programming labs, guiding them through debugging, data structures and algorithmic problem-solving.',
      ],
    },
  ],

  projects: [
    {
      slug: 'startingfive',
      name: 'StartingFive',
      tagline: 'Real-time multiplayer basketball draft game',
      category: 'web',
      stack: ['React', 'TypeScript', 'Node.js', 'Socket.IO', 'Tailwind CSS', 'Python', 'SVG'],
      bullets: [
        'Built a real-time multiplayer web game in React and TypeScript with a Node.js/Socket.IO backend. Two players create or join rooms with 4-letter codes and take turns drafting 6-player lineups; first to 3 points wins.',
        'Designed a server-authoritative architecture: match state lives in in-memory rooms on the server, which validates every pick and broadcasts updates to both clients. Undrafted players’ stats are stripped server-side so they can’t be read from the browser.',
        'Migrated the game logic and typed client/server event contracts into a shared TypeScript module used by both the browser and the server. Discriminated unions and typed Socket.IO events catch protocol mismatches at compile time.',
        'Wrote a Node.js data pipeline that parses a Basketball Reference CSV (a Kaggle dataset) into 22,104 player-seasons going back to 1974, merging the multi-team rows of players traded mid-season and skipping invalid positions. Each round draws a random 40-player pool with a partial Fisher–Yates shuffle.',
      ],
      links: [{ label: 'GitHub', href: 'https://github.com/Abeikud/Starting5ive' }],
    },
    {
      slug: 'disland',
      name: 'DIsland',
      tagline: 'Dynamic Island for macOS',
      category: 'macos',
      stack: ['Swift', 'SwiftUI', 'AppKit', 'Objective-C'],
      bullets: [
        'Reverse-engineered the architecture of a commercial macOS app using REA, then designed and built a comparable native application from scratch.',
        'Built a custom animated UI system (SwiftUI + AppKit) with state-driven view transitions, window-level animation and real-time data binding from asynchronous background polling.',
        'Diagnosed and validated agent-proposed bug fixes, verifying them through hands-on testing and log analysis on real hardware.',
      ],
      links: [],
    },
    {
      slug: 'portfolio-website',
      name: 'Portfolio Website',
      tagline: 'Hand-built responsive portfolio',
      category: 'web',
      stack: ['HTML', 'CSS', 'JavaScript'],
      bullets: [
        'Designed and built a responsive personal portfolio from scratch with semantic HTML, CSS and vanilla JavaScript to showcase experience, projects and contact information.',
        'Implemented a mobile hamburger menu that toggles navigation through DOM manipulation, alongside a fixed, frosted-glass navigation bar with backdrop blur.',
      ],
      links: [],
    },
  ],

  skills: [
    {
      id: 'languages',
      label: 'Languages',
      skills: ['Java', 'Python', 'C++', 'C#', 'JavaScript', 'TypeScript', 'SQL', 'HTML/CSS'],
    },
    {
      id: 'frameworks',
      label: 'Frameworks & Libraries',
      skills: [
        'React',
        'Next.js',
        'Node.js',
        'Express',
        'Flask',
        'Redux Toolkit',
        'Spring Boot',
        'SQLAlchemy',
        'Marshmallow',
      ],
    },
    {
      id: 'data-cloud',
      label: 'Databases & Cloud',
      skills: [
        'Google BigQuery',
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'Supabase',
        'AWS',
        'Google Cloud',
        'Socket.IO',
      ],
    },
    {
      id: 'tools',
      label: 'Tools & Infrastructure',
      skills: [
        'Git',
        'GitHub Actions',
        'Docker',
        'Linux',
        'Microsoft Entra ID',
        'Postman',
        'JUnit',
        'Unity',
        'Drupal',
      ],
    },
  ],

  certifications: [
    { id: 'google-cloud-fundamentals', name: 'Google Cloud Fundamentals', issuer: 'Google Cloud' },
    {
      id: 'software-design-and-architecture',
      name: 'Software Design and Architecture',
      issuer: 'Coursera',
    },
  ],

  contact: {
    email: 'abeikudampson@gmail.com',
    linkedin: 'https://www.linkedin.com/in/daniel-dampson-146a95241/',
    github: 'https://github.com/Abeikud',
    resumePdf: 'DDAMPSON_RESUME.pdf',
  },
};
