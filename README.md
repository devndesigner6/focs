# Focs - Daily Brief PWA

One screen. Zero chaos. Clear priorities every morning.

Focs is a Progressive Web App that unifies your email and calendar into a calm, minimalistic daily brief. Install it as a desktop app and start every day with clarity.

## Features

- 📧 **Email Priorities**: AI-powered summaries of emails that need attention
- 📅 **Calendar Events**: Today's meetings and appointments in one view
- ✨ **Daily Brief**: Morning and evening summaries to stay on track
- 🔒 **Privacy First**: Local processing, your data stays private
- 📱 **PWA**: Install as a desktop app on Mac/Windows
- 🌙 **Dark Mode**: Beautiful, retro-inspired minimalistic design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Framer Motion
- **Database**: Firebase (Firestore + Authentication)
- **AI**: Google Gemini API
- **APIs**: Gmail API + Google Calendar API
- **PWA**: Vite PWA Plugin + Workbox

## Setup Instructions

### Prerequisites

1. Node.js 18+ installed
2. Firebase project created
3. Google Cloud project with Gmail & Calendar APIs enabled
4. Gemini API key

### Installation

1. **Clone and Install**
   ```bash
   cd C:\Users\hp\focs
   npm install
   ```

2. **Environment Variables**
   
   The `.env` file is already configured with your credentials:
   - Firebase config
   - Google OAuth credentials
   - Gemini API key

3. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select project "focs-3bbc5"
   - Enable Authentication → Google sign-in method
   - Enable Firestore Database (start in test mode)
   - Update Firestore rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Google Cloud Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Gmail API and Google Calendar API
   - OAuth consent screen: Add test users
   - Authorized redirect URIs already configured

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel**
   - Go to your project settings on Vercel
   - Add all environment variables from `.env`
   - Redeploy

5. **Update OAuth Redirect URIs**
   - Add your Vercel URL to Google Cloud Console
   - Format: `https://focs.vercel.app/auth/callback`

### PWA Installation

1. Visit the deployed site (e.g., `https://focs.vercel.app`)
2. Browser will show "Install Focs" prompt
3. Click install
4. App icon appears in Start Menu (Windows) or Dock (Mac)
5. Launch like any native app!

## Project Structure

```
focs/
├── src/
│   ├── components/       # React components
│   │   └── Settings.tsx  # Settings sidebar
│   ├── pages/           # Main pages
│   │   ├── Landing.tsx  # Landing page with auth
│   │   └── Brief.tsx    # Daily brief view
│   ├── services/        # API services
│   │   ├── aiService.ts        # Gemini AI integration
│   │   ├── briefService.ts     # Brief generation
│   │   ├── calendarService.ts  # Google Calendar
│   │   └── gmailService.ts     # Gmail API
│   ├── types/           # TypeScript types
│   ├── firebase.ts      # Firebase config
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env                 # Environment variables (configured)
├── vite.config.ts       # Vite + PWA config
├── tailwind.config.js   # Tailwind config
└── package.json         # Dependencies
```

## Usage

### First Time Setup

1. Visit the app
2. Click "Connect Email + Calendar"
3. Sign in with Google
4. Grant permissions for Gmail and Calendar
5. Your first brief will be generated!

### Daily Workflow

1. **Morning (8 AM)**: Receive notification
2. **Open App**: See your daily brief
3. **Review Items**: Check off completed tasks
4. **Evening**: See summary of your day

### Settings

- **AI Summaries**: Toggle AI-generated briefs
- **Notifications**: Enable/disable morning alerts
- **Privacy**: All data processed locally

## API Rate Limits

- **Gmail API**: 1 billion quota units/day (free)
- **Calendar API**: 1 million queries/day (free)
- **Gemini API**: 60 requests/minute (free tier)

## Troubleshooting

### OAuth Errors
- Verify redirect URIs in Google Cloud Console
- Check that APIs are enabled
- Ensure test users are added to OAuth consent screen

### Firebase Errors
- Check Firestore rules
- Verify Firebase config in `.env`
- Ensure Authentication is enabled

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`

## Security Notes

- Never commit `.env` file to Git
- Keep API keys secure
- Use Firestore security rules
- OAuth tokens stored securely in Firebase

## License

MIT License - Feel free to use and modify!

## Support

For issues or questions, please open an issue on GitHub.

---

Made with focus and calm 🧘‍♂️
