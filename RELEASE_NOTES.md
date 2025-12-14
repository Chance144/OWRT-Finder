# Release Notes

## v1.1.0 - Thrift Store Hunter Update (2025-12-14)

🔥 **New Feature: Camera Scan & Offline Mode!**

The "Thrift Store Hunter" update transforms your device into the ultimate tool for finding OpenWrt-compatible routers in the wild.

### 🆕 New Features
*   **Camera Scan "Wizard Mode"**: Point your camera at a router label to instantly detect its Model or FCC ID.
*   **Offline Database**: The entire OpenWrt hardware database is now cached on your device. Search works instantly, even in dead zones.
*   **Scan Button**: New floating action button on the home screen for quick access to the scanner.

### 🧹 Improvements
*   Enhanced reliability for data fetching.
*   Added camera permissions for seamless scanning experience.

---

## v1.0.0 - Initial Release (2025-12-14)

🎉 **We are excited to announce the first release of the OpenWrt Hardware Viewer!**

This app brings the massive OpenWrt Table of Hardware (ToH) database to your Android device, optimized for speed and offline usage.

### 🌟 Key Features
*   **Complete Database**: Access specs for **2,800+** supported devices.
*   **Smart Search**: Instantly find routers by Brand ("Linksys"), Model ("WRT3200ACM"), or Target ("mvebu").
*   **Offline Mode**: The app automatically caches data. It works perfectly even when you're setting up a router without internet. (Now further enhanced in v1.1.0)
*   **Firmware Links**: Direct links to Factory and Sysupgrade images for supported devices.
*   **Specs at a Glance**: Quickly compare CPU speed, RAM, and Flash storage.

### 🔧 Technical Details
*   Built with React Native & Expo SDK 54.
*   Optimized data fetching with user-agent handling to respect OpenWrt servers.
*   Includes `eas.json` configuration for reproducible builds.

---
*Download the APK below to get started!*
