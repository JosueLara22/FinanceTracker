
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { UserSettings } from '../types';

const SETTINGS_ID = 'currentUserSettings';

export function useUserSettings() {
  const settings = useLiveQuery(() => db.userSettings.get(SETTINGS_ID), []);

  const updateUserSettings = async (updates: Partial<Omit<UserSettings, 'id'>>) => {
    const currentSettings = await db.userSettings.get(SETTINGS_ID);
    if (currentSettings) {
      await db.userSettings.update(SETTINGS_ID, updates);
    } else {
      const defaultSettings: UserSettings = {
        id: SETTINGS_ID,
        name: 'User',
        currency: 'MXN',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        enableNotifications: true,
        enableBiometricLock: false,
        theme: 'auto',
        ...updates,
      };
      await db.userSettings.add(defaultSettings);
    }
  };

  return { 
    settings,
    updateUserSettings,
  };
}
