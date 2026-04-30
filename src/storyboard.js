import { COLORS, FONTS } from './config/constants.js';
import { ENDING_STORYBOARD_FRAMES, STORYBOARD_FRAMES } from './config/assets.js';

// DOM storyboard overlays run outside Phaser so comic panels can fill the browser cleanly.
export function createIntroElement(tagName, styles = {}, text = "") {
  const element = document.createElement(tagName);

  Object.assign(element.style, styles);

  if (text) {
    element.textContent = text;
  }

  return element;
}

export function loadStoryboardImage(frame) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
      resolve({ ...frame, image });
    };
    image.onerror = reject;
    image.src = frame.url;
  });
}

export function showStoryboard(frames, onComplete, options = {}) {
  let currentFrameIndex = 0;
  let isFinished = false;
  let isTransitioning = false;
  let loadedFrames = [];
  let transitionTimer = null;
  let settleTimer = null;
  const altPrefix = options.altPrefix || "Storyboard panel";
  const lastPrompt = options.lastPrompt || "Press SPACE to start";

  const overlay = createIntroElement("div", {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "24px",
    background: "#120d07",
    color: COLORS.white,
    fontFamily: FONTS.ui,
    opacity: "1",
    transition: "opacity 180ms ease"
  });
  const imageStage = createIntroElement("div", {
    width: "100%",
    height: "100%",
    minHeight: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });
  const imageFrame = createIntroElement("div", {
    position: "relative",
    display: "inline-flex",
    maxWidth: "100%",
    maxHeight: "100%",
    boxSizing: "border-box",
    background: "#fff0bf",
    border: "4px solid #2c170b",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    opacity: "1",
    transform: "translateX(0) scale(1)",
    willChange: "opacity, transform"
  });
  const image = createIntroElement("img", {
    maxWidth: "calc(100vw - 56px)",
    maxHeight: "calc(100vh - 56px)",
    display: "block",
    objectFit: "contain",
    imageRendering: "auto"
  });
  const promptText = createIntroElement("div", {
    position: "absolute",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    color: COLORS.white,
    fontFamily: '"Courier New", monospace',
    fontSize: "clamp(12px, 1.4vw, 18px)",
    fontWeight: "700",
    lineHeight: "1",
    letterSpacing: "0",
    pointerEvents: "none",
    textAlign: "center",
    textShadow:
      "2px 0 #120d07, -2px 0 #120d07, 0 2px #120d07, 0 -2px #120d07, 2px 2px #120d07",
    whiteSpace: "nowrap"
  }, "Loading...");

  const skipButton = createIntroElement("button", {
    position: "absolute",
    top: "24px",
    right: "24px",
    background: "rgba(0, 0, 0, 0.6)",
    color: COLORS.white,
    fontFamily: '"Courier New", monospace',
    fontSize: "14px",
    fontWeight: "700",
    border: "2px solid #fff0bf",
    padding: "8px 16px",
    cursor: "pointer",
    zIndex: "10000"
  }, "Skip (Esc)");

  imageFrame.append(image, promptText);
  imageStage.appendChild(imageFrame);
  overlay.appendChild(imageStage);
  overlay.appendChild(skipButton);
  document.body.appendChild(overlay);

  skipButton.onclick = () => {
    finishIntro();
  };

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.clearTimeout(transitionTimer);
    window.clearTimeout(settleTimer);
    overlay.remove();
  };
  const finishIntro = () => {
    if (isFinished) {
      return;
    }

    isFinished = true;
    overlay.style.opacity = "0";
    window.setTimeout(() => {
      cleanup();
      onComplete();
    }, 180);
  };
  const updateFrameContent = () => {
    const frame = loadedFrames[currentFrameIndex];

    image.src = frame.image.src;
    image.alt = `${altPrefix} ${currentFrameIndex + 1}`;
    promptText.textContent =
      currentFrameIndex === loadedFrames.length - 1
        ? lastPrompt
        : "Press SPACE for next image";
  };
  const showFrame = (direction = 1) => {
    updateFrameContent();
    imageFrame.style.transition = "none";
    imageFrame.style.opacity = "0";
    imageFrame.style.transform = `translateX(${28 * direction}px) scale(0.985)`;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        imageFrame.style.transition = "opacity 240ms ease-out, transform 240ms ease-out";
        imageFrame.style.opacity = "1";
        imageFrame.style.transform = "translateX(0) scale(1)";
        settleTimer = window.setTimeout(() => {
          isTransitioning = false;
        }, 240);
      });
    });
  };
  function advanceFrame() {
    if (!loadedFrames.length || isTransitioning) {
      return;
    }

    if (currentFrameIndex >= loadedFrames.length - 1) {
      finishIntro();
      return;
    }

    isTransitioning = true;
    imageFrame.style.transition = "opacity 160ms ease-in, transform 160ms ease-in";
    imageFrame.style.opacity = "0";
    imageFrame.style.transform = "translateX(-28px) scale(0.985)";

    transitionTimer = window.setTimeout(() => {
      currentFrameIndex += 1;
      showFrame(1);
    }, 160);
  }
  function handleKeyDown(event) {
    if (event.repeat) {
      return;
    }

    if (event.code === "Escape") {
      event.preventDefault();
      finishIntro();
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      advanceFrame();
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  Promise.all(frames.map(loadStoryboardImage))
    .then((frames) => {
      loadedFrames = frames;
      isTransitioning = true;
      showFrame(1);
    })
    .catch(() => {
      finishIntro();
    });
}

export function showOpeningStoryboard(onComplete) {
  showStoryboard(STORYBOARD_FRAMES, onComplete, {
    altPrefix: "Opening storyboard panel",
    lastPrompt: "Press SPACE to start"
  });
}

export function showEndingStoryboard(onComplete) {
  showStoryboard(ENDING_STORYBOARD_FRAMES, onComplete, {
    altPrefix: "Ending storyboard panel",
    lastPrompt: "Press SPACE to continue"
  });
}

export function playEndingStoryboardThenStartWin(scene) {
  if (scene.endingStoryboardStarting) {
    return;
  }

  scene.endingStoryboardStarting = true;
  showEndingStoryboard(() => {
    scene.scene.start("WinScene");
  });
}

