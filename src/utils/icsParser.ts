/**
 * Lightweight ICS Calendar Parser
 *
 * Parses ICS calendar feeds and extracts upcoming events.
 */

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Parse an ICS date string to a JavaScript Date object
 */
function parseICSDate(dateStr: string): Date {
  // Handle formats like: 20250115T140000Z or 20250115
  const cleaned = dateStr.replace(/[^0-9TZ]/g, '');

  if (cleaned.includes('T')) {
    // DateTime format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
    const year = parseInt(cleaned.substring(0, 4), 10);
    const month = parseInt(cleaned.substring(4, 6), 10) - 1;
    const day = parseInt(cleaned.substring(6, 8), 10);
    const hour = parseInt(cleaned.substring(9, 11), 10);
    const minute = parseInt(cleaned.substring(11, 13), 10);
    const second = parseInt(cleaned.substring(13, 15), 10) || 0;

    if (cleaned.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  } else {
    // Date-only format: YYYYMMDD
    const year = parseInt(cleaned.substring(0, 4), 10);
    const month = parseInt(cleaned.substring(4, 6), 10) - 1;
    const day = parseInt(cleaned.substring(6, 8), 10);
    return new Date(year, month, day);
  }
}

/**
 * Unfold ICS content (handle line continuations)
 */
function unfoldICS(content: string): string {
  return content.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}

/**
 * Decode ICS escaped characters
 */
function decodeICSValue(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse ICS content and extract events
 */
export function parseICS(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const unfolded = unfoldICS(icsContent);
  const lines = unfolded.split(/\r?\n/);

  let currentEvent: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.title && currentEvent.startDate) {
        events.push({
          uid: currentEvent.uid || '',
          title: currentEvent.title,
          description: currentEvent.description || '',
          location: currentEvent.location || '',
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate || currentEvent.startDate,
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).split(';')[0];
        const value = decodeICSValue(line.substring(colonIndex + 1));

        switch (key) {
          case 'UID':
            currentEvent.uid = value;
            break;
          case 'SUMMARY':
            currentEvent.title = value;
            break;
          case 'DESCRIPTION':
            currentEvent.description = value;
            break;
          case 'LOCATION':
            currentEvent.location = value;
            break;
          case 'DTSTART':
            currentEvent.startDate = parseICSDate(value);
            break;
          case 'DTEND':
            currentEvent.endDate = parseICSDate(value);
            break;
        }
      }
    }
  }

  return events;
}

/**
 * Fetch and parse ICS calendar from URL
 */
export async function fetchCalendarEvents(
  icsUrl: string,
  options: { limit?: number; futureOnly?: boolean } = {}
): Promise<CalendarEvent[]> {
  const { limit = 10, futureOnly = true } = options;

  try {
    const response = await fetch(icsUrl);

    if (!response.ok) {
      console.error(`Failed to fetch calendar: ${response.status}`);
      return [];
    }

    const icsContent = await response.text();
    let events = parseICS(icsContent);

    // Filter to future events only
    if (futureOnly) {
      const now = new Date();
      events = events.filter(event => event.startDate >= now);
    }

    // Sort by start date (ascending)
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Limit results
    if (limit > 0) {
      events = events.slice(0, limit);
    }

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
