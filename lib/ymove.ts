import { YMoveClient } from 'ymove-exercise-api';
import Constants from 'expo-constants';

// Reads the API key from app.json (`expo.extra.ymoveApiKey`) or from the
// EXPO_PUBLIC_YMOVE_API_KEY environment variable (see .env.example).
// Get a free trial key at https://ymove.app/exercise-api/signup
const extra = (Constants.expoConfig?.extra ?? {}) as { ymoveApiKey?: string };
export const apiKey = (extra.ymoveApiKey?.trim() || process.env.EXPO_PUBLIC_YMOVE_API_KEY || '').trim();

export const ymove = new YMoveClient(apiKey);
