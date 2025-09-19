#!/bin/bash

echo "🚀 SIMPLEST TESTFLIGHT DEPLOYMENT"
echo "================================="
echo ""
echo "This script will do everything automatically except authentication."
echo "You'll need to provide:"
echo "1. Your Apple ID email"
echo "2. Your Apple ID password"
echo "3. 2FA code from your device"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read -r

echo "📦 Installing required tools..."
npm install -g @expo/cli eas-cli

echo ""
echo "🔐 Setting up credentials (you'll need to login)..."
npx eas credentials --platform ios

echo ""
echo "🏗️ Creating production build (this takes 10-15 minutes)..."
echo "The build will happen on Expo's servers, so you can close this terminal."
npx eas build --profile production --platform ios --non-interactive || npx eas build --profile production --platform ios

echo ""
echo "📤 Submitting to TestFlight..."
npx eas submit --platform ios --non-interactive || npx eas submit --platform ios

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "Check your email and App Store Connect for the TestFlight build."
