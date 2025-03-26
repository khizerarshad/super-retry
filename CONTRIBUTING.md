# Contributing to Super-Retry

We welcome contributions from developers of all skill levels! Here's how to get started:

## 🛠 Getting Started

1. **Fork the Repository**  
   [Click here to fork](https://github.com/khizerarshad/super-retry/fork)

2. **Clone Your Fork**  
   ```bash
   git clone https://github.com/your-username/super-retry.git
   cd super-retry
   ```

3. **Install Dependencies**  
   ```bash
   npm ci
   ```

4. **Build the Project**  
   ```bash
   npm run build
   ```

## 🔧 Development Workflow

### Branch Naming
Use descriptive branch names:
```
feat/add-middleware-system
fix/retry-event-types
docs/update-contributing-guide
```

### Coding Standards
- Follow TypeScript best practices
- Write JSDoc comments for public APIs
- Keep functions under 25 lines
- Use descriptive variable names

### Testing
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- middleware.test.ts

# Generate coverage report
npm run test:coverage
```

## 📦 Submitting Changes

1. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add custom strategy registry"
   ```

2. Push to your fork:
   ```bash
   git push origin your-branch-name
   ```

3. [Open a Pull Request](https://github.com/khizerarshad/super-retry/compare)

## 🚨 Issue Types

| Label        | Description                     |
|--------------|---------------------------------|
| `bug`        | Unexpected behavior             | 
| `enhancement`| Feature requests                |
| `documentation`| Docs improvements              |
| `question`   | Support inquiries               |

## 🏆 Your First Contribution

Check our [Good First Issues](https://github.com/khizerarshad/super-retry/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) to start!

## 💬 Need Help? 
Join our [Discussions](DISCUSSIONS.md) forum for support.

---

[Code of Conduct](https://github.com/khizerarshad/super-retry/blob/main/CODE_OF_CONDUCT.md) | [License](LICENSE)