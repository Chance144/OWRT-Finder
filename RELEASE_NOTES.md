# Release Notes

## v1.2.0 - Quality of Life Update (2026-02-14)

🔧 **Bug fixes, new filters, and scan screen overhaul.**

### 🐛 Bug Fixes
*   **Scan preview now works**: Fixed bug where the scanned image preview never displayed because state was cleared prematurely. The preview now stays visible with OCR results until the user taps "Scan Again".
*   **FCC ID no longer a dead end**: FCC IDs are now fuzzy-matched against the device database. If no match is found, the raw OCR text is displayed so users can search manually.

### 🆕 New Features
*   **Pull-to-refresh**: Swipe down on the device list to force-refresh data from the OpenWrt server (clears in-memory cache).
*   **Device count**: The number of devices (or filtered results) is now shown below the search bar.
*   **Filter chips**: Quick-filter buttons for ≥64MB RAM, ≥128MB RAM, ≥16MB Flash, and ≥32MB Flash.
*   **Back button on Scan screen**: Navigate back to the device list from the scanner.
*   **Scan Again button**: After scanning, tap "Scan Again" to reset and take a new photo.

### 🧹 Improvements
*   **README cleanup**: Fixed GitHub URLs, removed broken hero image reference.
*   **Cache management**: Added `clearCache` and `getCacheAge` exports for better cache control.
*   Version bumped to 1.2.0.

---

## v1.1.0 - Camera & Offline Update (2025-12-14)

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
