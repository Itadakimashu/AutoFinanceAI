# Security Guidelines for AutoFinanceAI

## Environment Variables

This project uses environment variables to store sensitive configuration data like API keys. Follow these guidelines:

### 1. Never Commit Secrets
- Never commit API keys, passwords, or other secrets to version control
- Use `.env` files for local development (these are gitignored)
- Use your hosting platform's environment variable settings for production

### 2. API Key Management

#### Google Gemini API Key
- Generate your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Set restrictions on your API key:
  - IP restrictions (recommended for production)
  - API restrictions (limit to specific Google services)
  - Set quotas and usage limits

#### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys in the `.env` file
3. Never share or commit the `.env` file

### 3. If You Accidentally Commit Secrets

If you accidentally commit API keys or other secrets:

1. **Immediately revoke/regenerate the exposed keys**
2. **Update your application with new keys**
3. **Clean git history** (for private repos):
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file/with/secret' --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push to overwrite remote history** (DANGEROUS - coordinate with team):
   ```bash
   git push origin --force --all
   ```

### 4. Production Deployment

For production environments:
- Use your hosting platform's environment variable settings
- Never store secrets in code or config files
- Rotate API keys regularly
- Monitor API usage for suspicious activity

### 5. Security Checklist

- [ ] All API keys are stored in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in codebase
- [ ] API keys have appropriate restrictions
- [ ] Production uses secure environment variable management

## Reported Security Issues

### July 30, 2025 - Exposed Google API Key
- **Issue**: Google Gemini API key was hardcoded in `backend/core/analysis.py`
- **Status**: RESOLVED
- **Actions Taken**:
  - Revoked exposed API key
  - Cleaned git history
  - Implemented proper environment variable usage
  - Added security documentation
