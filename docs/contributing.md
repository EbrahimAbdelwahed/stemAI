# Contributing to STEM AI Assistant

Thank you for considering contributing to the STEM AI Assistant! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate of others' perspectives and experiences.

## How to Contribute

There are many ways to contribute to the STEM AI Assistant:

1. **Code Contributions**: Implement new features or fix bugs
2. **Documentation**: Improve or extend documentation
3. **Testing**: Test the application and report issues
4. **Ideas**: Suggest new features or improvements

## Development Setup

### Prerequisites

1. Node.js 18.x or higher
2. npm or pnpm
3. PostgreSQL with pgvector extension
4. API keys for OpenAI, xAI, and Google AI

### Local Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/stemAI.git
   cd stemAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with the following content:
   ```env
   # OpenAI API Key (required)
   OPENAI_API_KEY=your_openai_api_key

   # Google API Key (for Gemini models)
   GOOGLE_API_KEY=your_google_api_key

   # xAI API Key (required for Grok models)
   XAI_API_KEY=your_xai_api_key

   # Database URL (required)
   DATABASE_URL=postgres://username:password@localhost:5432/stemai
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser** to http://localhost:3000

## Git Workflow

We follow a standard GitHub flow for contributions:

1. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. **Make your changes** and commit them with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

3. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** against the main repository's `main` branch

## Pull Request Guidelines

When submitting a pull request:

1. **Describe your changes** in detail
2. **Reference any related issues** using GitHub's issue linking syntax (#issue-number)
3. **Include screenshots** for UI changes
4. **Update documentation** if necessary
5. **Ensure all tests pass** and add new tests for new functionality
6. **Follow the code style** of the project

## Code Style

We use ESLint and Prettier to maintain code quality and consistency:

- **Run linting**: `npm run lint`
- **Fix linting issues**: `npm run lint:fix`
- **Format code**: `npm run format`

Please ensure your code follows the existing style before submitting a pull request.

## Testing

We value well-tested code. When adding new features or fixing bugs:

1. **Write tests** that verify your changes
2. **Run existing tests** to ensure you haven't broken anything:
   ```bash
   npm run test
   ```

## Adding New Features

When adding new features:

1. **Discuss first**: Create an issue to discuss the feature before implementation
2. **Follow the architecture**: Review existing code to understand the architecture
3. **Update documentation**: Add or update documentation for your feature
4. **Consider performance**: Ensure your feature doesn't negatively impact performance

### Adding a New AI Model

To add support for a new AI model:

1. Install the required AI SDK provider package:
   ```bash
   npm install @ai-sdk/new-provider
   # or
   pnpm add @ai-sdk/new-provider
   ```

2. Update the `getModelConfig` function in `app/api/chat/route.ts`:
   ```typescript
   import { newProvider } from '@ai-sdk/new-provider';
   
   // In the getModelConfig function
   case 'new-model-id':
     return {
       model: newProvider('model-name'),
       system: `You are a helpful STEM assistant powered by New Model.
       Focus on providing accurate, educational information about science, technology, engineering, and mathematics.
       Explain concepts clearly and provide examples where appropriate.
       If you're unsure about something, acknowledge the limits of your knowledge instead of making up information.`,
     };
   ```

3. Update the `ModelSelector` component to include your new model:
   ```typescript
   // In components/ModelSelector.tsx
   const models = [
     { id: 'grok-3-mini', name: 'Grok-3-Mini Beta' },
     { id: 'gemini-2-flask', name: 'Gemini 2.0 Flash' },
     { id: 'new-model-id', name: 'New Model Display Name' },
   ];
   ```

## Reporting Bugs

When reporting bugs:

1. **Use the issue tracker**
2. **Describe the bug** in detail
3. **Provide reproduction steps**
4. **Include relevant information**:
   - Browser and OS
   - Error messages
   - Screenshots if applicable
   - Code snippets if relevant

## Feature Requests

When suggesting features:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** in detail
3. **Explain the use case** and benefits
4. **Consider implementation details** if possible

## Documentation Contributions

Documentation improvements are always welcome:

1. **Identify areas** that need better documentation
2. **Make your changes** to the appropriate markdown files in the `docs/` directory
3. **Create a pull request** with your changes

## Review Process

All submissions will be reviewed by project maintainers. The review process includes:

1. **Code review**: Code quality, style, and correctness
2. **Documentation review**: Clarity and completeness
3. **Testing**: Verification that changes work as expected
4. **Integration**: Ensuring changes fit with the overall project

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license (typically MIT).

## Questions and Support

If you have questions or need help:

1. **Check existing issues** for similar questions
2. **Create a new issue** with the "question" label
3. **Be clear and specific** about what you're trying to accomplish

Thank you for contributing to the STEM AI Assistant project! Your help makes this project better for everyone. 