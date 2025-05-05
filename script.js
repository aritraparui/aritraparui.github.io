const API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';
let player;
let currentSongId = '';

// YouTube Player API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // Play next song
    }
}

// Search Songs
async function searchSongs(query) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&key=${API_KEY}`);
    const data = await response.json();
    displayResults(data.items);
}

function displayResults(items) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <h4>${item.snippet.title}</h4>
            <p>${item.snippet.channelTitle}</p>
        `;
        card.addEventListener('click', () => playSong(item.id.videoId, item.snippet));
        container.appendChild(card);
    });
}

// Player Controls
function playSong(videoId, snippet) {
    currentSongId = videoId;
    document.getElementById('currentSongTitle').textContent = snippet.title;
    document.getElementById('currentSongArtist').textContent = snippet.channelTitle;
    document.getElementById('currentSongArt').src = snippet.thumbnails.default.url;
    
    if (player) {
        player.loadVideoById(videoId);
        document.getElementById('playPause').classList.replace('bx-play-circle', 'bx-pause-circle');
    }
}

document.getElementById('playPause').addEventListener('click', () => {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        document.getElementById('playPause').classList.replace('bx-pause-circle', 'bx-play-circle');
    } else {
        player.playVideo();
        document.getElementById('playPause').classList.replace('bx-play-circle', 'bx-pause-circle');
    }
});

// Search Functionality
document.querySelector('.search-bar input').addEventListener('input', (e) => {
    if (e.target.value.length > 2) {
        searchSongs(e.target.value);
    }
});