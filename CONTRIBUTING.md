# Contributing to JobPrep AI

Thank you for your interest in contributing to JobPrep AI! We appreciate your help in making this project better. This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to contact@aliammari.com.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Error messages** or logs

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and why it would be useful
- **Possible implementation** approach (optional)
- **Examples** from other projects (optional)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues for beginners
- `help wanted` - Issues needing assistance
- `bug` - Bug fixes
- `enhancement` - New features

### Pull Requests

- Fill in the pull request template
- Follow the coding standards
- Include tests for new features
- Update documentation as needed
- Follow the commit message conventions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or pnpm
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/JobPrep.git
cd JobPrep
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/aliammari1/JobPrep.git
```

### Install Dependencies

```bash
# Install project dependencies
npm install

# Or using pnpm
pnpm install
```

### Set Up Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your API keys and configuration
# See README.md for required environment variables
```

### Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database with test data
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm test

# Run build
npm run build
```

### 4. Commit Your Changes

Follow the commit message conventions (see below).

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring (neither fixes a bug nor adds a feature)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build, etc.)
- `ci:` - CI/CD changes

### Scope (Optional)

The scope could be anything specifying the place of the commit change:
- `api` - API changes
- `ui` - UI components
- `cv` - CV builder
- `interviews` - Interview features
- `auth` - Authentication
- `db` - Database

### Examples

```bash
feat(interviews): add real-time video support
fix(cv): resolve template rendering issue
docs: update installation instructions
refactor(api): simplify error handling
test(challenges): add unit tests for code execution
chore: update dependencies
```

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the commit body or footer:

```bash
feat(api): change interview API response format

BREAKING CHANGE: Interview API now returns nested objects instead of flat structure
```

## 🔀 Pull Request Process

### Before Submitting

1. **Update from upstream** to avoid conflicts:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Test thoroughly**:
   - Run linter and fix issues
   - Run type checking
   - Run all tests
   - Test manually in the browser

3. **Update documentation**:
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update API documentation

### PR Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

### PR Title Format

Use the same format as commit messages:

```
feat(interviews): add real-time video support
```

### PR Description

Use the pull request template and include:

- **Summary** of changes
- **Motivation** and context
- **Type of change** (bug fix, feature, etc.)
- **Testing** performed
- **Screenshots** (if UI changes)
- **Related issues** (closes #123)

### Review Process

1. At least one maintainer must approve the PR
2. All CI checks must pass
3. Conflicts must be resolved
4. Code must follow standards
5. Tests must pass

### After Approval

Once approved and merged:

1. Delete your branch:

```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

2. Update your local repository:

```bash
git checkout main
git pull upstream main
```

## 💻 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks (React)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Keep functions small and focused

### React Components

```typescript
// ✅ Good
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function InterviewCard({ title, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2>{title}</h2>
      {/* ... */}
    </Card>
  );
}
```

### File Organization

```
component/
├── ComponentName.tsx         # Component logic
├── ComponentName.test.tsx    # Tests
├── ComponentName.stories.tsx # Storybook (if applicable)
└── index.ts                  # Re-export
```

### Naming Conventions

- **Components**: PascalCase (`InterviewCard.tsx`)
- **Files**: camelCase or kebab-case (`userService.ts`, `api-client.ts`)
- **Variables/Functions**: camelCase (`getUserData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)

### Comments

- Use JSDoc for functions and components
- Explain "why" not "what"
- Avoid obvious comments

```typescript
/**
 * Generates AI interview questions based on job description
 * @param jobDescription - The job posting text
 * @param difficulty - Question difficulty level
 * @returns Array of generated questions
 */
export async function generateQuestions(
  jobDescription: string,
  difficulty: Difficulty
): Promise<Question[]> {
  // Use GPT-4 for hard questions to ensure quality
  const model = difficulty === 'HARD' ? 'gpt-4' : 'gpt-3.5-turbo';
  // ...
}
```

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Use Jest and React Testing Library
- Aim for >80% code coverage
- Test edge cases and error handling

```typescript
describe('InterviewService', () => {
  it('should generate questions for given job description', async () => {
    const questions = await generateQuestions('Software Engineer', 'MEDIUM');
    expect(questions).toHaveLength(5);
    expect(questions[0]).toHaveProperty('question');
  });

  it('should handle API errors gracefully', async () => {
    mockApi.mockRejectedValueOnce(new Error('API Error'));
    await expect(generateQuestions('Invalid', 'EASY')).rejects.toThrow();
  });
});
```

### Integration Tests

- Test feature workflows end-to-end
- Use Playwright for browser automation
- Test critical user journeys

### Manual Testing

Before submitting PR, manually test:
- Happy path scenarios
- Error cases
- Edge cases
- Mobile responsiveness
- Different browsers

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to public functions
- Document complex algorithms
- Explain non-obvious design decisions

### README Updates

Update README.md when:
- Adding new features
- Changing setup/installation steps
- Modifying API endpoints
- Updating dependencies

### API Documentation

Document API endpoints in comments:

```typescript
/**
 * POST /api/interviews
 *
 * Creates a new mock interview session
 *
 * @body {
 *   jobTitle: string;
 *   jobDescription: string;
 *   difficulty: 'EASY' | 'MEDIUM' | 'HARD';
 *   aiProvider: 'GEMINI' | 'GPT4' | 'CLAUDE';
 * }
 *
 * @returns {
 *   id: string;
 *   questions: Question[];
 *   roomId: string;
 * }
 */
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority

- 🐛 Bug fixes
- 📱 Mobile responsiveness improvements
- ♿ Accessibility enhancements
- 🌍 Internationalization (i18n)
- 🧪 Test coverage improvements

### Features

- 🎓 New interview question types
- 📄 Additional CV templates
- 💻 More programming languages for challenges
- 📊 Enhanced analytics dashboards
- 🎮 Gamification features

### Infrastructure

- ⚡ Performance optimizations
- 🔒 Security improvements
- 📝 Documentation improvements
- 🎨 UI/UX enhancements

## 💬 Communication

### Getting Help

- 💬 GitHub Discussions - Ask questions, share ideas
- 🐛 GitHub Issues - Report bugs, request features
- 📧 Email - contact@aliammari.com (for sensitive matters)

### Stay Updated

- ⭐ Star the repository to get notified
- 👀 Watch the repository for updates
- 🐦 Follow [@aliammari1](https://twitter.com/aliammari1) on Twitter

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).

## 🙏 Recognition

All contributors will be recognized in our README and release notes.

Thank you for contributing to JobPrep AI! 🚀
