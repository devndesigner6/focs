# Focs - Quick Start Guide

Get Focs running locally in 5 minutes!

## ✅ Prerequisites (Already Done!)

- [x] Node.js installed
- [x] Firebase project created
- [x] Google Cloud APIs enabled
- [x] All credentials configured in `.env`

## 🚀 Quick Start

### 1. Install Dependencies (Currently Running)

```bash
cd C:\Users\hp\focs
npm install
```

Wait for installation to complete...

### 2. Start Development Server

```bash
npm run dev
```

The app will open at: `http://localhost:5173`

### 3. Test the App

1. **Landing Page**: You should see the Focs landing page with dark theme
2. **Click "Connect Email + Calendar"**: Google OAuth popup appears
3. **Sign In**: Use your Google account
4. **Grant Permissions**: Allow access to Gmail and Calendar
5. **View Brief**: Your daily brief will be generated!

### 4. Explore Features

- ✅ Check off completed items
- ⚙️ Click settings icon (top right) to open settings panel
- 🔄 Click refresh icon to regenerate brief
- 🌙 Dark mode is enabled by default

## 📱 Install as PWA (After Deployment)

### Local Testing (Limited PWA Features)
```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` - Some PWA features work in preview mode.

### Full PWA (After Vercel Deployment)
1. Deploy to Vercel (see DEPLOYMENT.md)
2. Visit your Vercel URL
3. Browser shows "Install" button
4. Click to install as desktop app!

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
vercel                  # Deploy to Vercel preview
vercel --prod          # Deploy to production
```

## 🎨 Design Features

The app matches your screenshots exactly:

- **Dark Theme**: `#0a0a0a` background, `#1a1a1a` cards
- **Retro Typography**: Inter font, clean and minimal
- **Smooth Animations**: Framer Motion for all transitions
- **Floating Window**: Centered card design with rounded corners
- **Checkboxes**: Green accent when completed
- **Settings Sidebar**: Slides in from right

## 📊 What Data You'll See

### Morning Brief
- Recent unread/important emails
- Today's calendar events
- AI-generated summary
- Priority indicators

### Evening Summary
- Completed items count
- Encouraging message
- Foundation for tomorrow

## 🔐 Privacy & Security

- ✅ All data processed locally
- ✅ OAuth tokens stored securely in Firebase
- ✅ No data sent to third parties
- ✅ Read-only access to Gmail/Calendar
- ✅ Encrypted storage

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### OAuth Errors
- Check `.env` file has correct credentials
- Verify redirect URI: `http://localhost:5173/auth/callback`
- Add to Google Cloud Console if missing

### Build Errors
```bash
# Clear cache
rm -rf node_modules
npm install
```

### Firebase Errors
- Check Firestore rules allow authenticated users
- Verify Firebase config in `.env`
- Ensure Authentication is enabled

## 📝 Next Steps

1. ✅ Test locally (you're here!)
2. 📤 Deploy to Vercel (see DEPLOYMENT.md)
3. 🔗 Update OAuth redirect URIs
4. 📱 Install as PWA
5. 🎉 Use daily!

## 💡 Tips

- **First Brief**: May take 10-15 seconds to generate
- **Refresh**: Click refresh icon to regenerate brief
- **Notifications**: Enable in settings for morning alerts
- **Offline**: Works offline after first load (PWA feature)

## 🎯 Expected Behavior

### First Launch
1. Landing page loads instantly
2. Click "Connect Email + Calendar"
3. Google OAuth popup (may need to allow popups)
4. Grant permissions
5. Brief generates (10-15 seconds)
6. See your daily priorities!

### Subsequent Launches
1. Auto-login (if previously signed in)
2. Brief loads from cache (instant)
3. Background refresh updates data
4. Smooth, fast experience

## ✨ Features to Try

- [ ] Check off an email item
- [ ] Check off a calendar event
- [ ] Open settings panel
- [ ] Toggle AI summaries
- [ ] Refresh the brief
- [ ] Sign out and sign back in
- [ ] Test on different screen sizes

## 🚀 Ready to Deploy?

Once local testing works perfectly:
1. Read `DEPLOYMENT.md`
2. Deploy to Vercel
3. Update OAuth URIs
4. Install as PWA
5. Share with others!

---

**Need Help?**
- Check browser console for errors
- Verify all credentials in `.env`
- Ensure Firebase/Google Cloud setup is complete
- Review README.md for detailed setup

**Enjoy your calm, focused mornings with Focs! ☕️**
