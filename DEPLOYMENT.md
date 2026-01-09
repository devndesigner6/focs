# Focs - Deployment Guide

Complete guide to deploy Focs PWA to Vercel and make it accessible at `focs.vercel.app`

## Prerequisites Checklist

- [x] Firebase project created (focs-3bbc5)
- [x] Google Cloud APIs enabled (Gmail + Calendar)
- [x] OAuth credentials configured
- [x] Gemini API key obtained
- [x] All credentials added to `.env` file
- [ ] Vercel account created
- [ ] Git repository initialized

---

## Step 1: Prepare for Deployment

### 1.1 Test Locally First

```bash
cd C:\Users\hp\focs
npm run dev
```

Visit `http://localhost:5173` and verify:
- Landing page loads
- Google sign-in works
- Brief page displays after login
- Settings panel opens

### 1.2 Build Production Version

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

---

## Step 2: Initialize Git Repository

```bash
cd C:\Users\hp\focs
git init
git add .
git commit -m "Initial commit: Focs PWA"
```

### 2.1 Create GitHub Repository (Optional but Recommended)

1. Go to https://github.com/new
2. Repository name: `focs`
3. Make it private (contains sensitive config)
4. Don't initialize with README (we already have one)
5. Create repository

```bash
git remote add origin https://github.com/YOUR_USERNAME/focs.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email)

### 3.3 Deploy

```bash
cd C:\Users\hp\focs
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → focs
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

Vercel will:
1. Build your project
2. Deploy to a preview URL
3. Give you a deployment URL like `focs-xxx.vercel.app`

### 3.4 Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://focs.vercel.app` (or your custom domain)

---

## Step 4: Configure Environment Variables in Vercel

### 4.1 Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your `focs` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable from your `.env` file:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_GEMINI_API_KEY=your_gemini_api_key
```

5. Select **Production**, **Preview**, and **Development** for each
6. Click **Save**

### 4.2 Via CLI (Alternative)

```bash
vercel env add VITE_FIREBASE_API_KEY
# Paste value when prompted
# Select: Production, Preview, Development
# Repeat for all variables
```

### 4.3 Redeploy After Adding Variables

```bash
vercel --prod
```

---

## Step 5: Update OAuth Redirect URIs

### 5.1 Get Your Vercel URL

After deployment, note your URL: `https://focs.vercel.app`

### 5.2 Update Google Cloud Console

1. Go to https://console.cloud.google.com
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://focs.vercel.app/auth/callback
   https://focs.vercel.app
   ```
6. Click **Save**

### 5.3 Update Firebase

1. Go to https://console.firebase.google.com
2. Select project "focs-3bbc5"
3. **Authentication** → **Sign-in method** → **Google**
4. Under **Authorized domains**, add:
   ```
   focs.vercel.app
   ```
5. Click **Save**

---

## Step 6: Test Production Deployment

1. Visit `https://focs.vercel.app`
2. Test the complete flow:
   - Landing page loads
   - Click "Connect Email + Calendar"
   - Google OAuth works
   - Brief generates successfully
   - Settings panel functions
   - PWA install prompt appears

---

## Step 7: Install as PWA

### On Desktop (Chrome/Edge)

1. Visit `https://focs.vercel.app`
2. Look for install icon in address bar (⊕ or computer icon)
3. Click **Install**
4. App opens in standalone window
5. Find icon in:
   - **Windows**: Start Menu
   - **Mac**: Applications folder / Dock

### On Mobile

1. Visit `https://focs.vercel.app`
2. **iOS**: Tap Share → Add to Home Screen
3. **Android**: Tap menu → Install app
4. Launch from home screen

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain in Vercel

1. Vercel Dashboard → Your project → **Settings** → **Domains**
2. Add domain: `focs.yourdomain.com`
3. Follow DNS configuration instructions

### 8.2 Update OAuth URIs

Add your custom domain to:
- Google Cloud Console redirect URIs
- Firebase authorized domains

---

## Continuous Deployment

### Auto-Deploy on Git Push

If you connected GitHub:
1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Preview deployments for pull requests

```bash
git add .
git commit -m "Update feature"
git push origin main
```

---

## Monitoring & Analytics

### Vercel Analytics

1. Vercel Dashboard → Your project → **Analytics**
2. View:
   - Page views
   - Performance metrics
   - User locations

### Firebase Analytics

1. Firebase Console → **Analytics**
2. Track:
   - User engagement
   - Authentication events
   - Custom events

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
vercel --force
```

### OAuth Errors

- Verify all redirect URIs are added
- Check environment variables are set
- Ensure APIs are enabled in Google Cloud

### PWA Not Installing

- Check `manifest.json` is accessible
- Verify HTTPS is enabled (Vercel does this automatically)
- Clear browser cache and try again

### Firebase Errors

- Check Firestore rules allow authenticated users
- Verify Firebase config in environment variables
- Check Firebase project quotas

---

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
git commit -am "Update dependencies"
git push
```

### Monitor Costs

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Firebase**: Free tier includes 50K reads/day
- **Gemini API**: Free tier includes 60 requests/minute

### Backup

Regularly backup:
- Firestore data (Firebase Console → Firestore → Export)
- Environment variables (keep secure copy)
- Git repository (already backed up on GitHub)

---

## Success Checklist

- [ ] App deployed to Vercel
- [ ] Environment variables configured
- [ ] OAuth redirect URIs updated
- [ ] Firebase authorized domains added
- [ ] Production site tested
- [ ] PWA installs successfully
- [ ] Google sign-in works
- [ ] Brief generation works
- [ ] Settings panel functions
- [ ] Notifications enabled (if supported)

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all credentials are correct
4. Test locally first with `npm run dev`

---

**Congratulations! Your Focs PWA is now live! 🎉**

Visit: https://focs.vercel.app
