// Mirrors the mood values set in backend main.py's update_emotional_state():
// "happy", "sad", "upset", "anxious", "excited", "neutral"
export const MOOD_MAP = {
  happy: { emoji: '😊', label: 'Happy', color: 'var(--color-mood-happy)' },
  sad: { emoji: '😔', label: 'Sad', color: 'var(--color-mood-sad)' },
  upset: { emoji: '😡', label: 'Upset', color: 'var(--color-mood-upset)' },
  sleepy: { emoji: '😴', label: 'Sleepy', color: 'var(--color-mood-sleepy)' },
  anxious: { emoji: '😟', label: 'Anxious', color: 'var(--color-mood-anxious)' },
  excited: { emoji: '🤩', label: 'Excited', color: 'var(--color-mood-excited)' },
  neutral: { emoji: '🙂', label: 'Neutral', color: 'var(--color-mood-neutral)' },
}

export function getMoodMeta(mood) {
  return MOOD_MAP[mood?.toLowerCase()] || MOOD_MAP.neutral
}
