import * as THREE from 'three';

let videoElement = null;
let currentVideoSrc = null;
let videoTexture = null;
let currentMode = 'reset';

const workVideos = Object.keys(
  import.meta.glob('/public/videos/work/*.mp4', { eager: true })
).map(path => '/' + path.replace('/public/', ''));

const breakVideos = Object.keys(
  import.meta.glob('/public/videos/break/*.mp4', { eager: true })
).map(path => '/' + path.replace('/public/', ''));

export function createVideo() {
  videoElement = document.createElement('video');
  videoElement.src = '/videos/tv-sin-señal.mp4';
  videoElement.loop = true;
  videoElement.muted = true;
  currentVideoSrc = '/videos/tv-sin-señal.mp4';

  videoElement.addEventListener('ended', handleVideoEnded);

  videoElement.load();
  videoElement.play().catch(err => console.error('Video play failed:', err));

  videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  return { video: videoElement, videoTexture };
}

function handleVideoEnded() {
  if (currentMode === 'work') {
    loadRandomVideoFromArray(workVideos);
  } else if (currentMode === 'shortBreak' || currentMode === 'longBreak') {
    loadRandomVideoFromArray(breakVideos);
  }
}

function loadRandomVideoFromArray(videos) {
  if (videos.length === 0) {
    console.warn('No videos found, using fallback');
    return false;
  }

  const randomIndex = Math.floor(Math.random() * videos.length);
  const newSrc = videos[randomIndex];

  if (newSrc === currentVideoSrc && videos.length > 1) {
    const nextIndex = (randomIndex + 1) % videos.length;
    return setVideoSrc(videos[nextIndex]);
  }

  return setVideoSrc(newSrc);
}

function setVideoSrc(src) {
  if (!videoElement) return false;

  videoElement.src = src;
  currentVideoSrc = src;
  videoElement.loop = (src === '/videos/tv-sin-señal.mp4');
  videoTexture.image = videoElement;
  videoTexture.needsUpdate = true;

  videoElement.load();
  videoElement.play().catch(err => console.error('Video play failed:', err));

  return true;
}

export async function setVideoMode(mode) {
  currentMode = mode;

  switch (mode) {
    case 'reset':
      return setVideoSrc('/videos/tv-sin-señal.mp4');

    case 'work':
      return loadRandomVideoFromArray(workVideos);

    case 'shortBreak':
    case 'longBreak':
      return loadRandomVideoFromArray(breakVideos);

    default:
      console.warn(`Unknown video mode: ${mode}`);
      return setVideoSrc('/videos/tv-sin-señal.mp4');
  }
}

export function getVideoElement() {
  return videoElement;
}
