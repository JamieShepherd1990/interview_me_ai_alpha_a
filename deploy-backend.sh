#!/bin/bash

echo "🚀 AUTOMATED BACKEND DEPLOYMENT SCRIPT"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Please login to Vercel when prompted..."
vercel login

echo "🚀 Deploying to Vercel production..."
vercel --prod

echo ""
echo "✅ BACKEND DEPLOYED!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Copy the deployment URL from above"
echo "2. Go to vercel.com → your project → Settings → Environment Variables"
echo "3. Add these variables:"
echo "   OPENAI_API_KEY=your_openai_key_here"
echo "   ELEVENLABS_API_KEY=your_elevenlabs_key_here"
echo "4. Run: vercel --prod (to redeploy with env vars)"
echo "5. Update your .env file with the deployment URL"
echo ""
