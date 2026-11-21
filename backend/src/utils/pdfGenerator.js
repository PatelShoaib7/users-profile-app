const fs = require('fs');
const path = require('path');

const escapePdfText = (text = '') =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

/**
 * Generates a valid single-page %PDF-1.4 document with exact xref byte offsets
 * so browser PDF viewers (Chrome/Edge/Firefox) render it cleanly inline and on download.
 */
const buildValidPdfBuffer = ({ title, subtitle, metadataLine, sections }) => {
  const lines = [];

  // Header Banner Rectangle (Dark Slate / Teal header bar)
  lines.push('0.06 0.29 0.36 rg');
  lines.push('40 725 532 75 re f');

  // Header Title (White)
  lines.push('BT');
  lines.push('/F2 18 Tf');
  lines.push('1 1 1 rg');
  lines.push(`56 768 Td (${escapePdfText(title)}) Tj`);
  lines.push('ET');

  // Header Subtitle (Light Teal)
  lines.push('BT');
  lines.push('/F1 11 Tf');
  lines.push('0.82 0.95 0.94 rg');
  lines.push(`56 746 Td (${escapePdfText(subtitle)}) Tj`);
  lines.push('ET');

  // Metadata Line below banner
  lines.push('BT');
  lines.push('/F2 9 Tf');
  lines.push('0.30 0.35 0.42 rg');
  lines.push(`42 702 Td (${escapePdfText(metadataLine)}) Tj`);
  lines.push('ET');

  // Divider line
  lines.push('0.82 0.85 0.90 RG');
  lines.push('1 w');
  lines.push('40 692 m 572 692 l S');

  let y = 666;

  for (const section of sections) {
    if (y < 90) break;

    // Section Heading
    lines.push('BT');
    lines.push('/F2 12 Tf');
    lines.push('0.06 0.29 0.36 rg');
    lines.push(`42 ${y} Td (${escapePdfText(section.heading)}) Tj`);
    lines.push('ET');
    y -= 18;

    // Section Bullets / Paragraphs
    for (const item of section.items) {
      if (y < 70) break;
      lines.push('BT');
      lines.push('/F1 10 Tf');
      lines.push('0.15 0.18 0.24 rg');
      lines.push(`52 ${y} Td (${escapePdfText(item)}) Tj`);
      lines.push('ET');
      y -= 15;
    }

    y -= 10;
  }

  // Footer
  lines.push('0.82 0.85 0.90 RG');
  lines.push('40 52 m 572 52 l S');
  lines.push('BT');
  lines.push('/F1 8.5 Tf');
  lines.push('0.45 0.50 0.56 rg');
  lines.push(
    '42 36 Td (PeoplePulse Internal Learning Academy  |  Official Training Session Reference Material) Tj'
  );
  lines.push('ET');

  const contentStream = lines.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
};

