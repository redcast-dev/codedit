# Contributing to CODEDIT

Thank you for your interest in contributing to CODEDIT! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork trepository
2. Clone your fork: `git clone https://github.com/your-username/codedit.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Code Style

- Use Prettier for formatting: `npm run format`
- Follow ESLint rules: `npm run lint`
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Component Guidelines

### React Components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use prop-types or TypeScript for type checking

### File Organization
```
src/
├── components/     # Reusable UI components
├── lib/           # Utility functions and helpers
├── hooks/         # Custom React hooks
└── pages/         # Page-level components
```

## Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add code formatting support`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Testing

- Write unit tests for utilities and helpers
- Add integration tests for components
- Test edge cases and error handling
- Ensure accessibility standards

## Security

- Never commit API keys or secrets
- Validate and sanitize user inputs
- Use environment variables for configuration
- Report security issues privately to maintainers

## Feature Requests

- Check existing issues first
- Provide clear use case and benefits
- Include mockups or examples if applicable
- Be open to discussion and feedback

## Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots or error messages

## Code Review

- Be respectful and constructive
- Focus on code, not the person
- Explain reasoning for suggestions
- Be open to different approaches

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for questions or discussions.

Thank you for contributing! 🎉
