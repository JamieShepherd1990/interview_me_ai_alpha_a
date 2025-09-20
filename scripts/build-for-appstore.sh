#!/bin/bash

# 🚀 Build for App Store with iOS 18 SDK (Local Xcode 16)
# This script builds locally with Xcode 16 for App Store submission
# while keeping EAS builds for development and testing

set -e

echo "🔧 Building for App Store with iOS 18 SDK..."

# Check Xcode version
XCODE_VERSION=$(xcodebuild -version | head -n1 | cut -d' ' -f2)
echo "📱 Using Xcode: $XCODE_VERSION"

if [[ "$XCODE_VERSION" < "16.0" ]]; then
    echo "❌ Error: Xcode 16.0+ required for App Store submission"
    echo "   Current version: $XCODE_VERSION"
    echo "   Please update Xcode to 16.0+ and install iOS 18 SDK"
    exit 1
fi

# Set environment
export LANG=en_US.UTF-8

# Clean and prepare
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf ios/DerivedData

# Generate iOS project
echo "📦 Generating iOS project..."
npx expo prebuild --platform ios --clean

# Install CocoaPods
echo "📚 Installing CocoaPods..."
cd ios && pod install && cd ..

# Archive for App Store
echo "🏗️  Building archive for App Store..."
cd ios
xcodebuild \
    -workspace InterviewCoachAI.xcworkspace \
    -scheme InterviewCoachAI \
    -configuration Release \
    -sdk iphoneos \
    -archivePath "InterviewCoachAI.xcarchive" \
    archive

# Export IPA
echo "📦 Exporting IPA..."
xcodebuild \
    -exportArchive \
    -archivePath "InterviewCoachAI.xcarchive" \
    -exportPath "." \
    -exportOptionsPlist ../scripts/ExportOptions.plist

echo "✅ App Store build complete!"
echo "📱 IPA location: ios/InterviewCoachAI.ipa"
echo "🚀 Ready for App Store submission!"

# Optional: Upload to App Store Connect
read -p "🤔 Upload to App Store Connect now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Uploading to App Store Connect..."
    xcrun altool \
        --upload-app \
        --type ios \
        --file "InterviewCoachAI.ipa" \
        --username "$APPLE_ID" \
        --password "$APP_SPECIFIC_PASSWORD"
    echo "✅ Upload complete!"
fi
