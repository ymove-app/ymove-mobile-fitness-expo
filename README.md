# ymove-mobile-fitness-expo

Native mobile workout app built with **Expo + React Native + TypeScript** on top of the [ymove Exercise Video API](https://ymove.app/exercise-api). Demonstrates the SDK works in React Native and shows a workout-player layout modelled on Centr + Fitplan.

**Live demo:** [Expo Snack](https://snack.expo.dev) — _link added with first publish_. Scan the QR with [Expo Go](https://expo.dev/go) to run on a real device.

## What's in here

- **Exercise list screen** — generated workout displayed as a tappable list with thumbnail + sets×reps preview
- **Workout player screen** — full-bleed video hero (image fallback for now), "Next: …" preview pin in the bottom corner (Fitplan pattern), giant tabular sets×reps numerals, prev/done-set/next transport bar at the bottom (Centr pattern)
- Uses the official **`ymove-exercise-api`** SDK — same API surface as the web examples
- Dark theme, lime accent

## Run locally

```bash
git clone https://github.com/ymoveapp/ymove-mobile-fitness-expo
cd ymove-mobile-fitness-expo
npm install
npx expo start
```

Then either:
- Press `i` to open iOS simulator (requires Xcode), or
- Press `a` for Android emulator, or
- Scan the QR code with the [Expo Go app](https://expo.dev/go) on your phone

## API key

The demo key (`'demo'`) is enough to run the app — gets you 10 exercises/month. For real use, get a free trial key at [ymove.app/exercise-api/signup](https://ymove.app/exercise-api/signup) and set it in `app.json`:

```json
{
  "expo": {
    ...
    "extra": { "ymoveApiKey": "your_key_here" }
  }
}
```

Or via env var: `EXPO_PUBLIC_YMOVE_API_KEY=your_key_here npx expo start`.

## How it works

```ts
// lib/ymove.ts
import { YMoveClient } from 'ymove-exercise-api';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.ymoveApiKey || 'demo';
export const ymove = new YMoveClient(apiKey);

// App.tsx
const workout = await ymove.workouts.generate({
  muscleGroup: 'chest',
  difficulty: 'intermediate',
  exerciseCount: 5,
});
```

The SDK's pure-`fetch` HTTP transport works in React Native without any extra setup.

## Next steps to extend

- Wire a real video player (`expo-av` or `react-native-video`) to `current.exercise.videoUrl` and `videoHlsUrl`
- Add a rest-timer overlay countdown between sets
- Add a Browse tab (exercise library) like the web `ymove-exercise-browser` example
- Add a Logbook tab to persist completed sets

## Build with Claude

Hook up the ymove MCP server in Claude Code and ask:

> Add an expo-av video player to the PlayerView that plays current.exercise.videoUrl while keeping the "Next: ..." preview pin visible.

The SDK exposes `videoUrl`, `videoHlsUrl`, and `thumbnailUrl` on every exercise.

## License

MIT
