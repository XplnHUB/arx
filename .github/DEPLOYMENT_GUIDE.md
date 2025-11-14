# GitHub Actions CI/CD Deployment Guide

This guide explains how to configure the GitHub Actions CI/CD pipeline for different deployment platforms.

## Overview

The CI/CD pipeline includes:
- **Test Job**: Runs tests on multiple Node.js versions (18.x, 20.x, 22.x)
- **Coverage Job**: Generates code coverage reports and uploads to Codecov
- **Deploy Job**: Deploys to production (configurable)
- **Badge Job**: Updates coverage badge in README

## Setup Instructions

### 1. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Enable "Allow all actions and reusable workflows"
4. Save changes

### 2. Configure Secrets

Depending on your deployment platform, add these secrets to your repository:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### For Vercel Deployment
```
VERCEL_TOKEN: Your Vercel API token
VERCEL_ORG_ID: Your Vercel organization ID
VERCEL_PROJECT_ID: Your Vercel project ID
```

#### For Render Deployment
```
RENDER_SERVICE_ID: Your Render service ID
RENDER_API_KEY: Your Render API key
```

#### For Docker Hub Deployment
```
DOCKER_USERNAME: Your Docker Hub username
DOCKER_PASSWORD: Your Docker Hub password
```

#### For Codecov Coverage
```
CODECOV_TOKEN: Your Codecov token (optional, auto-detected for public repos)
```

## Deployment Configuration

### Option 1: Vercel Deployment

Uncomment the Vercel deployment step in `.github/workflows/ci.yml`:

```yaml
- name: Deploy to Vercel
  uses: vercel/action@master
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Setup:**
1. Create account at https://vercel.com
2. Create a project and get your IDs
3. Generate API token at https://vercel.com/account/tokens
4. Add secrets to GitHub

### Option 2: Render Deployment

Uncomment the Render deployment step in `.github/workflows/ci.yml`:

```yaml
- name: Deploy to Render
  run: |
    curl -X POST https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}
```

**Setup:**
1. Create account at https://render.com
2. Create a web service
3. Get your service ID from the URL
4. Generate API key in account settings
5. Add secrets to GitHub

### Option 3: Docker Hub Deployment

Uncomment the Docker deployment step in `.github/workflows/ci.yml`:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ secrets.DOCKER_USERNAME }}/arx:latest
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

**Setup:**
1. Create account at https://hub.docker.com
2. Create a repository for your project
3. Generate access token in account settings
4. Add secrets to GitHub
5. Create a `Dockerfile` in your project root

**Example Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### Option 4: GitHub Pages Deployment

Uncomment the GitHub Pages deployment step in `.github/workflows/ci.yml`:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs
```

**Setup:**
1. Go to **Settings** → **Pages**
2. Select **Deploy from a branch**
3. Choose **gh-pages** branch
4. The workflow will automatically create and push to this branch

## Monitoring Workflows

### View Workflow Runs

1. Go to your repository
2. Click **Actions** tab
3. Select a workflow to see details
4. Click a run to see logs

### Check Coverage Reports

1. Go to **Actions** tab
2. Click the latest run
3. Scroll down to **Artifacts**
4. Download `coverage-report` to view detailed coverage

### View Coverage Badge

The coverage badge is automatically added to your README.md:

```markdown
![coverage](https://img.shields.io/badge/coverage-XX%25-brightgreen)
```

## Troubleshooting

### Tests Failing

1. Check the workflow logs in **Actions** tab
2. Look for error messages in the **Run tests** step
3. Run tests locally: `npm test -- --run`
4. Fix issues and push to trigger workflow again

### Deployment Not Running

1. Ensure you're pushing to the `main` branch
2. Check that all previous jobs (test, coverage) passed
3. Verify deployment secrets are configured correctly
4. Check deployment logs in the **Deploy** step

### Coverage Not Updating

1. Ensure coverage report is generated: `npm test -- --run --coverage`
2. Check that `coverage/coverage-summary.json` exists
3. Verify Codecov token is set (if using Codecov)
4. Check badge job logs for errors

### Badge Not Updating

1. Ensure badge job has permission to push to main branch
2. Check that `coverage-summary.json` is generated
3. Verify git config is correct in badge job
4. Check for merge conflicts in README.md

## Best Practices

### 1. Use Branch Protection Rules

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Require status checks to pass before merging
4. Require code reviews before merging

### 2. Monitor Workflow Performance

- Check average workflow execution time
- Optimize slow steps
- Use caching effectively
- Consider parallel jobs

### 3. Keep Secrets Secure

- Never commit secrets to repository
- Rotate tokens regularly
- Use least privilege principle
- Audit secret access

### 4. Regular Maintenance

- Update action versions regularly
- Review and update dependencies
- Monitor for deprecated features
- Test deployment regularly

## Environment Variables

Configure environment variables in the workflow:

```yaml
env:
  NODE_VERSION: '20.x'
  CACHE_KEY: node-modules-${{ hashFiles('**/package-lock.json') }}
```

Or per-job:

```yaml
jobs:
  test:
    env:
      NODE_ENV: test
```

## Caching Strategy

The workflow uses npm cache for faster installs:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

Cache is invalidated when `package-lock.json` changes.

## Matrix Strategy

Tests run on multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

This ensures compatibility across versions.

## Artifacts

Workflow generates and stores artifacts:

- `test-results-*.zip` - Test results (30 days retention)
- `coverage-report` - Coverage reports (30 days retention)

Download from **Actions** → Run → **Artifacts**

## Next Steps

1. Configure your preferred deployment platform
2. Add required secrets to GitHub
3. Push changes to trigger workflow
4. Monitor first run in **Actions** tab
5. Verify deployment succeeded
6. Check coverage badge in README

## Support

For issues or questions:
- Check GitHub Actions documentation: https://docs.github.com/en/actions
- Review workflow logs for error messages
- Check platform-specific documentation
- Open an issue on the repository

---

**Last Updated**: November 14, 2025
