import { YMoveClient } from 'ymove-exercise-api';
import Constants from 'expo-constants';

// Reads YMOVE_API_KEY from expo-constants (app.json `extra.ymoveApiKey`) or
// falls back to the demo key (10 exercises/month). Set `extra.ymoveApiKey` in
// app.json or override at runtime for higher limits.
const extra = (Constants.expoConfig?.extra ?? {}) as { ymoveApiKey?: string };
const apiKey = extra.ymoveApiKey?.trim() || process.env.EXPO_PUBLIC_YMOVE_API_KEY || 'demo';

export const ymove = new YMoveClient(apiKey);
