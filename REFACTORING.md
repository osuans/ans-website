# Refactoring Plan: Clean Architecture Implementation

## Overview
This document outlines the refactoring plan for the ANS Website project to follow clean architecture, SOLID principles, and modern software engineering best practices.

## Current Issues Identified

### Code Duplication (Critical)
1. **`createSlug()` function** - duplicated 4 times across API routes
2. **`extractImageFolder()` function** - duplicated 2 times
3. **`formatDateForInput()` function** - duplicated 2 times
4. **Frontmatter building pattern** - repeated 4 times with identical logic
5. **Error response pattern** - duplicated 6+ times across all API routes
6. **SVG icons** - calendar and location icons duplicated 4+ times
7. **Form styling patterns** - Tailwind classes repeated everywhere

### Architectural Issues
1. **No separation of concerns** - API routes handle validation, business logic, and infrastructure
2. **No abstraction layer** for GitHub API - direct calls scattered everywhere
3. **Mixed responsibilities** - single functions doing validation, transformation, and I/O
4. **No dependency injection** - tight coupling to GitHub implementation
5. **No error handling strategy** - inconsistent error responses
6. **Configuration scattered** - environment variables used directly throughout

### Violations of SOLID Principles
1. **Single Responsibility** - API routes do too much (validation, business logic, I/O)
2. **Open/Closed** - Hard to extend (e.g., add new storage backends)
3. **Liskov Substitution** - No interfaces, can't substitute implementations
4. **Interface Segregation** - Not applicable (no interfaces exist)
5. **Dependency Inversion** - High-level modules depend on low-level (GitHub API)

---

## Refactoring Strategy

### Phase 1: Foundation (Constants & Utilities)
**Goal**: Eliminate code duplication, centralize utilities

**Files to Create**:
- `src/constants/index.ts` - Application constants
- `src/constants/paths.ts` - File paths and URL patterns
- `src/constants/messages.ts` - Error messages and user-facing text
- `src/constants/styles.ts` - Reusable Tailwind class combinations
- `src/utils/slugify.ts` - Centralized slug generation
- `src/utils/pathHelpers.ts` - Path manipulation utilities
- `src/utils/frontmatter.ts` - YAML frontmatter builders
- `src/utils/apiHelpers.ts` - HTTP response helpers
- `src/utils/stringHelpers.ts` - String manipulation utilities
- Convert `src/utils/dateUtils.js` → `dateUtils.ts`

**Impact**: Eliminates ~40% code duplication

---

### Phase 2: Domain Layer (Entities & Validation)
**Goal**: Define business entities and rules

**Files to Create**:
- `src/core/entities/types.ts` - Shared types
- `src/core/entities/Event.ts` - Event entity with business logic
- `src/core/entities/Scholarship.ts` - Scholarship entity
- `src/core/validation/event.schema.ts` - Zod schemas for events
- `src/core/validation/scholarship.schema.ts` - Zod schemas for scholarships

**Principles Applied**:
- **Single Responsibility**: Each entity manages its own validation and invariants
- **Domain-Driven Design**: Business logic lives in domain entities

---

### Phase 3: Infrastructure Layer (External Systems)
**Goal**: Abstract external dependencies (GitHub API)

**Files to Create**:
- `src/core/interfaces/IContentRepository.ts` - Repository interface
- `src/core/interfaces/IFileStorage.ts` - File storage interface
- `src/infrastructure/config/github.config.ts` - GitHub configuration
- `src/infrastructure/config/app.config.ts` - Application configuration
- `src/lib/clients/GitHubClient.ts` - GitHub API client with retry logic
- `src/lib/errors/AppError.ts` - Base application error
- `src/lib/errors/ValidationError.ts` - Validation error class
- `src/lib/errors/NotFoundError.ts` - Not found error class
- `src/infrastructure/repositories/GitHubRepository.ts` - GitHub repository implementation
- `src/infrastructure/storage/GitHubStorage.ts` - GitHub file storage implementation

**Principles Applied**:
- **Dependency Inversion**: High-level modules depend on abstractions (interfaces)
- **Open/Closed**: Easy to add new storage backends (S3, local filesystem)
- **Interface Segregation**: Separate interfaces for different concerns

---

### Phase 4: Application Layer (Business Logic)
**Goal**: Encapsulate use cases and business services

**Files to Create**:
- `src/application/services/EventService.ts` - Event business logic
- `src/application/services/ScholarshipService.ts` - Scholarship business logic
- `src/application/services/ContentService.ts` - Shared content operations
- `src/application/use-cases/events/CreateEvent.ts` - Create event use case
- `src/application/use-cases/events/UpdateEvent.ts` - Update event use case
- `src/application/use-cases/events/DeleteEvent.ts` - Delete event use case
- `src/application/use-cases/scholarships/CreateScholarship.ts`
- `src/application/use-cases/scholarships/UpdateScholarship.ts`
- `src/application/use-cases/scholarships/DeleteScholarship.ts`

**Principles Applied**:
- **Single Responsibility**: Each use case does one thing
- **Command Pattern**: Use cases are commands with execute() method
- **Separation of Concerns**: Business logic separate from infrastructure

