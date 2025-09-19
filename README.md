# AI Interview Coach App

A production-ready, cross-platform mobile application for iOS and Android using React Native and Expo. The app provides AI-powered interview coaching with real-time voice conversations, animated avatars, and detailed performance feedback.

## Features

- 🎤 **Real-time Voice Conversations** - P95 latency < 2 seconds
- 🤖 **AI-Powered Coaching** - GPT-4o-mini for intelligent interview questions
- 🎭 **Animated Avatar** - Lottie animations with lip-sync
- 📊 **Performance Feedback** - Detailed scoring and improvement suggestions
- 📱 **Cross-Platform** - iOS and Android support
- 🔒 **Secure Backend** - API keys protected via Vercel proxy
- 💾 **Local Storage** - SQLite with encryption for sensitive data

## Tech Stack

- **Frontend**: React Native + Expo SDK 50+
- **State Management**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation v6
- **Styling**: NativeWind (Tailwind CSS)
- **Voice**: @react-native-voice/voice + ElevenLabs TTS
- **AI**: OpenAI GPT-4o-mini
- **Database**: Supabase + SQLite
- **Backend**: Vercel Functions
- **Animations**: Lottie React Native

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.local` and update with your API keys:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key (for TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Supabase Configuration
SUPABASE_URL=https://vmrhiqghvrgwvhyrerdp.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
EXPO_PUBLIC_API_URL=https://your-vercel-deployment.vercel.app/api
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Deploy Backend Proxy

Deploy the API functions to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Run the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── api/                 # RTK Query API definitions
├── app/                 # Entry point and providers
├── assets/              # Fonts, images, Lottie files
├── components/          # Reusable components
│   ├── core/           # UI primitives
│   └── features/       # Feature-specific components
├── db/                  # SQLite database setup
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and schemas
├── navigation/          # Navigation configuration
├── screens/             # Screen components
├── services/            # STT, TTS, and other services
├── store/               # Redux store and slices
└── theme/               # Tailwind configuration
```

## Key Components

### STT Service
- Real-time speech-to-text with partial results
- 300ms streaming to backend
- Barge-in interruption support

### TTS Service
- ElevenLabs WebSocket integration
- Low-latency audio streaming
- Viseme data for lip-sync

### Avatar Component
- Lottie animation states
- Lip-sync with viseme mapping
- Thinking, speaking, listening states

### Interview Flow
1. **Role Selection** - Choose interview type
2. **Interview Session** - Real-time conversation
3. **Feedback** - AI-generated performance analysis

## Performance Requirements

- **Voice Latency**: P95 < 2,000ms
- **Partial Results**: 300ms intervals
- **Audio Quality**: ElevenLabs premium voices
- **Animation**: 60fps Lottie animations

## Security

- API keys stored securely on backend
- Client-side encryption for sensitive data
- Row Level Security (RLS) on Supabase
- No sensitive data in client code

## Deployment

### Mobile App
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

### Backend
```bash
# Deploy to Vercel
vercel --prod
```

## Testing

```bash
# Run tests
npm test

# Test on real devices
npm run ios --device
npm run android --device
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
