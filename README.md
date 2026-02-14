# OpenWrt Hardware Viewer

**The entire OpenWrt Table of Hardware database, right in your pocket.**

This Android application provides offline access to specifications for over 2,800 devices supported by OpenWrt. It is designed to be fast, searchable, and usable without an internet connection.

## ✨ Features

*   **Offline Database**: All device data is cached locally. Search and view specs anywhere.
*   **Instant Search**: Filter by Brand, Model, or Target architecture in real-time.
*   **Detailed Specs**: View CPU model/MHz, Flash/RAM size, and direct firmware download links.
*   **Modern UI**: Clean, Material Design interface with Dark Mode support (system default).
*   **Open Source**: Built with React Native and Expo.

## 🚀 Installation

You can download the latest APK from the [Releases](https://github.com/Chance144/OWRT-Finder/releases) page.

## 🛠 Building from Source

This project uses **Expo**. To run it locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Chance144/OWRT-Finder.git
    cd OWRT-Finder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npx expo start
    ```

4.  **Run on Android**
    *   Press `a` in the terminal to open in an Android Emulator.
    *   Or scan the QR code with the Expo Go app on your physical device.

## 📦 Building the APK

To generate a standalone APK for Android:

```bash
npx eas-cli build --platform android --profile preview
```

## 📄 License

This project is open source. Data is sourced from the [OpenWrt Wiki](https://openwrt.org/toh/start) (CC BY-SA).
