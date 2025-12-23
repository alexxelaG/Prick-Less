# Contributing to Prick-Less 🩸➡️📱

Thank you for your interest in contributing to Prick-Less! This document provides guidelines for contributing to our non-invasive glucose monitoring system.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Prick-Less.git
   cd Prick-Less
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

1. **Follow the main README** for initial setup
2. **Install dependencies** for all components:
   ```bash
   # Backend
   cd software/glucose-monitor-backend && npm install
   
   # Frontend  
   cd software/frontend/pricklessui && npm install
   ```

3. **Run tests** to ensure everything works:
   ```bash
   ./test_backend.sh
   ./test_mqtt.sh
   ```

## 🎯 How to Contribute

### Areas Where We Need Help

- **Hardware Development**: ESP32 sensor optimization
- **Machine Learning**: Glucose prediction algorithms
- **Frontend**: UI/UX improvements
- **Mobile Development**: React Native app
- **Documentation**: Guides and tutorials
- **Testing**: Unit and integration tests

### Types of Contributions

1. **Bug Fixes** - Fix issues and improve stability
2. **Features** - Add new functionality
3. **Documentation** - Improve guides and code comments
4. **Optimization** - Performance and efficiency improvements
5. **Testing** - Add test coverage

## 📋 Submission Process

1. **Make your changes** in your feature branch
2. **Test thoroughly**:
   - Ensure backend API works
   - Test frontend functionality
   - Verify MQTT connectivity
   - Check database operations

3. **Commit with clear messages**:
   ```bash
   git commit -m \"feat: add glucose trend analysis\"
   git commit -m \"fix: resolve MQTT connection timeout\"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

## ✅ Code Quality Standards

### Code Style
- **JavaScript**: Use ES6+ features, consistent indentation
- **React**: Functional components with hooks
- **Arduino/C++**: Follow Arduino IDE conventions

### Commit Messages
Follow conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests

### Testing Requirements
- Test API endpoints with provided scripts
- Ensure MQTT functionality works
- Verify database operations
- Test frontend components

## 🚨 Important Guidelines

### What NOT to Commit
- Sensitive data (passwords, API keys)
- Log files (`*.log`)
- Local configuration files (`.env`)
- Dependencies (`node_modules/`)
- OS files (`.DS_Store`)

### Security Considerations
- Never commit real database credentials
- Use environment variables for configuration
- Sanitize user inputs
- Follow secure coding practices

## 🔍 Review Process

Your Pull Request will be reviewed for:
- **Functionality**: Does it work as expected?
- **Code Quality**: Is it clean and maintainable?
- **Testing**: Are changes properly tested?
- **Documentation**: Is it well documented?
- **Compatibility**: Does it break existing features?

## 💬 Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs first

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

**Thank you for helping make glucose monitoring painless! 🙏**