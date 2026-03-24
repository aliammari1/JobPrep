# Security Policy

## 🔒 Security Overview

At JobPrep AI, we take security seriously. This document outlines our security policies, how to report vulnerabilities, and our security practices.

## 📋 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Yes             |
| < 1.0   | ❌ No              |

## 🐛 Reporting a Vulnerability

### Please DO NOT report security vulnerabilities through public GitHub issues.

Instead, please report security vulnerabilities via email:

**Email**: security@aliammari.com
**Subject**: [SECURITY] Brief description of the issue

### What to Include

Please include the following information in your report:

1. **Type of vulnerability**
   - Authentication/Authorization bypass
   - SQL injection
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Data exposure
   - API abuse
   - Other (please describe)

2. **Location**
   - Affected URL(s)
   - Affected component(s)
   - Affected code file(s) and line numbers

3. **Impact**
   - What data could be accessed or modified?
   - Who could be affected?
   - What is the potential damage?

4. **Steps to Reproduce**
   - Detailed step-by-step instructions
   - Proof of concept (if applicable)
   - Screenshots or video (if helpful)

5. **Suggested Fix** (optional)
   - If you have ideas on how to fix the issue

6. **Your Details** (optional)
   - Name (for credit in security advisories)
   - Organization
   - PGP key (if you want encrypted communication)

### Example Security Report

```
Subject: [SECURITY] Authentication bypass in interview room access

Type: Authorization bypass

Location:
- URL: /api/interviews/[id]/join
- File: src/app/api/interviews/[id]/join/route.ts:23

Impact:
- Unauthenticated users can join any interview room with just the room ID
- Allows access to private interview sessions
- Could expose user interview data

Steps to Reproduce:
1. Log out of the application
2. Navigate to /api/interviews/abc123/join
3. Observe that room access is granted without authentication

Suggested Fix:
Add authentication middleware to verify user session before allowing room access.
```

## 🕐 Response Timeline

We are committed to addressing security vulnerabilities promptly:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**:
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 60 days

## 🏆 Security Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be:

- Credited in our security advisories (if desired)
- Listed in our Hall of Fame (coming soon)
- Considered for bounties (for critical vulnerabilities, when budget permits)

## 🛡️ Security Best Practices

### For Users

1. **Keep Your Account Secure**
   - Use strong, unique passwords
   - Enable 2FA (Two-Factor Authentication)
   - Consider using passkey authentication
   - Don't share your credentials

2. **Protect Your API Keys**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use different keys for development and production

3. **Stay Updated**
   - Update to the latest version
   - Review security advisories
   - Check for dependency updates

4. **Safe Self-Hosting**
   - Use HTTPS only
   - Configure proper CORS policies
   - Set up rate limiting
   - Use firewall rules
   - Regular backups

### For Contributors

1. **Secure Coding Practices**
   - Validate all user input
   - Use parameterized queries (Prisma handles this)
   - Sanitize output to prevent XSS
   - Implement proper authentication checks
   - Use CSRF tokens for state-changing operations

2. **Dependency Management**
   - Keep dependencies updated
   - Review dependency security advisories
   - Use `npm audit` or `pnpm audit` regularly
   - Avoid dependencies with known vulnerabilities

3. **Sensitive Data**
   - Never log sensitive data (passwords, tokens, API keys)
   - Encrypt sensitive data at rest
   - Use secure transmission (HTTPS/TLS)
   - Follow data minimization principles

4. **Code Review**
   - All code must be reviewed before merging
   - Security-sensitive changes require extra scrutiny
   - Use automated security scanning tools

## 🔐 Security Features

### Authentication & Authorization

- ✅ **Modern Authentication**: Better Auth with passkey support
- ✅ **Two-Factor Authentication (2FA)**: TOTP and SMS support
- ✅ **Session Management**: Secure cookie-based sessions
- ✅ **Password Security**: Bcrypt hashing with salt
- ✅ **OAuth Integration**: Google, GitHub, LinkedIn

### API Security

- ✅ **Rate Limiting**: Prevents brute force and DoS attacks
- ✅ **Input Validation**: All inputs validated and sanitized
- ✅ **SQL Injection Protection**: Prisma ORM with parameterized queries
- ✅ **XSS Protection**: React's built-in escaping + CSP headers
- ✅ **CSRF Protection**: Built-in CSRF token validation

