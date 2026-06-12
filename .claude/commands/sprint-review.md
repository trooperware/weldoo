Analyze the full codebase for the sprint that has just closed. Your goal is to provide a global view of project health before planning the next sprint.

## Analysis Process

### Step 1: Current Architecture Map

- Describe the real project structure, not the ideal one
- Identify layers: UI, business logic, data access, infrastructure
- Detect inconsistent patterns between modules

### Step 2: Technical Debt Inventory

List technical debt accumulated in this sprint, classified by severity:

- 🔴 Critical: affects production or security
- 🟡 High: will soon affect performance or maintainability
- 🟢 Normal: future improvement

### Step 3: Scalability Analysis

With a 100k user projection, identify:

- The current #1 bottleneck
- The 3 system points most likely to fail first under load
- What must be refactored before launching beyond 10k active users

### Step 4: Test Coverage

- What percentage of critical logic has automated tests?
- Which user flows are not covered?
- Recommended testing priorities for the next sprint

### Step 5: Recommendations For Next Sprint

List prioritized technical actions, with business justification for each one.

---

## Delivery Format

# Technical Health Report - Sprint [N]

**Date**: [date]
**Global Assessment**: [🔴 Critical / 🟡 Attention required / 🟢 Healthy]

## Current Architecture

[...]

## Accumulated Technical Debt

[...]

## Top 3 Scalability Risks

[...]

## Test Coverage

[...]

## Recommendations For Sprint [N+1]

[prioritized list]
