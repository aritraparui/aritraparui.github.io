// Global variables
let player;
let currentTrack = null;
let queue = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeated = false;
let volume = 80;
let likedTracks = [];
let playlists = [];
let recentlyPlayed = [];
let searchResults = {};

// YouTube API Key
const YOUTUBE_API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progress = document.getElementById('progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const volumeBtn = document.getElementById('volume-btn');
const likeBtn = document.getElementById('like-btn');
const queueBtn = document.getElementById('queue-btn');
const queueModal = document.getElementById('queue-modal');
const closeModal = document.querySelector('.close-modal');
const playlistModal = document.getElementById('playlist-modal');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistForm = document.getElementById('playlist-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const nowPlayingCover = document.getElementById('now-playing-cover');

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
});

// YouTube Player API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('audio-player', {
        height: '0',
        width: '0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
    audioPlayer.volume = volume / 100;
}

function onPlayerStateChange(event) {
    switch(event.data) {
        case YT.PlayerState.PLAYING:
            isPlaying = true;
            updatePlayButton();
            updateNowPlayingInfo();
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
    }
}

// Load data from localStorage
function loadData() {
    likedTracks = JSON.parse(localStorage.getItem('likedTracks')) || [];
    playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
    
    renderPlaylists();
    renderRecentlyPlayed();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
    localStorage.setItem('playlists', JSON.stringify(playlists));
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
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
    
    // Progress bar
    progressBar.addEventListener('click', setProgress);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Volume control
    volumeSlider.addEventListener('input', setVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Queue modal
    closeModal.addEventListener('click', () => {
        queueModal.classList.remove('active');
        playlistModal.classList.remove('active');
    });
    
    // Playlist creation
    createPlaylistBtn.addEventListener('click', () => playlistModal.classList.add('active'));
    playlistForm.addEventListener('submit', createPlaylist);
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
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
}

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    document.getElementById(pageId).classList.add('active-page');
}

// Player controls
function togglePlay() {
    if (!currentTrack) return;
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
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
    
    // Load and play the video
    player.loadVideoById({
        videoId: track.videoId,
        suggestedQuality: 'small'
    });
    
    // Add to recently played
    addToRecentlyPlayed(track);
    
    // Update UI
    updateNowPlayingInfo();
    updateLikeButton();
    updateQueueDisplay();
}

function updateNowPlayingInfo() {
    if (!currentTrack) return;
    
    nowPlayingTitle.textContent = currentTrack.title;
    nowPlayingArtist.textContent = currentTrack.artist || 'Unknown Artist';
    nowPlayingCover.src = currentTrack.thumbnail || 'assets/default-cover.jpg';
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
}

function updateLikeButton() {
    if (!currentTrack) return;
    
    const isLiked = likedTracks.some(t => t.videoId === currentTrack.videoId);
    likeBtn.classList.toggle('liked', isLiked);
}

// Progress controls
function updateProgress() {
    if (!currentTrack) return;
    
    const duration = player.getDuration();
    const currentTime = player.getCurrentTime();
    
    // Update progress bar
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

function setProgress(e) {
    if (!currentTrack) return;
    
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = player.getDuration();
    const seekTime = (clickX / width) * duration;
    
    player.seekTo(seekTime, true);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Volume controls
function setVolume() {
    volume = this.value;
    audioPlayer.volume = volume / 100;
    
    // Update volume icon
    if (volume == 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 50) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        audioPlayer.volume = volume / 100;
        volumeSlider.value = volume;
        
        if (volume < 50) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
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
                <p>${currentTrack.artist || 'Unknown Artist'}</p>
            </div>
        </div>
    `;
    
    // Add upcoming tracks
    for (let i = currentTrackIndex + 1; i < queue.length; i++) {
        const track = queue[i];
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="queue-item">
                <img src="${track.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="queue-item-img">
                <div class="queue-item-info">
                    <h5>${track.title}</h5>
                    <p>${track.artist || 'Unknown Artist'}</p>
                </div>
            </div>
        `;
        upcomingQueue.appendChild(li);
    }
}

// Recently played
function addToRecentlyPlayed(track) {
    // Remove if already exists
    const index = recentlyPlayed.findIndex(t => t.videoId === track.videoId);
    if (index !== -1) {
        recentlyPlayed.splice(index, 1);
    }
    
    // Add to beginning
    recentlyPlayed.unshift(track);
    
    // Keep only last 10
    if (recentlyPlayed.length > 10) {
        recentlyPlayed.pop();
    }
    
    saveData();
    renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
    const container = document.getElementById('recently-played');
    container.innerHTML = '';
    
    recentlyPlayed.slice(0, 6).forEach(track => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${track.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="card-img">
            <div class="card-body">
                <h4 class="card-title">${track.title}</h4>
                <p class="card-text">${track.artist || 'Unknown Artist'}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            addToQueue(track, true);
        });
        container.appendChild(card);
    });
}

