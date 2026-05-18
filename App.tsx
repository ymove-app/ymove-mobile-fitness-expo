import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ymove } from './lib/ymove';
import type { Workout, WorkoutExercise } from 'ymove-exercise-api';

type Screen = { kind: 'list'; workout: Workout } | { kind: 'player'; workout: Workout; index: number };

export default function App() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen['kind']>('list');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const w = await ymove.workouts.generate({
          muscleGroup: 'chest',
          difficulty: 'intermediate',
          exerciseCount: 5,
        });
        if (!cancelled) setWorkout(w);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load workout');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <ActivityIndicator color="#c4ff3d" />
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <Text style={styles.error}>{error ?? 'No workout'}</Text>
      </SafeAreaView>
    );
  }

  if (screen === 'player') {
    return (
      <PlayerView
        workout={workout}
        index={activeIndex}
        onClose={() => setScreen('list')}
        onAdvance={() => setActiveIndex((i) => Math.min(i + 1, workout.exercises.length - 1))}
        onBack={() => setActiveIndex((i) => Math.max(i - 1, 0))}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ymove example</Text>
        <Text style={styles.h1}>{workout.name}</Text>
        <Text style={styles.subtitle}>
          {workout.exercises.length} exercises · ~{workout.estimatedMinutes} min
        </Text>
      </View>

      <FlatList
        data={workout.exercises}
        keyExtractor={(item, i) => item.exercise.id ?? String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => {
              setActiveIndex(index);
              setScreen('player');
            }}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            {item.exercise.thumbnailUrl ? (
              <Image source={{ uri: item.exercise.thumbnailUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Text style={styles.thumbIdx}>{index + 1}</Text>
              </View>
            )}
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.exercise.title}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.sets} × {item.reps} · {item.restSeconds}s rest
              </Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable
        style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}
        onPress={() => {
          setActiveIndex(0);
          setScreen('player');
        }}
      >
        <Text style={styles.startBtnText}>Start workout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function PlayerView({
  workout,
  index,
  onClose,
  onAdvance,
  onBack,
}: {
  workout: Workout;
  index: number;
  onClose: () => void;
  onAdvance: () => void;
  onBack: () => void;
}) {
  const current: WorkoutExercise = workout.exercises[index];
  const next = workout.exercises[index + 1];
  const progress = ((index + 1) / workout.exercises.length) * 100;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.playerHeader}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
        <Text style={styles.playerCounter}>
          Exercise {index + 1} of {workout.exercises.length}
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Video hero — image fallback (player would use expo-av if wired) */}
      <View style={styles.videoWrap}>
        {current.exercise.thumbnailUrl ? (
          <Image source={{ uri: current.exercise.thumbnailUrl }} style={styles.video} />
        ) : (
          <View style={[styles.video, styles.thumbFallback]} />
        )}
        {next && (
          <View style={styles.nextPreview}>
            <Text style={styles.nextLabel}>Next</Text>
            <Text style={styles.nextTitle} numberOfLines={1}>
              {next.exercise.title}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.playerCard}>
        <Text style={styles.playerTitle}>{current.exercise.title}</Text>
        <Text style={styles.playerMeta}>
          {current.exercise.muscleGroup}
          {current.exercise.equipment ? ` · ${current.exercise.equipment}` : ''}
        </Text>

        <View style={styles.bigNumbers}>
          <Text style={styles.bigNumber}>{current.sets}</Text>
          <Text style={styles.bigSep}>×</Text>
          <Text style={styles.bigNumber}>{current.reps}</Text>
        </View>
        <Text style={styles.restLabel}>Rest {current.restSeconds}s between sets</Text>
      </View>

      <View style={styles.transport}>
        <Pressable
          onPress={onBack}
          disabled={index === 0}
          style={[styles.transportBtn, index === 0 && { opacity: 0.3 }]}
        >
          <Text style={styles.transportText}>‹</Text>
        </Pressable>
        <Pressable onPress={onAdvance} style={[styles.transportBtn, styles.transportBtnPrimary]}>
          <Text style={[styles.transportText, { color: '#0a0a0a' }]}>Done set</Text>
        </Pressable>
        <Pressable
          onPress={onAdvance}
          disabled={index === workout.exercises.length - 1}
          style={[styles.transportBtn, index === workout.exercises.length - 1 && { opacity: 0.3 }]}
        >
          <Text style={styles.transportText}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { alignItems: 'center', justifyContent: 'center' },
  error: { color: '#fecaca', fontSize: 14 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  eyebrow: { color: '#a3a3a3', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  h1: { color: '#fff', fontSize: 28, fontWeight: '600', marginTop: 4 },
  subtitle: { color: '#a3a3a3', fontSize: 13, marginTop: 6, fontVariant: ['tabular-nums'] },

  list: { paddingHorizontal: 20, paddingBottom: 120 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  thumb: { width: 56, height: 56, borderRadius: 6, backgroundColor: '#1f1f1f' },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  thumbIdx: { color: '#a3a3a3', fontSize: 14, fontVariant: ['tabular-nums'] },
  rowText: { marginLeft: 14, flex: 1 },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
  rowMeta: { color: '#a3a3a3', fontSize: 13, marginTop: 2, fontVariant: ['tabular-nums'] },

  startBtn: {
    position: 'absolute', bottom: 32, left: 20, right: 20,
    backgroundColor: '#c4ff3d', borderRadius: 999, paddingVertical: 16, alignItems: 'center',
  },
  startBtnText: { color: '#0a0a0a', fontSize: 16, fontWeight: '600' },

  playerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  closeBtn: { color: '#fff', fontSize: 22 },
  playerCounter: { color: '#a3a3a3', fontSize: 13, fontVariant: ['tabular-nums'] },
  progressBar: { height: 3, backgroundColor: '#1f1f1f', marginHorizontal: 20, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#c4ff3d' },

  videoWrap: { marginHorizontal: 20, marginTop: 16, aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1f1f1f' },
  video: { width: '100%', height: '100%' },
  nextPreview: {
    position: 'absolute', right: 8, bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, maxWidth: '60%',
  },
  nextLabel: { color: '#a3a3a3', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  nextTitle: { color: '#fff', fontSize: 12, marginTop: 2 },

  playerCard: { paddingHorizontal: 20, paddingTop: 20 },
  playerTitle: { color: '#fff', fontSize: 22, fontWeight: '600' },
  playerMeta: { color: '#a3a3a3', fontSize: 13, marginTop: 4 },
  bigNumbers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  bigNumber: { color: '#fff', fontSize: 64, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bigSep: { color: '#a3a3a3', fontSize: 32, marginHorizontal: 16 },
  restLabel: { color: '#a3a3a3', fontSize: 13, textAlign: 'center', marginTop: 8, fontVariant: ['tabular-nums'] },

  transport: {
    position: 'absolute', left: 20, right: 20, bottom: 32,
    flexDirection: 'row', gap: 12,
  },
  transportBtn: {
    flex: 1, height: 56, borderRadius: 999, backgroundColor: '#1f1f1f',
    alignItems: 'center', justifyContent: 'center',
  },
  transportBtnPrimary: { flex: 2, backgroundColor: '#c4ff3d' },
  transportText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
