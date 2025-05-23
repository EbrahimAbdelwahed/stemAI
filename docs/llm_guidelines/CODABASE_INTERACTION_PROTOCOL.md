---
version: 1.0
status: draft
maintainer: AI Core Team
references:
  - ROLE_DEFINITION.md
---
<!--
Document: CODABASE_INTERACTION_PROTOCOL.md
Purpose: Defines access patterns, request handling, and data flow for LLM interactions with the stemAI codebase.
Version: 1.0
Last Updated: {{TODAY_DATE}}
-->

# Codebase Interaction Protocol for StemAI-Copilot

This document outlines the rules and procedures for any LLM when interacting with the STEM AI Assistant codebase. It complements the [ROLE_DEFINITION.md](./ROLE_DEFINITION.md).

## 1. Access Scopes and Permissions

Access to the codebase is tiered to ensure safety and proper operation. All file operations must be confirmed and, where applicable, checksum validated if specified by the task.

| Permission Level | File Path Patterns                                       | Allowed Operations                                                                 | Notes                                                                                                |
|-------------------|----------------------------------------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **Read-Only**     | `/docs/**`                                               | File reading, content analysis, documentation generation (output to new files/strings) | For understanding project documentation, existing guidelines.                                        |
|                   | `/lib/ai/tools/*.ts`                                   | File reading, understanding tool signatures and functionality                      | To inform tool usage and generation of new tools.                                                    |
|                   | `/lib/db/schema.ts`                                      | File reading, understanding database schema                                        | For generating Drizzle ORM queries and advising on schema modifications.                             |
|                   | `/components/visualizations/**`                          | File reading, understanding existing visualization components                      | To inform generation/modification of data visualization UIs.                                         |
|                   | `/package.json`, `tsconfig.json`, `next.config.js`       | File reading                                                                       | To understand project setup, dependencies, and build configurations. Modification is restricted.     |
|                   | `**/*.md` (excluding `/docs/llm_guidelines/**` for self)  | File reading                                                                       | General markdown file access for context.                                                            |
| **Read-Write**    | `/app/**` (e.g., `/app/chat/page.tsx`, `/app/api/chat/route.ts`) | File reading, writing, modification, creation                                    | Core application logic, UI components, API routes. Changes require adherence to planning.          |
|                   | `/components/**` (excluding `/components/visualizations/**`) | File reading, writing, modification, creation                                    | General UI components.                                                                               |
|                   | `/lib/**` (excluding `/lib/ai/tools/*.ts`, `/lib/db/schema.ts`) | File reading, writing, modification, creation                                    | Utility functions, non-schema DB logic, custom AI logic.                                             |
|                   | `/public/**`                                             | File reading, writing, modification, creation                                    | Static assets.                                                                                       |
|                   | `/docs/**` (for new .md files or approved edits)         | File writing, creation (for new documentation)                                   | Generating new project documentation.                                                                |
| **Write-Temporary** | `/tmp/**` or a designated sandbox environment          | File reading, writing, execution (sandboxed)                                       | For temporary file operations, testing snippets, or sandboxed code execution if available.         |
| **Restricted**    | `/.next/**`, `/node_modules/**`, `/.git/**`              | No direct read/write access                                                        | Managed by Next.js, package manager, and Git respectively. Indirect interaction via approved tools/commands. |

## 2. Request Type Identification Flow

Upon receiving a user request, `StemAI-Copilot` will categorize it to determine the appropriate workflow and necessary precautions. All requests should follow the **Understand-Plan-Act** paradigm.

1.  **Understand the Request:**
    *   Clarify ambiguities with the user.
    *   Identify the core goal and affected codebase areas.

2.  **Categorize Request Type:**
    *   **New Feature Implementation:** (e.g., "Add a Grok model option to the chat")
        *   Requires detailed planning, potentially multiple file changes (UI, API, lib).
        *   High need for human review of the plan.
    *   **Component Creation/Modification:** (e.g., "Create a new Card component for search results")
        *   Focus on React, TypeScript, Tailwind CSS.
        *   Requires clear prop definitions and UI/UX considerations.
    *   **API Endpoint Creation/Modification:** (e.g., "Update `/api/documents` to support PDF metadata extraction")
        *   Involves Vercel AI SDK, Drizzle ORM, request/response validation.
    *   **Database Schema Change / Migration Scripting:** (e.g., "Add an 'author' field to the 'documents' table")
        *   Impacts `lib/db/schema.ts` and requires careful consideration of data integrity and migration paths.
    *   **Tool Development / Integration:** (e.g., "Create a new tool for chemical equation balancing")
        *   Involves `lib/ai/tools/` and adherence to the [TOOL_USAGE_GUIDELINES.md](./TOOL_USAGE_GUIDELINES.md).
    *   **Bug Fix:** (e.g., "The chat input is clearing unexpectedly on model switch")
        *   Requires careful debugging and targeted changes.
    *   **Code Refactoring:** (e.g., "Refactor the `ChatMessages.tsx` component for better readability")
        *   Focus on improving code quality without altering functionality. Plan should specify scope.
    *   **Documentation Task:** (e.g., "Write docs for the new `/api/visualize` endpoint")
        *   Output markdown to the `/docs` directory or as specified.
    *   **Codebase Query/Explanation:** (e.g., "How does the RAG system retrieve context?")
        *   Primarily involves reading files and explaining concepts.

3.  **Plan the Solution:**
    *   Outline steps, affected files, and high-level logic.
    *   Present the plan to the user for approval, especially for complex types.

4.  **Act (Implement):**
    *   Execute the plan, making code changes as per access scopes.
    *   Provide clear explanations of changes.

## 3. Human-in-the-Loop (HITL) Checkpoints

Mandatory HITL checkpoints are integrated to ensure safety and alignment:

*   **Before executing any plan involving multiple file modifications or significant architectural changes.**
*   **Before committing any changes to version control (if such capability is granted and used).**
*   **When a request is ambiguous and clarification is needed.**
*   **If a proposed action might have security implications or deviate from established best practices.**
*   **Upon encountering an unexpected error or roadblock during implementation.**

`StemAI-Copilot` must pause and await explicit user confirmation at these junctures. 