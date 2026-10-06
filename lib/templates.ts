import type { IconName } from '@/components/Icon'

export interface TemplateField {
    key: string
    label: string
    /**
     * A short hint shown as placeholder text so the user knows what to write.
     * Intentionally empty — the value is the user's own context, not ours.
     */
    placeholder: string
    value: string
}

export interface TemplatePage {
    category: string
    title: string
    blurb: string
    fields: TemplateField[]
}

export interface Template {
    slug: string
    name: string
    icon: IconName
    tagline: string
    description: string
    pages: TemplatePage[]
}

/**
 * Starter templates. Each template is a bundle of pages that get
 * applied at once. Field values are deliberately empty — the *user*
 * fills in their own context. Placeholders are short hints so they
 * know what to write.
 */
export const TEMPLATES: Template[] = [
    {
        slug: 'developer',
        name: 'Developer',
        icon: 'working',
        tagline: 'Code, reviews, and weekend projects',
        description:
            'A working-style + standing-facts pair tuned for software work. Covers how you like code reviewed, communication cadence, and your current stack.',
        pages: [
            {
                category: 'working_style',
                title: 'How I work',
                blurb: 'How you prefer code, reviews, and engineering decisions to be handled.',
                fields: [
                    {
                        key: 'focus',
                        label: 'How I focus best',
                        placeholder: 'Long uninterrupted blocks, pair sessions, async written context…',
                        value: '',
                    },
                    {
                        key: 'hours',
                        label: 'Preferred working hours',
                        placeholder: '9–6 in my timezone, or async across timezones',
                        value: '',
                    },
                    {
                        key: 'review_style',
                        label: 'How I like code reviewed',
                        placeholder: 'Specific, kind, push back on naming, ask questions before nitpicks',
                        value: '',
                    },
                    {
                        key: 'iteration',
                        label: 'How I like to iterate',
                        placeholder: 'Small commits, throwaway spikes OK, prefer shipping over polish',
                        value: '',
                    },
                ],
            },
            {
                category: 'standing_facts',
                title: 'My stack',
                blurb: 'Languages, frameworks, and tools you actually use day-to-day.',
                fields: [
                    {
                        key: 'role',
                        label: 'Current role',
                        placeholder: 'Senior frontend engineer, staff platform engineer, indie hacker…',
                        value: '',
                    },
                    {
                        key: 'languages',
                        label: 'Primary languages',
                        placeholder: 'TypeScript, Python, Go, Rust…',
                        value: '',
                    },
                    {
                        key: 'frameworks',
                        label: 'Frameworks & libraries',
                        placeholder: 'Next.js, FastAPI, React, Postgres, Kafka…',
                        value: '',
                    },
                    {
                        key: 'tools',
                        label: 'Daily tools',
                        placeholder: 'VS Code, vim, Linear, GitHub, docker, fly.io…',
                        value: '',
                    },
                ],
            },
            {
                category: 'communication_preferences',
                title: 'Communication preferences',
                blurb: 'How you want responses shaped, formatted, and paced.',
                fields: [
                    {
                        key: 'tone',
                        label: 'Preferred tone',
                        placeholder: 'Direct, no fluff, but not curt',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Preferred response format',
                        placeholder: 'Bullets first, full code blocks, table for tradeoffs',
                        value: '',
                    },
                    {
                        key: 'pacing',
                        label: 'Pacing',
                        placeholder: 'Give me the answer first, then the reasoning',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Hedging, filler, restating my question back at me',
                        value: '',
                    },
                ],
            },
        ],
    },
    {
        slug: 'student',
        name: 'Student',
        icon: 'projects',
        tagline: 'Classes, study, and side projects',
        description:
            'A study-focused set covering how you learn, what you are working on this term, and how you want explanations. Works for high school, undergrad, grad, or self-taught.',
        pages: [
            {
                category: 'working_style',
                title: 'How I learn',
                blurb: 'How you absorb new material best — pacing, examples, and review loops.',
                fields: [
                    {
                        key: 'learning',
                        label: 'How I learn best',
                        placeholder: 'Worked examples first, then theory. Or theory before practice.',
                        value: '',
                    },
                    {
                        key: 'pace',
                        label: 'Pacing',
                        placeholder: 'Slow and deep, or fast and broad',
                        value: '',
                    },
                    {
                        key: 'review',
                        label: 'How I review',
                        placeholder: 'Spaced repetition, teach-back, write summary notes',
                        value: '',
                    },
                ],
            },
            {
                category: 'active_projects',
                title: 'This term',
                blurb: 'Current courses, papers, and personal projects.',
                fields: [
                    {
                        key: 'courses',
                        label: 'Current courses',
                        placeholder: 'CS 281 Algorithms, MATH 211 Linear Algebra…',
                        value: '',
                    },
                    {
                        key: 'project',
                        label: 'Current main project',
                        placeholder: 'What are you building or finishing this semester?',
                        value: '',
                    },
                    {
                        key: 'goals',
                        label: 'Goals this term',
                        placeholder: 'Ace the proof midterm, finish the thesis chapter, ship the demo…',
                        value: '',
                    },
                    {
                        key: 'blockers',
                        label: 'Current blockers',
                        placeholder: 'Stuck on a topic, waiting on feedback, time management…',
                        value: '',
                    },
                ],
            },
            {
                category: 'communication_preferences',
                title: 'Communication preferences',
                blurb: 'How you want explanations shaped when you ask for help.',
                fields: [
                    {
                        key: 'tone',
                        label: 'Preferred tone',
                        placeholder: 'Patient, walk-through, encouraging but not condescending',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Preferred format',
                        placeholder: 'Concrete examples, analogies, step-by-step',
                        value: '',
                    },
                    {
                        key: 'depth',
                        label: 'Depth',
                        placeholder: 'Intuition first, then rigor. Or full detail up front.',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Skipping steps, assuming I know the jargon, giving up too fast',
                        value: '',
                    },
                ],
            },
        ],
    },
    {
        slug: 'freelancer',
        name: 'Freelancer',
        icon: 'pin',
        tagline: 'Clients, scope, and delivery',
        description:
            'Work-style + standing-facts + active-clients for solo or small-team work. Helps any AI tool talk to you like a collaborator, not a stranger.',
        pages: [
            {
                category: 'working_style',
                title: 'How I work with clients',
                blurb: 'How you prefer briefs, reviews, and communications with clients to flow.',
                fields: [
                    {
                        key: 'scope',
                        label: 'How I scope work',
                        placeholder: 'Fixed scope per milestone, T&M with weekly check-ins…',
                        value: '',
                    },
                    {
                        key: 'feedback',
                        label: 'How I prefer feedback',
                        placeholder: 'Async written, weekly Loom, in-context comments on the design…',
                        value: '',
                    },
                    {
                        key: 'comms',
                        label: 'Communication cadence',
                        placeholder: 'Daily Slack, weekly email summary, end-of-milestone demos',
                        value: '',
                    },
                    {
                        key: 'tools',
                        label: 'Client collaboration tools',
                        placeholder: 'Linear, Notion, Figma, dedicated Slack channels…',
                        value: '',
                    },
                ],
            },
            {
                category: 'standing_facts',
                title: 'About me',
                blurb: 'Who you are, who you serve, and what you are known for.',
                fields: [
                    {
                        key: 'role',
                        label: 'What I do',
                        placeholder: 'Brand designer for early-stage startups, fractional CTO…',
                        value: '',
                    },
                    {
                        key: 'audience',
                        label: 'Typical clients',
                        placeholder: 'Seed-stage founders, indie SaaS, local restaurants…',
                        value: '',
                    },
                    {
                        key: 'availability',
                        label: 'Current availability',
                        placeholder: 'Open for one project in Q1, otherwise full',
                        value: '',
                    },
                    {
                        key: 'pricing',
                        label: 'Pricing posture',
                        placeholder: 'Project-based, retainer, equity-friendly for the right fit…',
                        value: '',
                    },
                ],
            },
            {
                category: 'active_projects',
                title: 'Active engagements',
                blurb: 'Current client work and where you could use help.',
                fields: [
                    {
                        key: 'client1',
                        label: 'Client / project 1',
                        placeholder: 'Acme Co — rebrand, due mid-Feb',
                        value: '',
                    },
                    {
                        key: 'client2',
                        label: 'Client / project 2',
                        placeholder: '…',
                        value: '',
                    },
                    {
                        key: 'goals',
                        label: 'This quarter',
                        placeholder: 'Ship the rebrand, land two new clients, write the case study',
                        value: '',
                    },
                    {
                        key: 'blockers',
                        label: 'Current blockers',
                        placeholder: 'Waiting on legal review, one scope dispute…',
                        value: '',
                    },
                ],
            },
            {
                category: 'communication_preferences',
                title: 'Communication preferences',
                blurb: 'How you want AI tools to respond when you are working.',
                fields: [
                    {
                        key: 'tone',
                        label: 'Preferred tone',
                        placeholder: 'Sharp, friendly, treat me like a peer',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Preferred format',
                        placeholder: 'Drafts over outlines, headers, scannable',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Hedging, corporate boilerplate, "I would be happy to…"',
                        value: '',
                    },
                ],
            },
        ],
    },
    {
        slug: 'writer',
        name: 'Writer',
        icon: 'quote',
        tagline: 'Voice, audience, and craft',
        description:
            'For people who write — copy, fiction, journalism, technical. Voice, audience, and rules of thumb.',
        pages: [
            {
                category: 'standing_facts',
                title: 'My writing',
                blurb: 'Who you write for and what you are known for.',
                fields: [
                    {
                        key: 'role',
                        label: 'What I write',
                        placeholder: 'Long-form essays, technical docs, ad copy, screenplays…',
                        value: '',
                    },
                    {
                        key: 'audience',
                        label: 'Audience',
                        placeholder: 'Senior engineers, general readers, niche community…',
                        value: '',
                    },
                    {
                        key: 'voice',
                        label: 'My voice in one line',
                        placeholder: 'Plainspoken, dry, specific. Always show the receipt.',
                        value: '',
                    },
                ],
            },
            {
                category: 'working_style',
                title: 'How I write',
                blurb: 'Conditions, rituals, and rules you write under.',
                fields: [
                    {
                        key: 'ritual',
                        label: 'Writing ritual',
                        placeholder: 'Morning pages, long walks, voice-memo dumps first',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Default formats',
                        placeholder: 'Long-essay, list, dialogue, code-and-prose',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Adverbs, jargon, throat-clearing intros, exclamation points',
                        value: '',
                    },
                ],
            },
            {
                category: 'active_projects',
                title: 'Current pieces',
                blurb: 'What you are working on right now.',
                fields: [
                    {
                        key: 'piece1',
                        label: 'Piece 1',
                        placeholder: 'Working title + where it is in the process',
                        value: '',
                    },
                    {
                        key: 'piece2',
                        label: 'Piece 2',
                        placeholder: '…',
                        value: '',
                    },
                    {
                        key: 'goals',
                        label: 'Goals this month',
                        placeholder: 'Finish draft, send pitches, publish by the 15th',
                        value: '',
                    },
                ],
            },
        ],
    },
    {
        slug: 'designer',
        name: 'Designer',
        icon: 'pin',
        tagline: 'Feedback, tools, and craft',
        description:
            'For product, brand, or visual designers. Covers how you want feedback, your tools, and active work.',
        pages: [
            {
                category: 'working_style',
                title: 'Design loop',
                blurb: 'How you explore, decide, and ship design work.',
                fields: [
                    {
                        key: 'exploration',
                        label: 'How I explore',
                        placeholder: 'Three quick concepts, then narrow. Or one sharp direction first.',
                        value: '',
                    },
                    {
                        key: 'feedback',
                        label: 'How I want feedback',
                        placeholder: 'Specific, opinionated, tied to the brief — not "I like it"',
                        value: '',
                    },
                    {
                        key: 'handoff',
                        label: 'Handoff posture',
                        placeholder: 'Specs + Loom, Figma dev mode, pair with engineering',
                        value: '',
                    },
                ],
            },
            {
                category: 'standing_facts',
                title: 'Tools & craft',
                blurb: 'Your stack, mediums, and references.',
                fields: [
                    {
                        key: 'role',
                        label: 'Design role',
                        placeholder: 'Senior product designer, brand lead, design systems…',
                        value: '',
                    },
                    {
                        key: 'tools',
                        label: 'Primary tools',
                        placeholder: 'Figma, Framer, Linear, Cinema 4D, your font of choice…',
                        value: '',
                    },
                    {
                        key: 'mediums',
                        label: 'Mediums I work in',
                        placeholder: 'Web, mobile, motion, print, 3D, type…',
                        value: '',
                    },
                ],
            },
            {
                category: 'active_projects',
                title: 'Active work',
                blurb: 'Current projects and where you want help.',
                fields: [
                    {
                        key: 'project1',
                        label: 'Project 1',
                        placeholder: 'Name + where it is in the process',
                        value: '',
                    },
                    {
                        key: 'project2',
                        label: 'Project 2',
                        placeholder: '…',
                        value: '',
                    },
                    {
                        key: 'goals',
                        label: 'Goals this sprint',
                        placeholder: 'Ship the new landing, finish the brand guide draft',
                        value: '',
                    },
                ],
            },
            {
                category: 'communication_preferences',
                title: 'Communication preferences',
                blurb: 'How you want AI tools to respond when you are designing.',
                fields: [
                    {
                        key: 'tone',
                        label: 'Preferred tone',
                        placeholder: 'Sharp, craft-aware, treat me like a peer',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Preferred format',
                        placeholder: 'Visual + words, options, tradeoffs called out',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Generic stock advice, "it depends", hedging on aesthetics',
                        value: '',
                    },
                ],
            },
        ],
    },
    {
        slug: 'researcher',
        name: 'Researcher',
        icon: 'facts',
        tagline: 'Reading, writing, and rigor',
        description:
            'For academic or industry researchers. How you read papers, write, and track active investigations.',
        pages: [
            {
                category: 'working_style',
                title: 'Research workflow',
                blurb: 'How you read, write, and run investigations.',
                fields: [
                    {
                        key: 'reading',
                        label: 'How I read papers',
                        placeholder: 'Abstract → figures → conclusion → back to method. Or full read first.',
                        value: '',
                    },
                    {
                        key: 'writing',
                        label: 'How I write',
                        placeholder: 'Outline first, draft in sections, references last',
                        value: '',
                    },
                    {
                        key: 'collab',
                        label: 'Collaboration',
                        placeholder: 'Solo mode, weekly co-author sync, open notebook…',
                        value: '',
                    },
                ],
            },
            {
                category: 'standing_facts',
                title: 'Field & methods',
                blurb: 'Your discipline, methods, and tools.',
                fields: [
                    {
                        key: 'role',
                        label: 'Role',
                        placeholder: 'PhD student, postdoc, applied scientist, research engineer…',
                        value: '',
                    },
                    {
                        key: 'field',
                        label: 'Field',
                        placeholder: 'ML theory, HCI, computational biology, economics…',
                        value: '',
                    },
                    {
                        key: 'methods',
                        label: 'Methods',
                        placeholder: 'Qualitative interviews, RL, statistical modeling…',
                        value: '',
                    },
                ],
            },
            {
                category: 'active_projects',
                title: 'Active investigations',
                blurb: 'Papers, questions, and current threads.',
                fields: [
                    {
                        key: 'paper1',
                        label: 'Current paper / project',
                        placeholder: 'Title + where it is',
                        value: '',
                    },
                    {
                        key: 'paper2',
                        label: 'Next project',
                        placeholder: '…',
                        value: '',
                    },
                    {
                        key: 'goals',
                        label: 'Goals this quarter',
                        placeholder: 'Submit before the deadline, finish the literature review',
                        value: '',
                    },
                ],
            },
            {
                category: 'communication_preferences',
                title: 'Communication preferences',
                blurb: 'How you want AI tools to respond when you are researching.',
                fields: [
                    {
                        key: 'tone',
                        label: 'Preferred tone',
                        placeholder: 'Precise, hedge when appropriate, cite specific claims',
                        value: '',
                    },
                    {
                        key: 'format',
                        label: 'Preferred format',
                        placeholder: 'Structured, with citations, show your reasoning',
                        value: '',
                    },
                    {
                        key: 'avoid',
                        label: 'Things to avoid',
                        placeholder: 'Confident-but-untrue claims, vague handwaves, generic intros',
                        value: '',
                    },
                ],
            },
        ],
    },
]

export function getTemplate(slug: string): Template | undefined {
    return TEMPLATES.find((t) => t.slug === slug)
}