const TRAINING_HANDBOOKS = [
  {
    filename: 'design-systems-handbook.pdf',
    title: 'Design Systems Architecture at Scale',
    subtitle: 'Component Tokens, Accessibility Standards & Cross-Team Handoff',
    metadataLine: 'Category: Technical & UI Engineering   |   Duration: 8 Hours   |   Module Code: DS-204',
    sections: [
      {
        heading: '1. Core Design Token Hierarchy',
        items: [
          '- Primitive Tokens: Base color palettes, spacing scale (4px grid), and typography ramps.',
          '- Semantic Tokens: Role-based aliases such as surface-primary, text-muted, and status-success.',
          '- Component Tokens: Scoped overrides for buttons, form controls, badges, and modal dialogs.',
        ],
      },
      {
        heading: '2. Accessibility & WCAG 2.1 AA Checklist',
        items: [
          '- Maintain a minimum 4.5:1 contrast ratio for body copy and interactive status pills.',
          '- Ensure full keyboard navigation (Tab, Shift+Tab, Escape) across modals and dropdowns.',
          '- Always pair color indicators with clear text labels or iconography.',
        ],
      },
      {
        heading: '3. Practical Engineering Handoff Takeaways',
        items: [
          '- Document empty states, shimmer loading skeletons, error states, and responsive breakpoints.',
          '- Align Figma component props directly with React component prop interfaces.',
          '- Review UI regressions during sprint demos before marking design tickets complete.',
        ],
      },
    ],
  },
  {
    filename: 'react-redux-architecture.pdf',
    title: 'Modern React 18 & Redux Toolkit Guide',
    subtitle: 'Async Thunks, Normalized State Slices & Loading UX Patterns',
    metadataLine: 'Category: Frontend Engineering   |   Duration: 7 Hours   |   Module Code: FE-301',
    sections: [
      {
        heading: '1. Structuring Feature Slices Cleanly',
        items: [
          '- Separate domain slices: authSlice, userSlice, dashboardSlice, activitySlice, portalSlice.',
          '- Use createAsyncThunk for API calls and handle pending, fulfilled, and rejected states.',
          '- Centralize toast notifications and global request counters inside uiSlice.',
        ],
      },
      {
        heading: '2. Resilient API Integration & Interceptors',
        items: [
          '- Configure a single Axios client reading VITE_API_URL from environment variables.',
          '- Attach JWT Bearer headers automatically via request interceptors.',
          '- Gracefully clear expired sessions on 401 responses without losing user context.',
        ],
      },
      {
        heading: '3. Perceived Performance & Loaders',
        items: [
          '- Use skeleton shimmer layouts during initial data loads to prevent layout shift.',
          '- Debounce search inputs (350ms) and display inline row/button spinners on mutations.',
        ],
      },
    ],
  },
  {
    filename: 'security-compliance-guide.pdf',
    title: 'Information Security & Data Privacy Essentials',
    subtitle: 'JWT Security, Secret Management, RBAC & Workplace Compliance',
    metadataLine: 'Category: Mandatory Compliance   |   Duration: 2 Hours   |   Module Code: SEC-101',
    sections: [
      {
        heading: '1. Credential & Environment Hygiene',
        items: [
          '- Never commit .env files, JWT signing keys, database URIs, or passwords to Git.',
          '- Store secrets strictly in environment variables and commit only safe .env.example templates.',
          '- Hash all user passwords with bcrypt (10+ salt rounds) and exclude password fields from JSON.',
        ],
      },
      {
        heading: '2. Role-Based Access Control (RBAC)',
        items: [
          '- Enforce least-privilege access on both Express API middleware and React routes.',
          '- Log administrative changes (create, update, status toggle, delete) in ActivityLog.',
          '- Validate all incoming request payloads and query strings using Joi schemas.',
        ],
      },
      {
        heading: '3. Handling Employee PII Safely',
        items: [
          '- Restrict directory exports and sensitive profile edits to authorized Admin and HR roles.',
          '- Report suspected credential exposure immediately to the Platform Security team.',
        ],
      },
    ],
  },
  {
    filename: 'product-metrics-playbook.pdf',
    title: 'Product Metrics & Experimentation Playbook',
    subtitle: 'KPI Definition, Cohort Retention & Data-Informed Roadmaps',
    metadataLine: 'Category: Product & Strategy   |   Duration: 6 Hours   |   Module Code: PM-210',
    sections: [
      {
        heading: '1. Selecting Actionable Product Metrics',
        items: [
          '- Distinguish North Star outcome metrics from vanity page-view counters.',
          '- Track activation milestones (such as 100% employee profile completion within week 1).',
          '- Pair quantitative funnel drop-off metrics with qualitative usability sessions.',
        ],
      },
      {
        heading: '2. Designing Clean Experiments',
        items: [
          '- Write a falsifiable hypothesis before launching UI or workflow changes.',
          '- Define primary success criteria and guardrail metrics (API latency, error rate).',
          '- Document experiment outcomes and share learnings across Engineering and Design.',
        ],
      },
    ],
  },
  {
    filename: 'leadership-onboarding-handbook.pdf',
    title: 'Agile Delivery & Effective Team Collaboration',
    subtitle: 'Sprint Execution, Goal Tracking & Constructive Code Reviews',
    metadataLine: 'Category: Leadership & Soft Skills   |   Duration: 5 Hours   |   Module Code: LD-105',
    sections: [
      {
        heading: '1. Monthly Goal & Sprint Alignment',
        items: [
          '- Break monthly KPI targets into measurable weekly sprint deliverables.',
          '- Flag blockers early and update task statuses transparently in your workspace.',
          '- Balance feature delivery with dedicated monthly upskilling and technical debt time.',
        ],
      },
      {
        heading: '2. High-Signal Communication Habits',
        items: [
          '- Write concise pull request descriptions explaining context, trade-offs, and test steps.',
          '- Focus code reviews on correctness, security, readability, and maintainability.',
        ],
      },
    ],
  },
];

const materialsDir = path.join(__dirname, '../../public/materials');

/**
 * Ensures all sample training PDF handbooks exist on disk under backend/public/materials.
 */
const ensureTrainingMaterials = () => {
  if (!fs.existsSync(materialsDir)) {
    fs.mkdirSync(materialsDir, { recursive: true });
  }

  for (const doc of TRAINING_HANDBOOKS) {
    const filePath = path.join(materialsDir, doc.filename);
    const buffer = buildValidPdfBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  }

  return materialsDir;
};

module.exports = {
  materialsDir,
  TRAINING_HANDBOOKS,
  ensureTrainingMaterials,
};