// Playlist management
function createPlaylist(e) {
    e.preventDefault();
    
    const name = document.getElementById('playlist-name').value;
    const desc = document.getElementById('playlist-desc').value;
    const visibility = document.getElementById('playlist-visibility').value;
    
    const newPlaylist = {
        id: Date.now().toString(),
        name,
        description: desc,
        visibility,
        tracks: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    saveData();
    renderPlaylists();
    
    // Reset form and close modal
    playlistForm.reset();
    playlistModal.classList.remove('active');
}

function renderPlaylists() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">${playlist.name}</a>`;
        container.appendChild(li);
    });
}

// Search functionality
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    showPage('search');
    
    try {
        // Search YouTube Music
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}+music&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        searchResults.songs = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title.replace(/official music video|lyrics|hd|video|audio|/gi, '').trim(),
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            duration: '3:45' // YouTube doesn't provide duration in search results
        }));
        
        renderSearchResults();
    } catch (error) {
        console.error('Search error:', error);
        alert('Failed to perform search. Please try again.');
    }
}

function renderSearchResults() {
    // Songs
    const songsContainer = document.getElementById('songs-results');
    songsContainer.innerHTML = '';
    
    if (searchResults.songs && searchResults.songs.length > 0) {
        searchResults.songs.forEach((song, index) => {
            const tr = document.createElement('tr');
            tr.className = 'song-row';
            tr.innerHTML = `
                <td class="song-number">${index + 1}</td>
                <td class="song-title">
                    <img src="${song.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="song-img">
                    <div>
                        <span class="song-name">${song.title}</span>
                    </div>
                </td>
                <td class="song-artist">${song.artist}</td>
                <td class="song-album">Single</td>
                <td class="song-duration">${song.duration}</td>
            `;
            tr.addEventListener('click', () => {
                addToQueue(song, true);
            });
            songsContainer.appendChild(tr);
        });
    }
    
    // TODO: Implement artists, albums, and playlists search if needed
}

// Fetch top charts
async function fetchTopCharts() {
    try {
        // This is a placeholder - you would need to implement actual chart fetching
        // For demo purposes, we'll search for "top songs 2023"
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=top+songs+2023&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        const topCharts = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title.replace(/official music video|lyrics|hd|video|audio|/gi, '').trim(),
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
        }));
        
        renderTopCharts(topCharts);
    } catch (error) {
        console.error('Failed to fetch top charts:', error);
    }
}

function renderTopCharts(tracks) {
    const container = document.getElementById('top-charts');
    container.innerHTML = '';
    
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${track.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="card-img">
            <div class="card-body">
                <h4 class="card-title">${track.title}</h4>
                <p class="card-text">${track.artist || 'Unknown Artist'}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            addToQueue(track, true);
        });
        container.appendChild(card);
    });
}

// Fetch recommendations
async function fetchRecommendations() {
    try {
        // This is a placeholder - you would need to implement actual recommendations
        // For demo purposes, we'll search for "popular music"
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=popular+music&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        const recommendations = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title.replace(/official music video|lyrics|hd|video|audio|/gi, '').trim(),
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
        }));
        
        renderRecommendations(recommendations);
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
    }
}

function renderRecommendations(tracks) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';
    
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${track.thumbnail || 'assets/default-cover.jpg'}" alt="Cover" class="card-img">
            <div class="card-body">
                <h4 class="card-title">${track.title}</h4>
                <p class="card-text">${track.artist || 'Unknown Artist'}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            addToQueue(track, true);
        });
        container.appendChild(card);
    });
}