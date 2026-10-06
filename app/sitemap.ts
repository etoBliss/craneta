import type { MetadataRoute } from 'next'

const SITE_URL = 'https://craneta.app'

/**
 * Sitemap for search engines. Only public pages are listed — dashboard
 * and auth routes are not crawlable and are also Disallowed in robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    return [
        {
            url: `${SITE_URL}/`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}