### Data Protection

- ✅ **Encryption at Rest**: Database encryption for sensitive data
- ✅ **Encryption in Transit**: HTTPS/TLS 1.3 only
- ✅ **API Key Encryption**: AES-256 encryption for stored API keys
- ✅ **Secure File Storage**: Signed URLs with expiration

### Infrastructure Security

- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- ✅ **HTTPS Only**: Automatic redirect to HTTPS
- ✅ **Environment Isolation**: Separate dev/staging/production
- ✅ **Secure Deployment**: Vercel's secure infrastructure

### Monitoring & Logging

- ✅ **Error Tracking**: Sentry integration (if enabled)
- ✅ **Audit Logs**: Track sensitive operations
- ✅ **Security Alerts**: Automated vulnerability scanning

## 🚨 Known Security Considerations

### Third-Party Services

JobPrep AI integrates with several third-party services. While we implement security best practices, users should be aware:

1. **AI Providers** (Gemini, OpenAI, Claude)
   - Interview responses are sent to AI APIs for analysis
   - Review provider privacy policies
   - Use local Ollama for private deployments

2. **LiveKit** (Video/Audio)
   - Real-time video/audio streams
   - End-to-end encrypted by default
   - Check LiveKit security documentation

3. **Stripe** (Payments)
   - PCI-DSS compliant payment processing
   - No credit card data stored on our servers
   - Stripe's security guarantees apply

4. **Appwrite** (File Storage)
   - Files stored with access controls
   - Signed URLs with expiration
   - Review Appwrite security settings

### Self-Hosting Considerations

If you're self-hosting JobPrep AI:

1. **Database Security**
   - Use strong PostgreSQL passwords
   - Enable SSL/TLS for database connections
   - Restrict database access to application servers only
   - Regular backups with encryption

2. **API Key Management**
   - Store API keys securely (use secrets management)
   - Never commit `.env` files
   - Use different keys per environment
   - Rotate keys periodically

3. **Server Security**
   - Keep OS and packages updated
   - Use firewall rules
   - Enable fail2ban or similar
   - Monitor logs for suspicious activity

4. **SSL/TLS Certificates**
   - Use Let's Encrypt or similar
   - Enable HSTS
   - Configure strong cipher suites

## 🔍 Security Audits

### Regular Security Practices

- **Dependency Audits**: Weekly via Renovate bot
- **Code Scanning**: Automated via GitHub CodeQL
- **Penetration Testing**: Annual third-party assessment (planned)
- **Security Reviews**: For all major releases

### Recent Security Updates

- **2025-03**: Initial security policy established
- **2025-01**: Implemented passkey authentication
- **2024-12**: Added 2FA support
- **2024-11**: Enhanced rate limiting

## 📚 Security Resources

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Security](https://better-auth.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

### Tools We Use

- **npm audit / pnpm audit**: Dependency vulnerability scanning
- **GitHub CodeQL**: Static code analysis
- **Renovate**: Automated dependency updates
- **ESLint**: Code quality and security rules

### Security Headers

We implement the following security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📧 Contact

For security concerns:
- **Email**: security@aliammari.com
- **Response Time**: Within 48 hours
- **Public Key**: Available upon request

For general questions:
- **Email**: contact@aliammari.com
- **GitHub Discussions**: For non-security issues

## 📄 Legal

### Responsible Disclosure

We request that security researchers:

1. **Don't** publicly disclose vulnerabilities before we've had a chance to fix them
2. **Don't** exploit vulnerabilities beyond what's necessary to demonstrate the issue
3. **Don't** access, modify, or delete user data
4. **Do** give us reasonable time to fix issues before disclosure
5. **Do** work with us to understand and resolve the issue

### Safe Harbor

We will not pursue legal action against security researchers who:

- Act in good faith
- Follow this responsible disclosure policy
- Don't violate laws or access user data unnecessarily
- Report findings responsibly

## 🔄 Policy Updates

This security policy may be updated periodically. Major changes will be announced via:

- GitHub releases
- Email to registered users
- Twitter [@aliammari1](https://twitter.com/aliammari1)

**Last Updated**: March 24, 2026
**Version**: 1.0

---

Thank you for helping keep JobPrep AI and our users safe! 🛡️
