import { MetadataRoute } from 'next';
import { projects } from '@/lib/projects';
import { getBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sidequestlab-homepage.vercel.app';
  const locales = ['ko', 'en'];
  const staticLastModified = new Date('2026-03-30');
  const projectFallbackLastModified = new Date('2026-03-01');

  const staticPages = ['', '/projects', '/about', '/blog', '/workflow', '/harness'];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: staticLastModified,
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Project detail pages
  for (const project of projects) {
    if (project.longDescription) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/projects/${project.id}`,
          lastModified: project.startDate ? new Date(project.startDate) : projectFallbackLastModified,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  // Blog post pages
  for (const locale of locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
