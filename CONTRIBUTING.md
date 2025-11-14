# Contributing to ARX

Thank you for your interest in contributing to ARX! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional. We're committed to providing a welcoming environment for all contributors.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/arx.git
   cd arx
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/XplnHUB/arx.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests
```bash
# Run all tests
npm test -- --run

# Run tests in watch mode
npm test

# Run specific test file
npm test -- tests/routing.test.js

# Run benchmark tests
npm run test:benchmark
```

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format -- --check
```

### Development Server
```bash
# Start with auto-reload
npm run dev
```

## Making Changes

### Code Style
- Use consistent indentation (2 spaces)
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Use async/await instead of callbacks

### Commit Messages
Follow conventional commits format:
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(parser): add TOML parser support
fix(routing): handle wildcard routes correctly
docs(api): update response helpers documentation
test(middleware): add async middleware tests
```

### Pull Request Process

1. Update your branch with latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub
4. Fill out the PR template completely
5. Ensure all CI/CD checks pass
6. Request review from maintainers
7. Address feedback and update PR
8. Wait for approval and merge

## Adding Features

### Parser Implementation

To add a new parser:

1. Create file: `src/parsers/format.js`
2. Implement parser function with error handling
3. Add tests: `tests/parser-format.test.js`
4. Update parser dispatcher: `src/parsers/index.js`
5. Update TypeScript definitions: `index.d.ts`
6. Document in: `docs/api.md`

Example:
```javascript
// src/parsers/format.js
function parseFormat(buffer, options = {}) {
  try {
    // Parse logic
    return parsed;
  } catch (err) {
    const error = new Error(`Invalid Format: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseFormat;
```

### Response Helper Implementation

To add a response helper:

1. Add method to: `src/response/enhance.js`
2. Add tests to: `tests/response.test.js`
3. Update TypeScript definitions: `index.d.ts`
4. Document in: `docs/api.md`

Example:
```javascript
// In src/response/enhance.js
res.custom = function(data, options = {}) {
  this.setHeader('Content-Type', options.type || 'application/json');
  this.end(JSON.stringify(data));
  return this;
};
```

### Middleware Implementation

To add middleware:

1. Create file: `src/middleware/name.js`
2. Export middleware function
3. Add tests: `tests/middleware-name.test.js`
4. Document usage in: `docs/api.md`

Example:
```javascript
// src/middleware/custom.js
export default function customMiddleware(options = {}) {
  return (req, res, next) => {
    // Middleware logic
    next();
  };
}
```

## Testing Guidelines

### Test Structure
```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  let setup;

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Coverage Requirements
- Aim for >80% code coverage
- Test happy paths and error cases
- Test edge cases
- Test integration between components

## Documentation

### Updating Documentation

1. Update relevant `.md` files in `/docs`
2. Update README.md if needed
3. Update code comments
4. Add examples for new features

### Documentation Standards
- Use clear, concise language
- Include code examples
- Explain why, not just what
- Keep examples up-to-date
- Link to related documentation

## Bug Reports

When reporting bugs:
1. Use the bug report template
2. Provide minimal reproduction
3. Include error messages and logs
4. Specify your environment
5. Describe expected vs actual behavior

## Feature Requests

When requesting features:
1. Use the feature request template
2. Explain the use case
3. Provide examples
4. Discuss alternatives
5. Consider backwards compatibility

## Review Process

### What Reviewers Look For
- Code quality and style
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations
- Breaking changes

### Addressing Feedback
- Respond to all comments
- Make requested changes
- Push updates to PR
- Re-request review
- Don't force-push after review starts

## Release Process

### Version Numbers
Follow semantic versioning: `MAJOR.MINOR.PATCH`

- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Published to npm

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Questions?

- Open an issue for questions
- Check existing documentation
- Review past issues and PRs
- Ask in discussions

## Thank You!

Thank you for contributing to ARX! Your efforts help make this project better for everyone.

---

**Last Updated**: November 14, 2025
