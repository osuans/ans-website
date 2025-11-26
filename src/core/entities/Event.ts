/**
 * Event Domain Entity
 *
 * Represents an event with business logic and invariants.
 * Following Domain-Driven Design and Single Responsibility Principle.
 *
 * @module core/entities/Event
 */

import type { ContentMetadata, ImageMetadata } from './types';
import { slugify, isValidSlug } from '../../utils/slugify';

/**
 * Event entity data
 */
export interface EventData {
  title: string;
  date: Date;
  endDate?: Date;
  time?: string;
  location: string;
  image: ImageMetadata;
  summary: string;
  tags?: string[];
  registrationLink?: string;
  registrationRequired: boolean;
  draft: boolean;
  body?: string;
}

/**
 * Event Entity
 *
 * Domain entity representing an event with business rules.
 */
export class Event {
  private constructor(
    public readonly slug: string,
    public readonly data: EventData
  ) {}

  /**
 * Factory method to create an Event instance
   *
   * @param title - Event title
   * @param data - Event data
   * @returns Event instance
   * @throws Error if validation fails
   */
  static create(title: string, data: Omit<EventData, 'title'>): Event {
    const slug = slugify(title);

    if (!isValidSlug(slug)) {
      throw new Error('Invalid title: cannot generate valid slug');
    }

    const eventData: EventData = {
      title,
      ...data,
    };

    // Validate business rules
    Event.validateEventData(eventData);

    return new Event(slug, eventData);
  }

  /**
   * Validates event data against business rules
   *
   * @param data - Event data to validate
   * @throws Error if validation fails
   */
  private static validateEventData(data: EventData): void {
    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (data.title.length > 200) {
      throw new Error('Title must not exceed 200 characters');
    }

    // Date validation
    if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
      throw new Error('Invalid event date');
    }

    // End date must be after start date
    if (data.endDate) {
      if (!(data.endDate instanceof Date) || isNaN(data.endDate.getTime())) {
        throw new Error('Invalid end date');
      }

      if (data.endDate < data.date) {
        throw new Error('End date must be after start date');
      }
    }

    // Location validation
    if (!data.location || data.location.trim().length === 0) {
      throw new Error('Location is required');
    }

    // Summary validation
    if (!data.summary || data.summary.trim().length < 10) {
      throw new Error('Summary must be at least 10 characters long');
    }

    if (data.summary.length > 500) {
      throw new Error('Summary must not exceed 500 characters');
    }

    // Image validation
    if (!data.image || !data.image.url) {
      throw new Error('Event image is required');
    }

    // Registration link validation
    if (data.registrationLink && !this.isValidUrl(data.registrationLink)) {
      throw new Error('Invalid registration link URL');
    }
  }

  /**
   * Checks if a string is a valid URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates event data
   *
   * @param updates - Partial event data to update
   * @returns New Event instance with updated data
   */
  update(updates: Partial<EventData>): Event {
    const newData = { ...this.data, ...updates };

    Event.validateEventData(newData);

    return new Event(this.slug, newData);
  }

  /**
   * Checks if the event is upcoming (not yet started)
   */
  isUpcoming(): boolean {
    return this.data.date > new Date();
  }

  /**
   * Checks if the event is past
   */
  isPast(): boolean {
    const endDate = this.data.endDate || this.data.date;
    return endDate < new Date();
  }

  /**
   * Checks if the event is currently happening
   */
  isOngoing(): boolean {
    const now = new Date();
    const endDate = this.data.endDate || this.data.date;
    return this.data.date <= now && endDate >= now;
  }

  /**
   * Checks if registration is open
   * (only for future events with registration required)
   */
  isRegistrationOpen(): boolean {
    return this.data.registrationRequired && this.isUpcoming();
  }

  /**
   * Converts entity to plain object for serialization
   */
  toObject(): EventData & { slug: string } {
    return {
      slug: this.slug,
      ...this.data,
    };
  }

  /**
   * Reconstructs an Event from a slug and data
   * (used when loading from storage)
   */
  static fromSlug(slug: string, data: EventData): Event {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug format');
    }

    Event.validateEventData(data);

    return new Event(slug, data);
  }
}
