#!/bin/bash

echo "📱 AUTOMATED TESTFLIGHT DEPLOYMENT SCRIPT"
echo "========================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/cli eas-cli
fi

echo "🔐 Setting up iOS credentials..."
echo "Please login with your Apple ID when prompted..."
npx eas credentials

echo ""
echo "🏗️  Creating production build (this takes 10-15 minutes)..."
npx eas build --profile production --platform ios

echo ""
echo "📤 Submitting to TestFlight..."
npx eas submit --platform ios

echo ""
echo "✅ TESTFLIGHT DEPLOYMENT COMPLETE!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Go to appstoreconnect.apple.com"
echo "2. Navigate to TestFlight"
echo "3. Add internal testers"
echo "4. Send test invitations"
echo ""
