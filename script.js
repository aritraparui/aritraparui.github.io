// YouTube API Key
const API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';
let player;
let currentSong = null;
let currentPlaylist = [];
let currentSongIndex = 0;

// DOM Elements
const homeView = document.getElementById('homeView');
const searchView = document.getElementById('searchView');
const searchButton = document.getElementById('searchButton');
const menuButton = document.getElementById('menuButton');
const moreButton = document.getElementById('moreButton');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const trendingSongs = document.getElementById('trendingSongs');
const topCharts = document.getElementById('topCharts');
const playerBar = document.getElementById('playerBar');
const playerInfo = document.getElementById('playerInfo');
const playerThumbnail = document.getElementById('playerThumbnail');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const playPauseButton = document.getElementById('playPauseButton');
const fullPlayer = document.getElementById('fullPlayer');
const closeFullPlayer = document.getElementById('closeFullPlayer');
const fullPlayerThumbnail = document.getElementById('fullPlayerThumbnail');
const fullPlayerSongTitle = document.getElementById('fullPlayerSongTitle');
const fullPlayerSongArtist = document.getElementById('fullPlayerSongArtist');
const fullPlayerPlayButton = document.getElementById('fullPlayerPlayButton');
const songProgress = document.getElementById('songProgress');

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
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
    loadTrendingSongs();
    loadTopCharts();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    }
}

// Load trending songs
async function loadTrendingSongs() {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=10&regionCode=US&videoCategoryId=10&key=${API_KEY}`);
        const data = await response.json();
        displaySongs(data.items, trendingSongs);
    } catch (error) {
        console.error('Error loading trending songs:', error);
    }
}

// Load top charts
async function loadTopCharts() {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=PL4fGSI1pDJn6jXS_Tv_N9B8Z0HTRVJE0m&key=${API_KEY}`);
        const data = await response.json();
        displaySongs(data.items, topCharts);
    } catch (error) {
        console.error('Error loading top charts:', error);
    }
}

// Search songs
async function searchSongs(query) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`);
        const data = await response.json();
        displaySearchResults(data.items);
    } catch (error) {
        console.error('Error searching songs:', error);
    }
}

// Display songs in grid
function displaySongs(songs, container) {
    container.innerHTML = '';
    
    songs.forEach((song, index) => {
        const snippet = song.snippet;
        const videoId = song.id.videoId || song.id;
        
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="song-image">
            <div class="song-info">
                <h3 class="song-name">${snippet.title}</h3>
                <p class="song-artist">${snippet.channelTitle}</p>
            </div>
        `;
        
        songCard.addEventListener('click', () => {
            playSong(videoId, snippet);
        });
        
        container.appendChild(songCard);
    });
}

// Display search results
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    results.forEach((item) => {
        const snippet = item.snippet;
        const videoId = item.id.videoId;
        
        const resultItem = document.createElement('div');
        resultItem.className = 'song-card';
        resultItem.innerHTML = `
            <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="song-image">
            <div class="song-info">
                <h3 class="song-name">${snippet.title}</h3>
                <p class="song-artist">${snippet.channelTitle}</p>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            playSong(videoId, snippet);
            hideSearchView();
        });
        
        searchResults.appendChild(resultItem);
    });
}

// Play song
function playSong(videoId, snippet) {
    currentSong = {
        id: videoId,
        title: snippet.title,
        artist: snippet.channelTitle,
        thumbnail: snippet.thumbnails.medium.url
    };
    
    // Update UI
    playerThumbnail.src = snippet.thumbnails.default.url;
    songTitle.textContent = snippet.title;
    songArtist.textContent = snippet.channelTitle;
    
    fullPlayerThumbnail.src = snippet.thumbnails.medium.url;
    fullPlayerSongTitle.textContent = snippet.title;
    fullPlayerSongArtist.textContent = snippet.channelTitle;
    
    // Load and play video
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
        
        // Update play button
        playPauseButton.innerHTML = '<span class="material-icons">pause</span>';
        fullPlayerPlayButton.innerHTML = '<span class="material-icons">pause</span>';
    }
    
    // Show player bar if hidden
    playerBar.style.display = 'flex';
}

function playNextSong() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        const nextSong = currentPlaylist[currentSongIndex];
        playSong(nextSong.id, nextSong.snippet);
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (player) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            playPauseButton.innerHTML = '<span class="material-icons">play_arrow</span>';
            fullPlayerPlayButton.innerHTML = '<span class="material-icons">play_arrow</span>';
        } else {
            player.playVideo();
            playPauseButton.innerHTML = '<span class="material-icons">pause</span>';
            fullPlayerPlayButton.innerHTML = '<span class="material-icons">pause</span>';
        }
    }
}

// Show search view
function showSearchView() {
    homeView.classList.add('hidden');
    searchView.classList.remove('hidden');
    searchInput.focus();
}

// Hide search view
function hideSearchView() {
    searchView.classList.add('hidden');
    homeView.classList.remove('hidden');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

// Show full player
function showFullPlayer() {
    fullPlayer.classList.remove('hidden');
}

// Hide full player
function hideFullPlayer() {
    fullPlayer.classList.add('hidden');
}

// Event listeners
searchButton.addEventListener('click', showSearchView);
menuButton.addEventListener('click', () => console.log('Menu clicked'));
moreButton.addEventListener('click', () => console.log('More options clicked'));

searchInput.addEventListener('input', (e) => {
    if (e.target.value.length > 2) {
        searchSongs(e.target.value);
    }
});

playPauseButton.addEventListener('click', togglePlayPause);
fullPlayerPlayButton.addEventListener('click', togglePlayPause);

playerInfo.addEventListener('click', showFullPlayer);
closeFullPlayer.addEventListener('click', hideFullPlayer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load YouTube API script if not already loaded
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
});