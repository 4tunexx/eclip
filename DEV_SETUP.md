Development setup / debugging checklist
------------------------------------

If the build fails locally or on Vercel, follow these steps:

1. Clean everything:
```bash
rm -rf node_modules package-lock.json .next
```

2. Reinstall and verify config files:
```bash
npm install
# Check PostCSS config quickly
node scripts/check-postcss-config.js
```

3. Build and capture logs:
```bash
npm run build 2>&1 | tee build-errors.txt
```

4. If you still get the `postcss.config.js` syntax error:
   - Remove any `.next` from git (if tracked):
```bash
git rm -r --cached .next || true
```
   - Ensure `postcss.config.cjs` exists and `postcss.config.js` uses `module.exports = require('./postcss.config.cjs');` (already set by default)

5. If you see TypeScript type errors for `bcryptjs`/`nodemailer`:
   - We added `src/types/shims.d.ts` to declare missing modules. If a `@types` package is installed for a package that has its own types (e.g., `@types/bcryptjs`), uninstall it:
```bash
npm uninstall --save-dev @types/bcryptjs || true
npm install
```

6. Commit & push when build is clean:
```bash
git add .
git commit -m "chore: fix build issues and add postcss config wrapper"
git push
```

7. On Vercel:
   - Make sure environment variables are set (e.g., `DATABASE_URL`, `EMAIL_SERVER`, `CLOUDINARY_*` if used), otherwise client or server-runner might break on deploy.
   - Make sure Vercel is set to use the `master` branch for production deployment.

If problems persist, upload `build-errors.txt` and any new logs and I’ll iterate further.
