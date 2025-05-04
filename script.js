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
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('href').substring(1));
            
            document.querySelectorAll('.nav-links li').forEach(li => {
                li.classList.remove('active');
            });
            
            link.parentElement.classList.add('active');
        });
    });
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    }
    
    // Play all button
    if (playAllBtn) {
        playAllBtn.addEventListener('click', playAllLikedSongs);
    }
    
    // Clear cache
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active-page');
        
        // Load content for specific pages
        if (pageId === 'liked') {
            renderLikedSongs();
        }
    }
}

// Theme functions
function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
}

function setTheme(newTheme) {
    theme = newTheme;
    document.body.className = `${theme}-mode`;
    
    // Update toggle button icon
    if (themeToggle) {
        themeToggle.innerHTML = `<i class="fas fa-${theme === 'light' ? 'moon' : 'sun'}"></i>`;
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
}

// Player controls
function togglePlay() {
    if (!currentTrack) return;
    
    if (isPlaying) {
        if (player && player.pauseVideo) {
            player.pauseVideo();
        } else {
            audioPlayer.pause();
        }
    } else {
        if (player && player.playVideo) {
            player.playVideo();
        } else {
            audioPlayer.play().catch(e => {
                console.error('Audio playback error:', e);
                handlePlaybackError();
            });
        }
    }
}

function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

function playTrack(track, index = 0) {
    if (!track) return;
    
    currentTrack = track;
    currentTrackIndex = index;
    
    // Try YouTube player first
    if (player && player.loadVideoById) {
        player.loadVideoById(track.videoId);
        player.playVideo().catch(e => {
            console.error('YouTube playback error:', e);
            handlePlaybackError();
        });
    } else {
        // Fallback to audio element
        audioPlayer.src = `https://www.youtube.com/watch?v=${track.videoId}`;
        audioPlayer.play().catch(e => {
            console.error('Fallback playback error:', e);
            alert('Playback failed. Please try another song.');
        });
    }
    
    // Add to recently played
    addToRecentlyPlayed(track);
    
    // Update UI
    updateNowPlayingInfo();
    updateLikeButton();
    updateQueueDisplay();
    
    // Try to fetch lyrics
    fetchLyrics(track);
}

function updateNowPlayingInfo() {
    if (!currentTrack) return;
    
    nowPlayingTitle.textContent = currentTrack.title;
    nowPlayingArtist.textContent = currentTrack.artist || 'Unknown Artist';
    nowPlayingCover.src = currentTrack.thumbnail || 'assets/default-cover.jpg';
    document.title = `${currentTrack.title} - AriX Player`;
}

function prevTrack() {
    if (queue.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
    playTrack(queue[currentTrackIndex], currentTrackIndex);
}

function nextTrack() {
    if (queue.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % queue.length;
    playTrack(queue[currentTrackIndex], currentTrackIndex);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    
    if (isShuffled) {
        shuffleQueue();
    }
}

function shuffleQueue() {
    if (queue.length <= 1) return;
    
    // Save current track
    const current = queue[currentTrackIndex];
    
    // Shuffle the rest
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    
    // Find the new index of the current track
    currentTrackIndex = queue.indexOf(current);
    
    updateQueueDisplay();
}

function toggleRepeat() {
    isRepeated = !isRepeated;
    repeatBtn.classList.toggle('active', isRepeated);
}

function toggleLike() {
    if (!currentTrack) return;
    
    const index = likedTracks.findIndex(t => t.videoId === currentTrack.videoId);
    
    if (index === -1) {
        likedTracks.push(currentTrack);
    } else {
        likedTracks.splice(index, 1);
    }
    
    updateLikeButton();
    saveData();
    renderLikedSongs();
}

function updateLikeButton() {
    if (!currentTrack) return;
    
    const isLiked = likedTracks.some(t => t.videoId === currentTrack.videoId);
    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.innerHTML = `<i class="fas fa-heart${isLiked ? '' : '-o'}"></i>`;
}

// Progress controls
function updateProgress() {
    if (!currentTrack) return;
    
    let duration, currentTime;
    
    if (player && player.getDuration) {
        duration = player.getDuration();
        currentTime = player.getCurrentTime();
    } else {
        duration = audioPlayer.duration || 0;
        currentTime = audioPlayer.currentTime || 0;
    }
    
    // Update progress slider
    if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        progressSlider.value = progressPercent;
    }
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
    
    // Continue updating if playing
    if (isPlaying) {
        requestAnimationFrame(updateProgress);
    }
}

function seekTo(e) {
    if (!currentTrack) return;
    
    const seekPercent = e.target.value;
    
    if (player && player.getDuration) {
        const duration = player.getDuration();
        const seekTime = (seekPercent / 100) * duration;
        player.seekTo(seekTime, true);
    } else if (audioPlayer.duration) {
        const seekTime = (seekPercent / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Volume controls
function setVolume() {
    volume = this.value;
    audioPlayer.volume = volume / 100;
    
    if (player && player.setVolume) {
        player.setVolume(volume);
    }
    
    // Update volume icon
    updateVolumeIcon();
}

function toggleMute() {
    isMuted = !isMuted;
    
    if (player && player.setVolume) {
        player.setVolume(isMuted ? 0 : volume);
    } else {
        audioPlayer.volume = isMuted ? 0 : volume / 100;
    }
    
    updateVolumeIcon();
}

function updateVolumeIcon() {
    if (isMuted || volume == 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 50) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Queue management
function addToQueue(track, playNow = false) {
    if (playNow) {
        queue.unshift(track);
        playTrack(track, 0);
    } else {
        queue.push(track);
    }
    
    updateQueueDisplay();
}

function updateQueueDisplay() {
    const nowPlayingItem = document.getElementById('now-playing-queue-item');
    const upcomingQueue = document.getElementById('upcoming-queue');
    
    // Clear existing items
    nowPlayingItem.innerHTML = '';
    upcomingQueue.innerHTML = '';
    
    if (!currentTrack) return;
    
    // Add current track
    nowPlayingItem.innerHTML = `
        <div class="queue-item">
            <img src="${currentTrack.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="queue-item-img">
            <div class="queue-item-info">
                <h5>${currentTrack.title}</h5>
               