---

### Phase 5: Presentation Layer (API Routes)
**Goal**: Thin API routes that delegate to use cases

**Files to Refactor**:
- `src/pages/api/events/create.ts` - Thin wrapper around CreateEvent use case
- `src/pages/api/events/edit.ts` - Thin wrapper around UpdateEvent use case
- `src/pages/api/events/delete.ts` - Thin wrapper around DeleteEvent use case
- `src/pages/api/scholarships/create.ts` - Thin wrapper around CreateScholarship
- `src/pages/api/scholarships/edit.ts` - Thin wrapper around UpdateScholarship
- `src/pages/api/scholarships/delete.ts` - Thin wrapper around DeleteScholarship

**Target**: Each API route < 30 lines, only handles:
1. Parse request
2. Validate input (using Zod)
3. Call use case
4. Return response

**Principles Applied**:
- **Single Responsibility**: API routes only handle HTTP concerns
- **Dependency Injection**: Use cases injected with dependencies

---

### Phase 6: UI Components
**Goal**: Eliminate SVG duplication, create reusable components

**Files to Create**:
- `src/components/ui/Icon.astro` - Centralized icon component
- `src/components/ui/Input.astro` - Form input component
- `src/components/ui/Form.astro` - Form wrapper with consistent styling

**Files to Refactor**:
- Remove inline SVGs from all pages
- Use Icon component instead

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  (API Routes, Pages, Components)                        │
│                                                          │
│  - Thin API routes delegate to use cases                │
│  - Pages query content collections                      │
│  - Components are purely presentational                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (Use Cases, Services)                                  │
│                                                          │
│  - Business logic orchestration                         │
│  - Transaction coordination                             │
│  - Depends on domain interfaces                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                         │
│  (Entities, Validation, Interfaces)                     │
│                                                          │
│  - Business entities and rules                          │
│  - Pure business logic (no I/O)                         │
│  - Defines interfaces for infrastructure                │
└─────────────────────────────────────────────────────────┘
                      ▲
                      │
┌─────────────────────┴───────────────────────────────────┐
│                 Infrastructure Layer                    │
│  (GitHub Client, Repositories, Storage)                 │
│                                                          │
│  - Implements domain interfaces                         │
│  - External API calls (GitHub)                          │
│  - File system operations                               │
│  - Configuration management                             │
└─────────────────────────────────────────────────────────┘
```

---

## Benefits of This Architecture

### 1. **Testability**
- Domain logic can be tested without GitHub API
- Use cases can be tested with mock repositories
- API routes can be tested with mock use cases

### 2. **Maintainability**
- Clear separation of concerns
- Single point of control for changes
- Easy to locate and fix bugs

### 3. **Scalability**
- Easy to add new content types (following established patterns)
- Can swap GitHub for S3/Database without changing business logic
- Can add caching, queuing, webhooks easily

### 4. **Developer Experience**
- Clear conventions for where code belongs
- Self-documenting architecture
- Reduced cognitive load

### 5. **Performance**
- Can add caching at repository layer
- Can batch operations easily
- Can add background jobs for heavy operations

---

## Implementation Order

1. ✅ Create constants and utilities (eliminates duplication immediately)
2. ✅ Create domain entities and validation (establishes business rules)
3. ✅ Create infrastructure abstractions (decouples from GitHub)
4. ✅ Create application services and use cases (encapsulates business logic)
5. ✅ Refactor API routes to use use cases (thin presentation layer)
6. ✅ Refactor UI components (eliminate SVG duplication)
7. ✅ Update tests and documentation

---

## Conventions & Standards

### File Naming
- **PascalCase** for classes and components: `EventService.ts`, `Icon.astro`
- **camelCase** for utilities: `slugify.ts`, `pathHelpers.ts`
- **kebab-case** for routes: `create.ts`, `edit.ts`

### Code Organization
- **One class per file** (max 200 lines)
- **One function per use case** (max 50 lines)
- **Pure functions** in utilities (no side effects)

### Error Handling
- **Custom error classes** extending AppError
- **Consistent error responses** from API routes
- **Error logging** at application boundary

### TypeScript
- **Strict mode** enabled
- **Explicit return types** for all functions
- **Interface over type** for public contracts
- **No any** - use unknown and type guards

### Documentation
- **JSDoc** for public functions
- **Inline comments** for complex logic only
- **README** in each major directory

---

## Success Metrics

| Metric | Before | Target | Impact |
|--------|--------|--------|--------|
| Code Duplication | ~40% | < 5% | 🔴 → 🟢 |
| Average File Length | 120 lines | < 80 lines | 🟡 → 🟢 |
| Cyclomatic Complexity | High | Low | 🔴 → 🟢 |
| Test Coverage | 0% | > 80% | 🔴 → 🟢 |
| Build Time | Baseline | ±0% | 🟢 |
| Bundle Size | Baseline | ±0% | 🟢 |

---

## Next Steps

1. Review and approve this plan
2. Create a feature branch for refactoring
3. Implement Phase 1 (constants & utilities)
4. Test each phase before moving to next
5. Update documentation
6. Merge and deploy

---

*Last Updated: 2025-11-25*
