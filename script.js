// Global variables
let player;
let currentTrack = null;
let queue = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeated = false;
let volume = 80;
let isMuted = false;
let likedTracks = [];
let playlists = [];
let recentlyPlayed = [];
let searchResults = {};
let theme = 'light';

// YouTube API Key
const YOUTUBE_API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressSlider = document.getElementById('progress-slider');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const volumeBtn = document.getElementById('volume-btn');
const likeBtn = document.getElementById('like-btn');
const queueBtn = document.getElementById('queue-btn');
const lyricsBtn = document.getElementById('lyrics-btn');
const queueModal = document.getElementById('queue-modal');
const lyricsModal = document.getElementById('lyrics-modal');
const closeModals = document.querySelectorAll('.close-modal');
const playlistModal = document.getElementById('playlist-modal');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistForm = document.getElementById('playlist-form');
const searchInput = document.getElementById('search-input');
const homeSearchInput = document.getElementById('home-search-input');
const searchBtn = document.getElementById('search-btn');
const homeSearchBtn = document.getElementById('home-search-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const nowPlayingCover = document.getElementById('now-playing-cover');
const themeToggle = document.getElementById('theme-toggle');
const themeSelect = document.getElementById('theme-select');
const playAllBtn = document.getElementById('play-all-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    showPage('home');
    fetchTopCharts();
    fetchRecommendations();
    fetchNewReleases();
    
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Initialize volume
    audioPlayer.volume = volume / 100;
    volumeSlider.value = volume;
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
});

// YouTube Player API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 0,
            'modestbranding': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
}

function onPlayerStateChange(event) {
    switch(event.data) {
        case YT.PlayerState.PLAYING:
            isPlaying = true;
            updatePlayButton();
            updateNowPlayingInfo();
            updateProgress();
            break;
        case YT.PlayerState.PAUSED:
            isPlaying = false;
            updatePlayButton();
            break;
        case YT.PlayerState.ENDED:
            if (isRepeated) {
                player.playVideo();
            } else {
                nextTrack();
            }
            break;
        case YT.PlayerState.BUFFERING:
            console.log('Buffering...');
            break;
        case YT.PlayerState.CUED:
            console.log('Video cued');
            break;
        case YT.PlayerState.ERROR:
            console.error('YouTube player error');
            handlePlaybackError();
            break;
    }
}

function handlePlaybackError() {
    if (!currentTrack) return;
    
    // Fallback to audio element
    console.log('Attempting fallback playback');
    audioPlayer.src = `https://www.youtube.com/watch?v=${currentTrack.videoId}`;
    audioPlayer.play().catch(e => {
        console.error('Fallback playback failed:', e);
        alert('Playback failed. Please try another song.');
    });
}

// Load data from localStorage
function loadData() {
    likedTracks = JSON.parse(localStorage.getItem('likedTracks')) || [];
    playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
    theme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    setTheme(theme);
    if (themeSelect) themeSelect.value = theme;
    
    renderPlaylists();
    renderRecentlyPlayed();
    renderLikedSongs();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
    localStorage.setItem('playlists', JSON.stringify(playlists));
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    localStorage.setItem('theme', theme);
}

// Setup event listeners
function setupEventListeners() {
    // Player controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    likeBtn.addEventListener('click', toggleLike);
    queueBtn.addEventListener('click', () => queueModal.classList.add('active'));
    lyricsBtn.addEventListener('click', showLyrics);
    
    // Progress control
    progressSlider.addEventListener('input', seekTo);
    progressSlider.addEventListener('change', seekTo);
    
    // Volume control
    volumeSlider.addEventListener('input', setVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Playlist creation
    createPlaylistBtn.addEventListener('click', () => playlistModal.classList.add('active'));
    playlistForm.addEventListener('submit', createPlaylist);
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    homeSearchBtn.addEventListener('click', () => {
        const query = homeSearchInput.value.trim();
        if (query) {
            searchInput.value = query;
            performSearch();
        }
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    homeSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = homeSearchInput.value.trim();
            if (query) {
                searchInput.value = query;
                performSearch();
            }
        }
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
    
    // Navigation
   