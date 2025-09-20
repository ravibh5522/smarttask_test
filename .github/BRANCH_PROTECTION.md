# 🛡️ SmartTask IQ - STRICT Repository Protection Rules

## 🔐 OWNER-ONLY ACCESS POLICY

**⚠️ CRITICAL NOTICE**: This repository enforces **STRICT OWNER-ONLY** access for all protected files. Only **@ravibh5522 (Ravi Kumar)** can modify critical repository files.

## � ZERO-TOLERANCE PROTECTION

### 👤 Authorized User
- **ONLY**: @ravibh5522 (Ravi Kumar) - Repository Owner
- **NO EXCEPTIONS**: Contributors, collaborators, and team members CANNOT modify protected files

### 🔒 Protected File Categories

#### 📖 Documentation & Legal (OWNER-ONLY)
- `README.md` - Project documentation and branding
- `LICENSE` - Proprietary software license agreement
- `COPYRIGHT` - Intellectual property notices
- `CONTRIBUTING.md` - Contribution guidelines
- `SECURITY.md` - Security policies and vulnerability reporting
- `CODE_OF_CONDUCT.md` - Community standards and behavior guidelines
- `CHANGELOG.md` - Version history and release notes
- `SUPPORT.md` - Support resources and contact information
- `*.md` - ALL markdown documentation files
- `docs/` - Complete documentation directory

#### ⚙️ Configuration & Build (OWNER-ONLY)
- `package.json` - Project dependencies and npm scripts
- `tsconfig*.json` - TypeScript compiler configuration
- `vite.config.ts` - Build tool and bundler configuration
- `tailwind.config.ts` - CSS framework configuration
- `eslint.config.js` - Code linting and quality rules
- `postcss.config.js` - CSS post-processing configuration
- `components.json` - UI component library configuration
- `.gitignore` - Git version control ignore patterns
- `.env*` - Environment variables and secrets
- `bun.lockb` / `yarn.lock` / `package-lock.json` - Dependency lock files

#### 🔧 GitHub & Repository (OWNER-ONLY)
- `.github/` - ALL GitHub configuration files
- `.github/workflows/` - GitHub Actions and CI/CD pipelines
- `.github/ISSUE_TEMPLATE/` - Issue reporting templates
- `.github/CODEOWNERS` - Code ownership and approval rules
- `.github/BRANCH_PROTECTION.md` - This protection documentation

#### 🗄️ Database & Infrastructure (OWNER-ONLY)
- `supabase/config.toml` - Database configuration
- `supabase/migrations/` - Database schema migrations
- `supabase/functions/` - Serverless database functions

### ✅ Source Code Collaboration (WITH STRICT APPROVAL)

#### 💻 Application Source Code
- `src/` - React application source code
- `public/` - Static assets and public resources

**Important**: Even source code modifications require:
1. Pull request creation
2. Owner review and approval (@ravibh5522)
3. All status checks passing
4. No modifications to protected files
vite.config.ts             @ravibh5522
tailwind.config.ts         @ravibh5522
postcss.config.js          @ravibh5522
eslint.config.js           @ravibh5522
components.json            @ravibh5522

# Supabase Configuration
supabase/config.toml       @ravibh5522
supabase/migrations/       @ravibh5522
```

## 🔒 Repository Settings

### General Settings
- **Default branch:** `main`
- **Allow merge commits:** ✅ Enabled
- **Allow squash merging:** ✅ Enabled
- **Allow rebase merging:** ❌ Disabled
- **Automatically delete head branches:** ✅ Enabled

### Security Settings
- **Dependency graph:** ✅ Enabled
- **Dependabot alerts:** ✅ Enabled
- **Dependabot security updates:** ✅ Enabled
- **Code scanning alerts:** ✅ Enabled
- **Secret scanning alerts:** ✅ Enabled

### Access Control
- **Base permissions:** Read
- **Admin access:** @ravibh5522 only
- **Maintain access:** None
- **Write access:** Gaurav Kumar, Raghav Gulati (for source code only)
- **Triage access:** None
- **Read access:** All collaborators

## 🚫 File Modification Restrictions

### Protected Files (Owner-only modification):
- 📖 **README.md** - Project documentation and branding
- ⚖️ **LICENSE** - Legal terms and intellectual property
- 📝 **CONTRIBUTING.md** - Contribution guidelines
- 🔒 **SECURITY.md** - Security policies and procedures
- 📋 **CODE_OF_CONDUCT.md** - Community guidelines
- 📅 **CHANGELOG.md** - Version history and releases
- 🆘 **SUPPORT.md** - Support documentation
- 🔧 **.github/** - GitHub workflows and templates
- 📦 **package.json** - Project dependencies and scripts
- ⚙️ **Configuration files** - Build and tooling configuration

### Collaborative Development Files:
- ✅ **src/** - Source code (with review)
- ✅ **public/** - Static assets (with review)
- ✅ **docs/** - Technical documentation (with review)

## 🔄 Workflow Enforcement

### Automatic Protection:
1. **File Change Detection** - Monitors protected files in PRs
2. **Author Verification** - Checks if author is authorized
3. **Automatic Rejection** - Blocks unauthorized changes
4. **Notification System** - Comments on PRs with clear instructions

### Manual Review Process:
1. All changes require PR review
2. Protected file changes require owner approval
3. Status checks must pass
4. Conversations must be resolved

## 📞 Contact for Access

**For repository access or permission changes:**
- **Ravi Kumar** (@ravibh5522) - Project Owner & Tech Lead
- **GitHub Repository:** smarttask-iq
- **Email:** Contact through GitHub profile

## ⚠️ Important Notes

1. **Proprietary Project** - This is closed-source proprietary software
2. **IP Protection** - All content is protected intellectual property
3. **Owner Authorization** - Critical changes require explicit owner approval
4. **Automated Enforcement** - Rules are enforced by GitHub Actions
5. **No Exceptions** - Rules apply to all users including administrators

---

**Last Updated:** September 10, 2025
**Next Review:** December 10, 2025

© 2025 Ravi Kumar, Gaurav Kumar, Raghav Gulati. All Rights Reserved.
