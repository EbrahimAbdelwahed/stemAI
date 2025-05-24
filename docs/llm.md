# STEM AI Assistant LLM Development Guide

This document provides guidelines and information for developers working on the STEM AI Assistant project. It covers setting up the development environment, understanding the codebase architecture, and following best practices for feature development.

## Table of Contents

1.  [Running the Development Environment](#running-the-development-environment)
2.  [Useful Commands](#useful-commands)
3.  [Codebase Architecture](#codebase-architecture)
    *   [Frontend (Next.js & React)](#frontend-nextjs--react)
    *   [Backend (Next.js API Routes)](#backend-nextjs-api-routes)
    *   [AI Integration (Vercel AI SDK)](#ai-integration-vercel-ai-sdk)
    *   [Database (Drizzle ORM & PostgreSQL)](#database-drizzle-orm--postgresql)
    *   [Styling (Tailwind CSS)](#styling-tailwind-css)
    *   [Testing & Test Files](#testing--test-files)
        *   [Test Files & Documentation](#test-files--documentation)
            *   [Unit Tests](#unit-tests)
            *   [Integration Tests](#integration-tests) 
            *   [End-to-End Tests](#end-to-end-tests)
            *   [Test Utilities](#test-utilities)
            *   [Test Documentation](#test-documentation)
            *   [Implementation Summaries](#implementation-summaries)
            *   [Test Run Guides](#test-run-guides)
4.  [Development Best Practices](#development-best-practices)
    *   [Modular Development](#modular-development)
    *   [Version Control (Git & GitHub)](#version-control-git--github)
    *   [Code Style and Linting](#code-style-and-linting)
    *   [Testing](#testing)
5.  [Using External Services & Tools](#using-external-services--tools)
    *   [Puppeteer](#puppeteer)
    *   [GitHub](#github)

## 1. Running the Development Environment

To run the STEM AI Assistant application in a development environment, follow these steps:

*YOU ARE ON A WINDOWS MACHINE WITH CONSTRAINED RESOURCES*

1.  **Navigate to the project directory:**
    ```bash
    cd stemAI
    ```
2.  **Install dependencies:**
    If you haven't already, or if dependencies have changed, install them using npm:
    ```bash
    npm install
    ```
3.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    This command starts the development server, typically on `http://localhost:3000`. The application will automatically reload if you make changes to the code.

## 2. Useful Commands

The `package.json` file in the `stemAI` directory contains several scripts for managing the application:

*   **`npm run dev`**: Starts the Next.js development server.
*   **`npm run build`**: Builds the application for production deployment. This creates an optimized version of your application in the `.next` folder.
*   **`npm run start`**: Starts a Next.js production server. This command should be used after building the application with `npm run build`.
*   **`npm run lint`**: Runs ESLint to analyze the code for potential errors and style issues according to the configured rules. It's highly recommended to run this command before committing changes.

## 3. Codebase Architecture

The STEM AI Assistant is built using a modern web stack:

### Frontend (Next.js & React)

*   **Next.js**: A React framework for building server-side rendered (SSR) and statically generated (SSG) web applications. It provides features like routing, image optimization, and API routes. We primarily use the App Router.
    *   **Pages and Layouts**: Found in `stemAI/app/`. Each directory typically corresponds to a route. `page.tsx` defines the UI for a route, and `layout.tsx` defines a shared UI structure.
    *   **Components**: Reusable UI elements are located in `stemAI/components/`.
*   **React**: A JavaScript library for building user interfaces. We use functional components and hooks.
*   **TypeScript**: Adds static typing to JavaScript, helping to catch errors early and improve code maintainability.

### Backend (Next.js API Routes)

*   Next.js API routes, located in `stemAI/app/api/`, allow us to build backend an API directly within our Next.js application.
*   These routes are used for handling tasks like:
    *   Interacting with AI models.
    *   Database operations.
    *   Handling form submissions.

### AI Integration (Vercel AI SDK)

*   The Vercel AI SDK is used to integrate Large Language Models (LLMs) like OpenAI, Google Gemini, and Anthropic models into the application.
*   It provides helpful utilities for streaming responses, managing chat history, and tool usage.
*   Core AI logic and model interaction can be found in `stemAI/lib/ai/`.

### Database (Drizzle ORM & PostgreSQL)

*   **Drizzle ORM**: A TypeScript ORM used for interacting with the PostgreSQL database. It provides a type-safe way to query and manipulate data.
    *   Schema definitions are typically in `stemAI/lib/db/schema.ts`.
    *   Database client and connection logic are in `stemAI/lib/db/index.ts`.
*   **PostgreSQL**: A powerful open-source relational database. We use it to store application data, including user information, chat history, and embedded documents for RAG.
*   **pgvector**: A PostgreSQL extension for vector similarity search, crucial for the RAG (Retrieval Augmented Generation) functionality.

### Styling (Tailwind CSS)

*   Tailwind CSS is a utility-first CSS framework used for styling the application.
*   It allows for rapid UI development by composing utility classes directly in the markup.
*   The Tailwind configuration is in `stemAI/tailwind.config.js`.

## 4. Development Best Practices

### Modular Development

*   **Single Responsibility Principle**: Components, functions, and modules should ideally have one primary responsibility.
*   **Reusable Components**: Create generic, reusable React components for UI elements that appear in multiple places.
*   **Clear Separation of Concerns**:
    *   UI logic in React components (`.tsx` files).
    *   API/backend logic in API routes (`stemAI/app/api/**/route.ts`).
    *   Core business logic, AI interactions, and database operations in `stemAI/lib/` subdirectories (e.g., `lib/ai/`, `lib/db/`).
*   **Feature Folders**: For larger features, consider grouping related files (components, API routes, library functions) into their own directories.

### Version Control (Git & GitHub)

*   **Branching Strategy**:
    *   Create a new branch for each new feature or bugfix (e.g., `feature/new-chat-ui`, `fix/login-bug`).
    *   Do not commit directly to `main` or `develop` (if used).
*   **Commit Messages**: Write clear, concise, and descriptive commit messages. Follow conventional commit formats if possible (e.g., `feat: add dark mode toggle`, `fix: resolve issue with RAG search`).
*   **Pull Requests (PRs)**:
    *   Push your feature branch to GitHub and open a Pull Request to merge into the main development branch.
    *   Ensure your PR description clearly explains the changes and why they were made.
    *   Request reviews from other team members.
    *   Ensure all checks (linting, tests) pass before merging.
*   **Regular Pulls**: Pull the latest changes from the remote repository frequently to avoid merge conflicts: `git pull origin <branch-name>`.

### Code Style and Linting

*   **ESLint & Prettier**: The project should be configured with ESLint for static analysis and Prettier for code formatting.
*   **Run Linter**: Always run `npm run lint` before committing your changes to catch and fix issues.
*   **Consistent Formatting**: Adhere to the established code style. If Prettier is set up, it should handle most formatting automatically on save or via a pre-commit hook.

### Testing

*   **Unit Tests**: Write unit tests for individual functions and components, especially for critical logic in `lib/` and complex UI components.
*   **Integration Tests**: Test the interaction between different parts of the application (e.g., frontend component calling an API route that interacts with the database).
*   **End-to-End (E2E) Tests**: (Future consideration) Simulate user flows through the entire application.

## 5. Using External Services & Tools

### Puppeteer

Puppeteer is a Node.js library that provides a high-level API to control headless Chrome or Chromium. It can be used for:

*   **Web Scraping**: Extracting data from websites for RAG or other purposes.
*   **Automated Testing**: Performing E2E tests of the application's UI.
*   **Generating PDFs or Screenshots**: Capturing web pages.

**Instructions for STEM AI Assistant (Example Scenario: Web Scraping for RAG):**

1.  **Installation (if not already a project dependency for a specific microservice/script):**
    ```bash
    npm install puppeteer
    ```
    *Note: Puppeteer downloads a version of Chromium, which can be large. Consider if it's needed in the main application bundle or as part of a separate data ingestion script/service. THE INSTALLATION OF THE SERVER WILL BE HANDLED BY CURSOR. COMMAND TO RUN PUPPETEER MCP: npx -y @modelcontextprotocol/server-puppeteer*

2.  **Usage in a Script (e.g., a script in `Grok-STEM/data_pipeline/scripts/`):**

    ```typescript
    // Example: scripts/scrape-documentation.ts
    import puppeteer from 'puppeteer';
    import fs from 'fs/promises';

    async function scrapeWebsite(url: string): Promise<string> {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Example: Extract main content text
      // This selector will VARY GREATLY depending on the target website.
      const content = await page.evaluate(() => {
        // Adjust the selector to target the main content area of the website
        const mainContentElement = document.querySelector('article') || document.body;
        return mainContentElement.innerText;
      });

      await browser.close();
      return content;
    }

    async function main() {
      const targetUrl = 'https://example.com/some-documentation-page'; // Replace with actual URL
      try {
        console.log(`Scraping ${targetUrl}...`);
        const textContent = await scrapeWebsite(targetUrl);
        // Process and save the textContent for RAG embedding
        // e.g., save to a file, then process with embedding scripts
        await fs.writeFile('scraped_content.txt', textContent);
        console.log('Content scraped and saved to scraped_content.txt');
        // Further steps: Chunk the text, generate embeddings, store in PostgreSQL/pgvector
      } catch (error) {
        console.error('Error during scraping:', error);
      }
    }

    main();
    ```

3.  **Running the script:**
    ```bash
    npx ts-node path/to/your/script.ts
    ```
    Or compile it first with `tsc` and then run the JavaScript output with `node`.

**Considerations for Puppeteer:**
*   **Dynamic Content**: Puppeteer is excellent for sites that heavily rely on JavaScript to render content.
*   **Rate Limiting/Blocking**: Be respectful of website terms of service. Implement delays and use appropriate headers to avoid being blocked.
*   **Error Handling**: Robust error handling is crucial for web scraping.
*   **Selectors**: CSS selectors for extracting data can be brittle and may break if the website structure changes.

### GitHub

GitHub is used for version control hosting, collaboration, and project management.

**Guidelines for STEM AI Assistant:**

*   **Repository**: The primary codebase is hosted on GitHub.
*   **Branching and Merging**: Follow the branching strategy outlined in the [Version Control](#version-control-git--github) section. All changes should be merged via Pull Requests.
*   **Issue Tracking**: Use GitHub Issues to track bugs, feature requests, and tasks.
    *   Assign issues to team members.
    *   Use labels to categorize issues (e.g., `bug`, `feature`, `documentation`, `ui`, `backend`).
    *   Reference issues in commit messages and PRs (e.g., `fix: resolve login error (closes #123)`).
*   **Code Reviews**: Actively participate in code reviews. Provide constructive feedback and ensure code quality before merging.
*   **GitHub Actions (CI/CD)**: (Future consideration) GitHub Actions can be set up for:
    *   **Continuous Integration (CI)**: Automatically running linters, tests, and builds on every push or PR.
    *   **Continuous Deployment (CD)**: Automatically deploying the application to staging or production environments after successful builds and tests.
*   **Project Boards**: Use GitHub Project boards (Kanban style) to visualize and manage the workflow of tasks and features.
*   **GitHub Model Context Protocol (MCP) Server**: The project uses the GitHub MCP server for enhanced AI context awareness:
    *   **Configuration**: The MCP server is configured in `.cursor/mcp.json`:
        ```json
        {
          "mcpServers": {
            "github": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-github"],
              "env": {
                "GITHUB_PERSONAL_ACCESS_TOKEN": "${{ inputs.github_token }}"
              }
            }
          }
        }
        ```
    *   **Purpose**: The GitHub MCP server enables:
        *   Real-time access to repository content during AI interactions
        *   Contextual awareness of code structure and history
        *   Improved code suggestions based on repository patterns
    *   **Setup**:
        1.  Create a GitHub Personal Access Token with appropriate permissions
        2.  Configure the token in the MCP server environment
        3.  The server will automatically provide repository context to AI interactions
    *   **Benefits**:
        *   More accurate and context-aware AI assistance
        *   Better understanding of project-specific patterns and conventions
        *   Seamless integration with existing GitHub workflows


    *THE INSTALLATION OF THE SERVER WILL BE HANDLED BY CURSOR. COMMAND TO RUN GITHUB MCP: npx -y @modelcontextprotocol/server-github*


This document serves as a starting point. As the project evolves, please contribute to keeping it up-to-date. 