// YouTube API Key
const API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';
let player;
let currentSong = null;
let currentPlaylist = [];
let currentSongIndex = 0;
let currentPage = 'home';
let previousPage = '';

// DOM Elements
const homePage = document.getElementById('homePage');
const searchPage = document.getElementById('searchPage');
const libraryPage = document.getElementById('libraryPage');
const detailPage = document.getElementById('detailPage');
const backButton = document.getElementById('backButton');
const pageTitle = document.getElementById('pageTitle');
const searchButton = document.getElementById('searchButton');
const menuButton = document.getElementById('menuButton');
const moreButton = document.getElementById('moreButton');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const trendingSongs = document.getElementById('trendingSongs');
const topCharts = document.getElementById('topCharts');
const recentSongs = document.getElementById('recentSongs');
const librarySongs = document.getElementById('librarySongs');
const detailSongs = document.getElementById('detailSongs');
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
const homeButton = document.getElementById('homeButton');
const searchNavButton = document.getElementById('searchNavButton');
const libraryButton = document.getElementById('libraryButton');
const playlistsBtn = document.getElementById('playlistsBtn');
const artistsBtn = document.getElementById('artistsBtn');
const albumsBtn = document.getElementById('albumsBtn');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailSubtitle = document.getElementById('detailSubtitle');
const playAllButton = document.getElementById('playAllButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const shuffleButton = document.getElementById('shuffleButton');
const repeatButton = document.getElementById('repeatButton');
const likeButton = document.getElementById('likeButton');
const addToPlaylistButton = document.getElementById('addToPlaylistButton');
const downloadButton = document.getElementById('downloadButton');

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
    loadRecentSongs();
    loadLibrarySongs();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        playPauseButton.innerHTML = '<span class="material-icons">pause</span>';
        fullPlayerPlayButton.innerHTML = '<span class="material-icons">pause</span>';
    } else if (event.data === YT.PlayerState.PAUSED) {
        playPauseButton.innerHTML = '<span class="material-icons">play_arrow</span>';
        fullPlayerPlayButton.innerHTML = '<span class="material-icons">play_arrow</span>';
    } else if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    }
}

// Page Navigation
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Show requested page
    switch(page) {
        case 'home':
            homePage.classList.remove('hidden');
            pageTitle.textContent = 'AriX Music';
            backButton.style.display = 'none';
            break;
        case 'search':
            searchPage.classList.remove('hidden');
            pageTitle.textContent = 'Search';
            backButton.style.display = 'flex';
            break;
        case 'library':
            libraryPage.classList.remove('hidden');
            pageTitle.textContent = 'Your Library';
            backButton.style.display = 'none';
            break;
        case 'detail':
            detailPage.classList.remove('hidden');
            backButton.style.display = 'flex';
            break;
    }
    
    // Update bottom nav
    document.querySelectorAll('.bottom-nav .nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (page === 'home') homeButton.classList.add('active');
    if (page === 'search') searchNavButton.classList.add('active');
    if (page === 'library') libraryButton.classList.add('active');
    
    // Store current page
    previousPage = currentPage;
    currentPage = page;
}

// Back button functionality
function goBack() {
    showPage(previousPage);
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

// Load recent songs (mock data)
function loadRecentSongs() {
    // In a real app, this would load from local storage
    const mockRecent = [
        {
            id: {videoId: 'dQw4w9WgXcQ'},
            snippet: {
                title: 'Never Gonna Give You Up',
                channelTitle: 'Rick Astley',
                thumbnails: {
                    medium: {url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg'}
                }
            }
        },
        {
            id: {videoId: '9bZkp7q19f0'},
            snippet: {
                title: 'Gangnam Style',
                channelTitle: 'PSY',
                thumbnails: {
                    medium: {url: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg'}
                }
            }
        }
    ];
    displaySongs(mockRecent, recentSongs);
}

// Load library songs (mock data)
function loadLibrarySongs() {
    // In a real app, this would load from local storage
    const mockLibrary = [
        {
            id: {videoId: 'JGwWNGJdvx8'},
            snippet: {
                title: 'Shape of You',
                channelTitle: 'Ed Sheeran',
                thumbnails: {
                    medium: {url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg'}
                }
            }
        },
        {
            id: {videoId: 'kJQP7kiw5Fk'},
            snippet: {
                title: 'Despacito',
                channelTitle: 'Luis Fonsi',
                thumbnails: {
                    medium: {url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg'}
                }
            }
        }
    ];
    displaySongs(mockLibrary, librarySongs);
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
        resultItem.className = 'song-list-item';
        resultItem.innerHTML = `
            <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="song-image">
            <div class="song-list-info">
                <h3>${snippet.title}</h3>
                <p>${snippet.channelTitle}</p>
            </div>
            <span class="material-icons">more_vert</span>
        `;
        
        resultItem.addEventListener('click', () => {
            playSong(videoId, snippet);
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
    }
    
    // Show player bar if hidden
    playerBar.style.display = 'flex';
    
    // Add to recent songs (in a real app, save to local storage)
    // ...
}

function playNextSong() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        const nextSong = currentPlaylist[currentSongIndex];
        playSong(nextSong.id, nextSong.snippet);
    }
}

function playPrevSong() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        const prevSong = currentPlaylist[currentSongIndex];
        playSong(prevSong.id, prevSong.snippet);
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (player) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
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
searchButton.addEventListener('click', () => {
    showPage('search');
    searchInput.focus();
});

searchNavButton.addEventListener('click', () => {
    showPage('search');
    searchInput.focus();
});

homeButton.addEventListener('click', () => showPage('home'));
libraryButton.addEventListener('click', () => showPage('library'));
backButton.addEventListener('click', goBack);

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

prevButton.addEventListener('click', playPrevSong);
nextButton.addEventListener('click', playNextSong);

playlistsBtn.addEventListener('click', () => {
    // In a real app, this would show user's playlists
    detailTitle.textContent = 'Your Playlists';
    detailSubtitle.textContent = 'All your saved playlists';
    detailImage.src = 'https://via.placeholder.com/150';
    detailSongs.innerHTML = '<p style="padding: 20px; text-align: center;">Playlist feature coming soon</p>';
    showPage('detail');
});

artistsBtn.addEventListener('click', () => {
    // In a real app, this would show followed artists
    detailTitle.textContent = 'Your Artists';
    detailSubtitle.textContent = 'Artists you follow';
    detailImage.src = 'https://via.placeholder.com/150';
    detailSongs.innerHTML = '<p style="padding: 20px; text-align: center;">Artists feature coming soon</p>';
    showPage('detail');
});

albumsBtn.addEventListener('click', () => {
    // In a real app, this would show saved albums
    detailTitle.textContent = 'Your Albums';
    detailSubtitle.textContent = 'Albums in your library';
    detailImage.src = 'https://via.placeholder.com/150';
    detailSongs.innerHTML = '<p style="padding: 20px; text-align: center;">Albums feature coming soon</p>';
    showPage('detail');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load YouTube API script if not already loaded
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // Show home page by default
    showPage('home');
});