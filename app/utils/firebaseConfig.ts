import {initializeApp, getApps, getApp} from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBe_IxT4eoXce6ZkljEuNutjSoVEwO8JVw',
  authDomain: 'quackchat-e9301.firebaseapp.com	',
  projectId: 'quackchat-e9301',
  storageBucket: 'quackchat-e9301.firebasestorage.app',
  appId: '1:180962452617:web:0fda310b8f51b20e6dd258',
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
