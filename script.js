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
const likeBtn = document.getElementById('like-btn');
const queueBtn = document.getElementById('queue-btn');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const nowPlayingCover = document.getElementById('now-playing-cover');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const queueModal = document.getElementById('queue-modal');
const playlistModal = document.getElementById('playlist-modal');
const closeModals = document.querySelectorAll('.close-modal');
const createPlaylistBtn = document.querySelector('.create-playlist-btn');
const playlistForm = document.getElementById('playlist-form');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    showPage('home');
    fetchTopCharts();
    fetchRecommendations();
    
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
    player.setVolume(volume);
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
function setupEventListeners()
    // Player controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    likeBtn.addEventListener('click', toggleLike);
    queueBtn.addEventListener('click', () => queueModal.classList.add('active'));
    
    // Volume control
    volumeSlider.addEventListener('input', setVolume);
    volumeBtn.addEventListener('click', toggleMute);