# 📱 XCODE VISUAL GUIDE - Step by Step

## 🎯 **What You Should See in Xcode:**

### **Step 1: Find the Scheme Selector**
**Location:** Top left of Xcode window, in the toolbar

You should see:
```
[InterviewCoachAI] [> iPhone 16 Pro] [▶️]
```

- **First dropdown** = `InterviewCoachAI` (this is the scheme)
- **Second dropdown** = Device selector (might show iPhone simulator)
- **Third button** = Play button

### **Step 2: Change Device Target**
1. **Click the second dropdown** (device selector)
2. **Look for "iOS Device"** section at the top
3. **Select "Any iOS Device"** (not a simulator)

### **Step 3: Archive the App**
1. **Go to top menu bar** → **Product**
2. **Click "Archive"** (should be available now)
3. **Wait for build** (5-10 minutes)

## 🔍 **Troubleshooting:**

### **If you don't see "InterviewCoachAI" scheme:**
1. **Click the scheme dropdown** (first one)
2. **Select "InterviewCoachAI"** from the list
3. **If not there:** Go to **Product → Scheme → Manage Schemes**

### **If "Archive" is grayed out:**
- **Make sure** you selected "Any iOS Device" (not simulator)
- **Try:** Product → Clean Build Folder first
- **Then:** Product → Archive

### **If you see build errors:**
- **Check** the left sidebar for red error indicators
- **Most common:** Missing signing certificates (Xcode will prompt to fix)

## 🚀 **Alternative: Use Xcode's Built-in Distributor**

If Archive doesn't work:

1. **Product → Build** (⌘B)
2. **Wait for build to succeed**
3. **Window → Organizer**
4. **Archives tab**
5. **Look for "InterviewCoachAI"**
6. **Click "Distribute App"**

## 📞 **Can't Find These Elements?**

**Tell me exactly what you see:**
- What's in the top-left toolbar area?
- What's in the Product menu?
- Any error messages?

**The app is ready - we just need to get Xcode to archive it!** 🎯

