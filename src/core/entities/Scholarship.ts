/**
 * Scholarship Domain Entity
 *
 * Represents a scholarship with business logic and invariants.
 * Following Domain-Driven Design and Single Responsibility Principle.
 *
 * @module core/entities/Scholarship
 */

import { slugify, isValidSlug } from '../../utils/slugify';

/**
 * Scholarship entity data
 */
export interface ScholarshipData {
  name: string;
  type: 'scholarship' | 'fellowship' | 'internship';
  amount: number;
  frequency: 'One-time' | 'Annual' | 'Semester' | 'Monthly';
  deadline: Date;
  description: string;
  eligibility: string[];
}

/**
 * Scholarship Entity
 *
 * Domain entity representing a scholarship with business rules.
 */
export class Scholarship {
  private constructor(
    public readonly slug: string,
    public readonly data: ScholarshipData
  ) {}

  /**
   * Factory method to create a Scholarship instance
   *
   * @param name - Scholarship name
   * @param data - Scholarship data
   * @returns Scholarship instance
   * @throws Error if validation fails
   */
  static create(name: string, data: Omit<ScholarshipData, 'name'>): Scholarship {
    const slug = slugify(name);

    if (!isValidSlug(slug)) {
      throw new Error('Invalid name: cannot generate valid slug');
    }

    const scholarshipData: ScholarshipData = {
      name,
      ...data,
    };

    // Validate business rules
    Scholarship.validateScholarshipData(scholarshipData);

    return new Scholarship(slug, scholarshipData);
  }

  /**
   * Validates scholarship data against business rules
   *
   * @param data - Scholarship data to validate
   * @throws Error if validation fails
   */
  private static validateScholarshipData(data: ScholarshipData): void {
    // Name validation
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Scholarship name must be at least 3 characters long');
    }

    if (data.name.length > 200) {
      throw new Error('Scholarship name must not exceed 200 characters');
    }

    // Amount validation
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Scholarship amount must be a positive number');
    }

    if (data.amount > 1000000) {
      throw new Error('Scholarship amount seems unrealistically high');
    }

    // Frequency validation
    const validFrequencies = ['One-time', 'Annual', 'Semester', 'Monthly'];
    if (!validFrequencies.includes(data.frequency)) {
      throw new Error(`Frequency must be one of: ${validFrequencies.join(', ')}`);
    }

    // Deadline validation
    if (!(data.deadline instanceof Date) || isNaN(data.deadline.getTime())) {
      throw new Error('Invalid deadline date');
    }

    // Description validation
    if (!data.description || data.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (data.description.length > 5000) {
      throw new Error('Description must not exceed 5000 characters');
    }

    // Eligibility validation
    if (!Array.isArray(data.eligibility) || data.eligibility.length === 0) {
      throw new Error('At least one eligibility criterion is required');
    }

    for (const criterion of data.eligibility) {
      if (!criterion || criterion.trim().length === 0) {
        throw new Error('Eligibility criteria cannot be empty');
      }
    }
  }

  /**
   * Updates scholarship data
   *
   * @param updates - Partial scholarship data to update
   * @returns New Scholarship instance with updated data
   */
  update(updates: Partial<ScholarshipData>): Scholarship {
    const newData = { ...this.data, ...updates };

    Scholarship.validateScholarshipData(newData);

    return new Scholarship(this.slug, newData);
  }

  /**
   * Checks if the scholarship deadline has passed
   */
  isExpired(): boolean {
    return this.data.deadline < new Date();
  }

  /**
   * Checks if the scholarship is still accepting applications
   */
  isActive(): boolean {
    return !this.isExpired();
  }

  /**
   * Gets the number of days until the deadline
   */
  daysUntilDeadline(): number {
    const now = new Date();
    const diffMs = this.data.deadline.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets formatted amount string
   */
  getFormattedAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.data.amount);
  }

  /**
   * Converts entity to plain object for serialization
   */
  toObject(): ScholarshipData & { slug: string } {
    return {
      slug: this.slug,
      ...this.data,
    };
  }

  /**
   * Reconstructs a Scholarship from a slug and data
   * (used when loading from storage)
   */
  static fromSlug(slug: string, data: ScholarshipData): Scholarship {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug format');
    }

    Scholarship.validateScholarshipData(data);

    return new Scholarship(slug, data);
  }
}
