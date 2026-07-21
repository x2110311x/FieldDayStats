# Contributing to Field Day Analytics

Thank you for your interest in contributing to **Field Day Analytics**! We welcome bug reports, feature suggestions, documentation improvements, and code contributions from the amateur radio and developer community.

---

## 📜 Code of Conduct

We aim to foster an open, welcoming, and respectful community. Please ensure all interactions remain civil, supportive, and respectful of fellow contributors and radio operators.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs & Requesting Features
Before opening a new issue, please check existing GitHub issues to ensure the topic hasn't already been addressed.
- **Bug Reports**: Please include your browser version, operating system, sample ADIF logs (if applicable, with sensitive information redacted), and steps to reproduce the issue. 
- **Feature Requests**: Describe the proposed feature, why it would benefit Field Day operations, and any relevant ARRL rules or logging standards.

### 2. Setting Up Your Development Environment
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FieldDayStats.git
   cd FieldDayStats
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your work:
   ```bash
   git checkout -b feature/my-new-feature
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Guidelines

Field Day Analytics uses **Vitest** for unit testing and **GitHub Actions** for automated build and test validation (`.github/workflows/`).

When adding new scoring rules, ADIF parser enhancements, or utility functions, please include corresponding unit tests under `src/tests/`.

Run the test suite before submitting pull requests:
```bash
npm test
```

Ensure all tests pass cleanly without errors.

---

## 🎨 Code Style & Conventions

- **TypeScript**: Use strict typing. Avoid `any` types wherever possible. Define reusable interfaces in `src/types/index.ts`.
- **React Components**: Use functional components with React Hooks. Component filenames should be PascalCase (e.g., `InstructionsModal.tsx`).
- **Styling**: Use standard Tailwind CSS utility classes. Maintain dark-mode styling consistent with the existing slate palette (`bg-slate-950`, `text-slate-100`, etc.).
- **Privacy & Client-Side Logic**: All data parsing, geographic lookups, and score processing MUST remain 100% client-side. Do not introduce mandatory external backend dependencies or network calls that log user data.

---

## 📩 Submitting a Pull Request

1. Commit your changes with concise, descriptive commit messages.
2. Ensure `npm test` and `npm run build` pass cleanly.
3. Push your feature branch to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
4. Open a Pull Request against the `main` or active development branch of `x2110311x/FieldDayStats`.
5. Provide a clear summary of your changes in the PR description and reference any related issues.

Thank you for helping improve Field Day Analytics for radio operators everywhere! 73! 📻
