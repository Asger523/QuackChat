# QuackChat 🦆

A modern chat application built with React Native and Firebase, featuring real-time messaging, image sharing, Google Sign-In authentication, and robust push notification support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Key Features Implementation](#key-features-implementation)
- [Configuration](#configuration)
- [Push Notification System](#push-notification-system)
- [Database Structure](#database-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

## Features

- **Real-time Messaging**: Instantly chat with others in themed rooms.
- **Image Sharing**: Send and receive images using gallery selection.
- **Authentication**: Secure sign-in via email/password or Google.
- **Push Notifications**: Get notified of new messages in real time, even when the app is closed.
- **Multiple Chat Rooms**: Join rooms like "The Pond", "Lakeside", and "The Quack Shack".
- **Cross-Platform**: Runs on both iOS and Android devices

## Tech Stack

- **React Native 0.78.1** - Cross-platform mobile development
- **Firebase** - Backend services including:
  - Authentication
  - Firestore (Database)
  - Storage (Image uploads)
  - Cloud Functions (Push notifications)
  - Cloud Messaging (FCM)
- **React Navigation** - Navigation between screens
- **Google Sign-In** - OAuth authentication
- **TypeScript** - Type-safe development

## Prerequisites

Before running this project, make sure you have:

- Node.js (>= 18)
- React Native development environment set up
- Xcode (for iOS development)
- Android Studio (for Android development)
- Firebase project configured

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Asger523/QuackChat.git
   cd QuackChat
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Firebase Configuration**

   - Place your `google-services.json` in `android/app/`
   - Place your `GoogleService-Info.plist` in `ios/`
   - Update the web client IDs in the authentication configuration
   - Configure Firebase Cloud Messaging for push notifications

5. **Firebase Functions Setup** (for push notifications)
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

## Running the App

### Development Server

```bash
npm start
```

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

## Project Structure

```
QuackChat/
├── app/
│   └── assets/                          # Images and static resources
│   ├── components/                      # Reusable UI components
│   │   ├── BottomBar.tsx                # Bottom navigation bar
│   │   ├── EditProfileModal.tsx         # Modal for editing user profile
│   │   ├── MessageItem.tsx              # Individual message display
│   │   └── RoomItem.tsx                 # Chat room list item
│   ├── contexts/                        # React Context providers
│   │   ├── auth.context.tsx             # Authentication state management
│   │   ├── messages.context.tsx         # Message handling and real-time updates
│   │   ├── notifications.context.tsx    # Push notifications management
│   │   ├── rooms.context.tsx            # Chat room management
│   │   └── theme.context.tsx            # Theme management
│   ├── hooks/                           # Custom React hooks
│   │   ├── use.notifications.tsx        # Notification logic
│   │   ├── use.notificationCore.tsx     # Core notification logic
│   │   └── use.notificationActions.tsx  # Notification actions
│   ├── screens/                         # Application screens
│   │   ├── chatRoom.tsx                 # Individual chat room
│   │   ├── home.tsx                     # Main screen with room list
│   │   ├── settings.tsx                 # User settings and preferences
│   │   ├── signIn.tsx                   # Sign in screen
│   │   ├── signUp.tsx                   # Sign up screen
│   │   └── splashScreen.tsx             # App loading screen
│   ├── services/                        # Utility services
│   │   └── navigationService.tsx        # Navigation utilities
├── functions/
│   ├── src/
│   │   └── index.ts                     # Firebase Cloud Function implementations
│   ├── package.json                     # Functions dependencies
│   └── tsconfig.json                    # TypeScript configuration
├── android/                             # Android-specific files and configuration
├── ios/                                 # iOS-specific files and configuration
├── __tests__/                           # Unit and integration tests
│   └── App.test.tsx                     # App test file
├── App.tsx                              # Root component
└── index.js                             # App entry point
```

## Key Features Implementation

### Authentication

- Email/password authentication with Firebase Auth
- Google Sign-In integration
- User profile management with display names and avatars

### Real-time Messaging

- Firestore real-time listeners for instant message updates
- Message ordering by timestamp
- Sender information displayed with avatars

### Image Sharing

- React Native Image Picker integration
- Firebase Storage for image uploads
- Image display within chat messages

### Navigation

- Stack-based navigation with React Navigation
- Proper screen transitions and header customization
- Authentication-based routing

### Push Notifications

- Firebase Cloud Messaging (FCM) integration for real-time notifications
- Background and foreground notification handling
- Automatic notification delivery when new messages are received
- Cloud Functions trigger notifications when messages are sent
- Cross-platform notification support for iOS and Android
- Notification testing utilities for development and debugging

## Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Firebase Storage
5. Enable Firebase Cloud Messaging
6. Download configuration files and place them in the appropriate directories

### Google Sign-In Configuration

Update the client IDs in [`app/contexts/auth.context.tsx`](app/contexts/auth.context.tsx):

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
  iosClientId: 'YOUR_IOS_CLIENT_ID',
});
```

### Push Notifications Configuration

The app uses Firebase Cloud Messaging for push notifications:

1. **iOS Configuration**: Ensure your Apple Developer account has push notification capabilities enabled
2. **Android Configuration**: No additional setup required beyond Firebase configuration
3. **Cloud Functions**: Deploy the functions for automatic notification triggers:
   ```bash
   cd functions
   firebase deploy --only functions
   ```

## Push Notification System

### How It Works

1. **Message Sent**: When a user sends a message in a chat room
2. **Cloud Function Trigger**: Firebase Cloud Function detects the new message
3. **FCM Token Retrieval**: Function retrieves FCM tokens for room participants
4. **Notification Sent**: Push notification is sent to all participants except the sender
5. **Client Handling**: App handles notifications in both foreground and background states

### Notification Features

- **Real-time Delivery**: Instant notifications when messages are received
- **Smart Filtering**: No notifications sent to the message sender
- **Background Handling**: Notifications work even when app is closed
- **Custom Payload**: Includes room information and message preview
- **Testing Tools**: Built-in notification testing utilities for development

## Database Structure

### Firestore Collections

#### Rooms

```javascript
{
  id: string,
  title: string,
  description: string,
  lastMessageTimestamp: Timestamp
}
```

#### Messages (subcollection of rooms)

```javascript
{
  id: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string,
  text: string,
  imageUrl?: string,
  timestamp: Timestamp
}
```

## Scripts

- `npm start` - Start the Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Try `npx react-native start --reset-cache`
2. **iOS build failures**: Clean build folder in Xcode and run `pod install`
3. **Android build issues**: Clean project with `cd android && ./gradlew clean`
4. **Firebase configuration**: Ensure all configuration files are properly placed and bundle IDs match

Made with ❤️ and React Native
