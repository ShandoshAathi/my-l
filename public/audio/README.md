# Custom Music Directory 🎵

Place your custom MP3 background song here (e.g., `romantic-piano.mp3`).

## Configuration
In `src/config/birthdayConfig.ts`:
```ts
music: {
  title: "Our Favorite Song",
  artist: "Artist Name",
  src: "/audio/romantic-piano.mp3",
  fallbackProcedural: true
}
```

If no MP3 file is placed here, Birthday Bloom automatically engages its built-in procedural Web Audio API romantic synthesizer so beautiful music always plays flawlessly!
