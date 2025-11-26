/**
 * Frontmatter Building Utilities
 *
 * Centralized YAML frontmatter construction for markdown files.
 * Eliminates duplication across event and scholarship API routes.
 *
 * @module frontmatter
 */

import { escapeYamlString, toYamlArray } from './stringHelpers';

/**
 * Base frontmatter field interface
 */
interface FrontmatterField {
  key: string;
  value: string | number | boolean | string[];
  required?: boolean;
}

/**
 * Event frontmatter data
 */
export interface EventFrontmatter {
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  image: string;
  summary: string;
  tags?: string[];
  registrationLink?: string;
  registrationRequired: boolean;
  draft: boolean;
}

/**
 * Scholarship frontmatter data
 */
export interface ScholarshipFrontmatter {
  name: string;
  amount: number;
  frequency: string;
  deadline: string;
  description: string;
  eligibility: string[] | string;
}

/**
 * Builds YAML frontmatter for an event
 *
 * @param data - Event frontmatter data
 * @returns Formatted YAML frontmatter string
 */
export function buildEventFrontmatter(data: EventFrontmatter): string {
  const fields: string[] = [
    '---',
    `title: "${escapeYamlString(data.title)}"`,
    `date: ${data.date}`,
  ];

  // Optional end date
  if (data.endDate) {
    fields.push(`endDate: ${data.endDate}`);
  }

  // Optional time
  if (data.time) {
    fields.push(`time: "${data.time}"`);
  }

  // Required fields
  fields.push(
    `location: "${escapeYamlString(data.location)}"`,
    `image: "${data.image}"`,
    `summary: "${escapeYamlString(data.summary)}"`
  );

  // Optional tags array
  if (data.tags && data.tags.length > 0) {
    fields.push(`tags:\n${data.tags.map(tag => `  - ${tag.trim()}`).join('\n')}`);
  }

  // Optional registration link
  if (data.registrationLink) {
    fields.push(`registrationLink: "${data.registrationLink}"`);
  }

  // Boolean fields
  fields.push(
    `registrationRequired: ${data.registrationRequired}`,
    `draft: ${data.draft}`,
    '---'
  );

  return fields.join('\n');
}

/**
 * Builds YAML frontmatter for a scholarship
 *
 * @param data - Scholarship frontmatter data
 * @returns Formatted YAML frontmatter string
 */
export function buildScholarshipFrontmatter(data: ScholarshipFrontmatter): string {
  const fields: string[] = [
    '---',
    `name: "${escapeYamlString(data.name)}"`,
    `amount: ${data.amount}`,
    `frequency: "${escapeYamlString(data.frequency)}"`,
    `deadline: ${data.deadline}`,
    `description: "${escapeYamlString(data.description)}"`,
  ];

  // Handle eligibility (can be string or array)
  if (typeof data.eligibility === 'string') {
    fields.push(`eligibility:\n${toYamlArray(data.eligibility)}`);
  } else if (Array.isArray(data.eligibility)) {
    const eligibilityList = data.eligibility
      .map(e => `  - "${escapeYamlString(e.trim())}"`)
      .join('\n');
    fields.push(`eligibility:\n${eligibilityList}`);
  }

  fields.push('---');

  return fields.join('\n');
}

/**
 * Generic frontmatter builder for custom content types
 *
 * @param fields - Array of frontmatter fields
 * @returns Formatted YAML frontmatter string
 */
export function buildFrontmatter(fields: Record<string, unknown>): string {
  const lines: string[] = ['---'];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      lines.push(`${key}: "${escapeYamlString(value)}"`);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      const items = value.map(item => `  - "${escapeYamlString(String(item))}"`).join('\n');
      lines.push(`${key}:\n${items}`);
    } else if (typeof value === 'object') {
      // For nested objects, convert to YAML format
      const nestedYaml = Object.entries(value)
        .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
        .join('\n');
      lines.push(`${key}:\n${nestedYaml}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Parses frontmatter from markdown content
 *
 * @param content - Markdown content with frontmatter
 * @returns Object with frontmatter and body
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, yamlContent, body] = match;
  const frontmatter: Record<string, unknown> = {};

  // Simple YAML parsing (for basic key: value pairs)
  const lines = yamlContent.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    frontmatter[key] = value.replace(/^["']|["']$/g, '');
  }

  return { frontmatter, body: body.trim() };
}
