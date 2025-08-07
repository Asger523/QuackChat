import React, {createContext} from 'react';

// Define the context interface
interface NotificationContextInterface {
  fcmToken: string | null;
  isNotificationEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<boolean>;
  subscribeToRoom: (roomId: string) => Promise<void>;
  unsubscribeFromRoom: (roomId: string) => Promise<void>;
  promptForRoomNotificationSubscription: (
    roomId: string,
    roomName: string,
  ) => Promise<boolean>;
  checkIfUserHasMessagesInRoom: (roomId: string) => Promise<boolean>;
}

// Create the context
export const NotificationContext = createContext<NotificationContextInterface>({
  fcmToken: null,
  isNotificationEnabled: false,
  requestPermission: async () => false,
  checkPermissionStatus: async () => false,
  subscribeToRoom: async () => {},
  unsubscribeFromRoom: async () => {},
  promptForRoomNotificationSubscription: async () => false,
  checkIfUserHasMessagesInRoom: async () => false,
});

export const NotificationProvider = ({children}) => {
  // Simple state management - no logic here
  const contextValue: NotificationContextInterface = {
    fcmToken: null,
    isNotificationEnabled: false,
    requestPermission: async () => false,
    checkPermissionStatus: async () => false,
    subscribeToRoom: async () => {},
    unsubscribeFromRoom: async () => {},
    promptForRoomNotificationSubscription: async () => false,
    checkIfUserHasMessagesInRoom: async () => false,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
