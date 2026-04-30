// Central audio state keeps menu toggles, music playback, and generated SFX in sync.
export const sharedState = {
  musicOn: true,
  soundOn: true,
  currentMusicKey: null,
  currentMusicInfo: null
};

export function playBackgroundMusic(scene, key) {
  if (sharedState.currentMusicKey === key) {
    if (!sharedState.musicOn && sharedState.currentMusicInfo && sharedState.currentMusicInfo.isPlaying) {
      sharedState.currentMusicInfo.pause();
    } else if (sharedState.musicOn && sharedState.currentMusicInfo && sharedState.currentMusicInfo.isPaused) {
      sharedState.currentMusicInfo.resume();
    }
    return;
  }
  
  if (sharedState.currentMusicInfo) {
    sharedState.currentMusicInfo.stop();
    sharedState.currentMusicInfo.destroy();
  }
  
  sharedState.currentMusicKey = key;
  
  if (!key) {
    sharedState.currentMusicInfo = null;
    return;
  }
  
  sharedState.currentMusicInfo = scene.sound.add(key, { loop: true, volume: 0.4 });
  
  if (sharedState.musicOn) {
    sharedState.currentMusicInfo.play();
  }
}

export function updateMusicSetting() {
  if (sharedState.currentMusicInfo) {
    if (sharedState.musicOn) {
      if (sharedState.currentMusicInfo.isPaused) {
        sharedState.currentMusicInfo.resume();
      } else if (!sharedState.currentMusicInfo.isPlaying) {
        sharedState.currentMusicInfo.play();
      }
    } else {
      if (sharedState.currentMusicInfo.isPlaying) {
        sharedState.currentMusicInfo.pause();
      }
    }
  }
}

export function getMusicSettingLabel() {
  return `Music: ${sharedState.musicOn ? "On" : "Off"}`;
}

export function getSoundSettingLabel() {
  return `Scuttle SFX: ${sharedState.soundOn ? "On" : "Off"}`;
}

export function resumeAudioContext(scene) {
  if (!scene.sound?.context) {
    return null;
  }

  const audioContext = scene.sound.context;

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {
      // Browsers may block auto-resume until another gesture; failing quietly keeps UI responsive.
    });
  }

  return audioContext;
}

export function playGeneratedSound(scene, notes, masterVolume = 0.05) {
  if (!sharedState.soundOn || !notes.length) {
    return;
  }

  const audioContext = resumeAudioContext(scene);

  if (!audioContext) {
    return;
  }

  const masterGain = audioContext.createGain();
  const sequenceStart = audioContext.currentTime + 0.01;
  let cursor = sequenceStart;

  masterGain.gain.setValueAtTime(masterVolume, sequenceStart);
  masterGain.connect(audioContext.destination);

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const duration = note.duration ?? 0.08;
    const frequency = note.frequency ?? 440;
    const endFrequency = note.endFrequency ?? frequency;
    const noteVolume = note.volume ?? 1;
    const startTime = cursor + (note.delay ?? 0);
    const attackTime = Math.min(0.015, duration * 0.35);
    const releaseStart = Math.max(startTime + attackTime, startTime + duration - 0.03);

    oscillator.type = note.type ?? "square";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.linearRampToValueAtTime(endFrequency, startTime + duration);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, noteVolume),
      startTime + attackTime
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseStart + 0.03);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);

    cursor = startTime + duration;
  });

  window.setTimeout(() => {
    masterGain.disconnect();
  }, Math.max(120, Math.ceil((cursor - sequenceStart) * 1000) + 120));
}

export function playSoundCue(scene, cue) {
  switch (cue) {
    case "ui-hover":
      playGeneratedSound(
        scene,
        [{ frequency: 620, endFrequency: 700, duration: 0.045, volume: 0.45 }],
        0.035
      );
      break;
    case "ui-click":
      playGeneratedSound(
        scene,
        [{ frequency: 420, endFrequency: 320, duration: 0.08, volume: 0.7, type: "triangle" }],
        0.04
      );
      break;
    case "jump":
      playGeneratedSound(
        scene,
        [{ frequency: 260, endFrequency: 390, duration: 0.09, volume: 0.55 }],
        0.035
      );
      break;
    case "death":
      playGeneratedSound(
        scene,
        [
          { frequency: 240, endFrequency: 150, duration: 0.12, volume: 0.55, type: "sawtooth" },
          { frequency: 150, endFrequency: 92, duration: 0.14, volume: 0.48, type: "sawtooth" }
        ],
        0.045
      );
      break;
    case "dry":
      playGeneratedSound(
        scene,
        [
          { frequency: 180, endFrequency: 120, duration: 0.1, volume: 0.5, type: "triangle" },
          { frequency: 120, endFrequency: 84, duration: 0.12, volume: 0.42, type: "triangle" }
        ],
        0.04
      );
      break;
    case "clear":
      playGeneratedSound(
        scene,
        [
          { frequency: 420, endFrequency: 420, duration: 0.07, volume: 0.6, type: "triangle" },
          { frequency: 560, endFrequency: 560, duration: 0.08, volume: 0.62, type: "triangle", delay: 0.01 },
          { frequency: 740, endFrequency: 740, duration: 0.12, volume: 0.68, type: "triangle", delay: 0.015 }
        ],
        0.045
      );
      break;
    default:
      break;
  }
}

