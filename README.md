# ymove-mobile-fitness-expo

A small workout app built with **Expo, React Native and TypeScript** on top of the [YMove Exercise API](https://ymove.app/exercise-api). It generates a workout and plays real exercise videos: filmed with physiotherapists and personal trainers, no GIFs and no AI-generated movement. The player layout is modelled on apps like Centr and Fitplan.

## What's in here

- **Workout list:** a generated chest workout with a thumbnail and sets × reps for each exercise.
- **Workout player:** the exercise video loops muted in a portrait frame, with a "Next" preview, sets × reps in large numbers and previous / done set / next buttons.
- **Portrait video done right:** most clips are filmed for phones (about 9:16). The player reads each clip's `orientation` and sizes the frame to match, so there are no black bars.
- **The next clip preloads:** while you do an exercise, the next video already loads in the background, so it starts without a spinner.
- Uses the official [`ymove-exercise-api`](https://www.npmjs.com/package/ymove-exercise-api) SDK and [`expo-video`](https://docs.expo.dev/versions/latest/sdk/video/).
- Dark theme, lime accent.

## Run it

You need [Node.js](https://nodejs.org) and either the [Expo Go](https://expo.dev/go) app on your phone or an iOS or Android simulator.

```bash
git clone https://github.com/ymove-app/ymove-mobile-fitness-expo
cd ymove-mobile-fitness-expo
npm install
```

Get a free trial key at [ymove.app/exercise-api/signup](https://ymove.app/exercise-api/signup) and add it in one of two ways.

Option 1, an `.env` file:

```bash
cp .env.example .env
# then set EXPO_PUBLIC_YMOVE_API_KEY=your_key_here
```

Option 2, `app.json`:

```json
{
  "expo": {
    "extra": { "ymoveApiKey": "your_key_here" }
  }
}
```

Start the app:

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS simulator or `a` for the Android emulator.

## How it works

```ts
// lib/ymove.ts
import { YMoveClient } from 'ymove-exercise-api';
export const ymove = new YMoveClient(apiKey);

// App.tsx
const workout = await ymove.workouts.generate({
  muscleGroup: 'chest',
  difficulty: 'intermediate',
  exerciseCount: 5,
});
```

The player picks the primary clip of each exercise and plays it with `expo-video`:

```tsx
const player = useVideoPlayer({ uri: clip.videoUrl }, (p) => {
  p.loop = true;
  p.muted = true;
  p.play();
});

<VideoView player={player} style={{ height: '100%', aspectRatio: 9 / 16 }} contentFit="cover" />
```

The SDK uses plain `fetch`, so it works in React Native without extra setup.

## Good to know

- **Video URLs expire after 48 hours.** They are signed CDN links. Don't store them. Store the exercise `id` and fetch fresh data when you show the video.
- **Keep your key off the client in production.** This example calls the API straight from the app to keep it short. In a real app, put a small server or edge function in between so the key never ships inside the app bundle.
- **Gyms often have bad reception.** In production, download a workout's clips when the user opens it (for example with `expo-file-system`) and play the local files during training. Store them under the exercise `id`, not the signed URL.

## Ideas to extend it

- A rest timer between sets
- A Browse tab for the exercise library, like the web [`ymove-exercise-browser`](https://github.com/ymove-app/ymove-exercise-browser) example
- A logbook that saves completed sets and syncs when the phone is back online
- A switch between the white-background studio clips and gym-shot clips (`videoTag`)

## Build with Claude

Connect the YMove MCP server in Claude Code and ask, for example:

> Add a rest timer overlay to the PlayerView that counts down `restSeconds` after each set.

Built with Expo SDK 57.

## License

MIT
