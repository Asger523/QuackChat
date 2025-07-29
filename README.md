# QuackChat 🦆

A modern chat application built with React Native and Firebase, featuring real-time messaging, image sharing, and Google Sign-In authentication.

## Features

- **Real-time Messaging**: Chat with others in different rooms with instant message delivery
- **Image Sharing**: Send and receive images in chat rooms via gallery selection
- **Authentication**: Sign in with email/password or Google Sign-In
- **Multiple Chat Rooms**: Join different themed chat rooms like "The Pond", "Lakeside", and "The Quack Shack"
- **Cross-Platform**: Runs on both iOS and Android devices

## Tech Stack

- **React Native 0.78.1** - Cross-platform mobile development
- **Firebase** - Backend services including:
  - Authentication
  - Firestore (Database)
  - Storage (Image uploads)
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
   git clone <repository-url>
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
│   ├── components/          # Reusable UI components
│   │   ├── MessageItem.tsx  # Individual message display
│   │   └── RoomItem.tsx     # Chat room list item
│   ├── contexts/            # React Context providers
│   │   ├── auth.context.tsx     # Authentication state management
│   │   ├── messages.context.tsx # Message handling and real-time updates
│   │   └── rooms.context.tsx    # Chat room management
│   ├── screens/             # Application screens
│   │   ├── chatRoom.tsx     # Individual chat room
│   │   ├── home.tsx         # Main screen with room list
│   │   ├── signIn.tsx       # Sign in screen
│   │   ├── signUp.tsx       # Sign up screen
│   │   └── splashScreen.tsx # App loading screen
│   └── assets/              # Images and static resources
├── android/                 # Android-specific files
└── ios/                     # iOS-specific files
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

## Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Firebase Storage
5. Download configuration files and place them in the appropriate directories

### Google Sign-In Configuration

Update the client IDs in [`app/contexts/auth.context.tsx`](app/contexts/auth.context.tsx):

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
  iosClientId: 'YOUR_IOS_CLIENT_ID',
});
```

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
