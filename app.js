document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU";
  const audio = new Audio();
  let currentSongIndex = 0;
  let playlist = [];

  const playlistContainer = document.getElementById("playlist");
  const currentSongElement = document.getElementById("current-song");
  const playPauseButton = document.getElementById("play-pause");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  async function fetchYouTubeVideos(query) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&key=${apiKey}`
    );
    const data = await response.json();
    return data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
    }));
  }

  async function searchSongs() {
    const query = searchInput.value.trim();
    if (!query) return;

    const results = await fetchYouTubeVideos(query);
    searchResults.innerHTML = "";
    results.forEach((result, index) => {
      const resultElement = document.createElement("div");
      resultElement.textContent = result.title;
      resultElement.classList.add("song");
      resultElement.addEventListener("click", () => {
        addToPlaylist(result, index);
      });
      searchResults.appendChild(resultElement);
    });
  }

  function addToPlaylist(song, index) {
    playlist.push({ title: song.title, src: `https://www.youtube.com/watch?v=${song.videoId}` });
    const songElement = document.createElement("div");
    songElement.textContent = song.title;
    songElement.classList.add("song");
    songElement.addEventListener("click", () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      audio.play();
    });
    playlistContainer.appendChild(songElement);
    loadSong(currentSongIndex);
  }

  function loadSong(index) {
    const song = playlist[index];
    audio.src = song.src;
    currentSongElement.textContent = `Now Playing: ${song.title}`;
  }

  function playPause() {
    if (audio.paused) {
      audio.play();
      playPauseButton.textContent = "⏸️";
    } else {
      audio.pause();
      playPauseButton.textContent = "▶️";
    }
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
  }

  function prevSong() {
    currentSongIndex =
      (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
  }

  playPauseButton.addEventListener("click", playPause);
  nextButton.addEventListener("click", nextSong);
  prevButton.addEventListener("click", prevSong);
  searchInput.addEventListener("input", searchSongs);
});