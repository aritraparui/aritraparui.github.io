const API_KEY = "AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU";

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const pages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('nav button');
  const themeToggle = document.getElementById('toggle-theme');
  const playPauseButton = document.getElementById('play-pause');
  const currentSong = document.getElementById('current-song');
  let isDarkMode = false;
  let isPlaying = false;

  // Navigation
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      pages.forEach(page => page.classList.remove('active'));
      document.getElementById(button.dataset.page).classList.add('active');
    });
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
  });

  // Mock playlist
  const playlist = [
    { title: "Song 1", artist: "Artist 1" },
    { title: "Song 2", artist: "Artist 2" },
    { title: "Song 3", artist: "Artist 3" },
  ];
  const playlistContainer = document.getElementById('playlist');
  playlist.forEach((song, index) => {
    const songElement = document.createElement('div');
    songElement.textContent = `${song.title} - ${song.artist}`;
    songElement.dataset.index = index;
    songElement.addEventListener('click', () => playSong(index));
    playlistContainer.appendChild(songElement);
  });

  // Player controls
  function playSong(index) {
    const song = playlist[index];
    currentSong.textContent = `Playing: ${song.title} by ${song.artist}`;
    isPlaying = true;
    playPauseButton.textContent = '⏸️';
  }

  playPauseButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseButton.textContent = isPlaying ? '⏸️' : '▶️';
  });
});