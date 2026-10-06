import type { IconName } from '@/components/Icon'

export type PassportPageCategory =
    | 'working_style'
    | 'standing_facts'
    | 'communication_preferences'
    | 'active_projects'
    | 'custom'

export interface CategoryMeta {
    label: string
    icon: IconName
    description: string
}

export const CATEGORY_META: Record<PassportPageCategory, CategoryMeta> = {
    working_style: {
        label: 'Working Style',
        icon: 'working',
        description: 'How you focus, structure your time, and collaborate.',
    },
    standing_facts: {
        label: 'Standing Facts',
        icon: 'facts',
        description: 'Persistent truths about who you are and what you do.',
    },
    communication_preferences: {
        label: 'Communication',
        icon: 'chat',
        description: 'Tone, format, and verbosity preferences for AI responses.',
    },
    active_projects: {
        label: 'Active Projects',
        icon: 'projects',
        description: "What you're working on right now.",
    },
    custom: {
        label: 'Custom',
        icon: 'sparkle',
        description: 'Your own category.',
    },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(
    ([value, meta]) => ({ value: value as PassportPageCategory, ...meta })
)