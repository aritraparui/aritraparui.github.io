document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const featuredPlaylists = document.getElementById('featured-playlists');
    const searchResults = document.getElementById('search-results');
    const resultsContainer = document.getElementById('results-container');
    const currentSongArt = document.getElementById('current-song-art');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const volumeBar = document.getElementById('volume-bar');
    
    // Audio element
    const audio = new Audio();
    let currentSongIndex = -1;
    let songsQueue = [];
    let isPlaying = false;
    
    // Featured playlists (mock data)
    const featuredPlaylistsData = [
        {
            id: 'PL1',
            title: 'Top Hits 2023',
            description: 'The hottest tracks right now',
            image: 'https://i.ytimg.com/vi/BPgEgaPk62M/maxresdefault.jpg'
        },
        {
            id: 'PL2',
            title: 'Chill Vibes',
            description: 'Relaxing tunes for your day',
            image: 'https://i.ytimg.com/vi/D9G1VOjN_84/maxresdefault.jpg'
        },
        {
            id: 'PL3',
            title: 'Workout Mix',
            description: 'Energy boost for your workout',
            image: 'https://i.ytimg.com/vi/9ZfN87gSjvI/maxresdefault.jpg'
        },
        {
            id: 'PL4',
            title: 'Indie Discoveries',
            description: 'Fresh indie tracks',
            image: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg'
        }
    ];
    
    // Initialize the app
    function init() {
        renderFeaturedPlaylists();
        setupEventListeners();
    }
    
    // Render featured playlists
    function renderFeaturedPlaylists() {
        featuredPlaylists.innerHTML = '';
        featuredPlaylistsData.forEach(playlist => {
            const playlistCard = document.createElement('div');
            playlistCard.className = 'playlist-card';
            playlistCard.innerHTML = `
                <img src="${playlist.image}" alt="${playlist.title}" class="playlist-img">
                <div class="playlist-info">
                    <div class="playlist-title">${playlist.title}</div>
                    <div class="playlist-description">${playlist.description}</div>
                </div>
            `;
            playlistCard.addEventListener('click', () => {
                // In a real app, this would fetch songs from the playlist
                alert(`Playlist ${playlist.title} selected. In a real app, this would load songs.`);
            });
            featuredPlaylists.appendChild(playlistCard);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search functionality
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Player controls
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        
        // Progress bar
        progressBar.addEventListener('input', seekAudio);
        
        // Volume control
        volumeBar.addEventListener('input', setVolume);
        
        // Audio events
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', playNext);
        audio.addEventListener('loadedmetadata', updateDuration);
    }
    
    // Perform search
    function performSearch() {
        const query = searchInput.value.trim();
        if (query === '') return;
        
        // Show loading state
        resultsContainer.innerHTML = '<div class="loading"></div>';
        searchResults.style.display = 'block';
        featuredSection.style.display = 'none';
        
        // In a real app, this would be an API call to YouTube Music
        // For demo purposes, we'll use mock data
        setTimeout(() => {
            mockSearch(query);
        }, 800);
    }
    
    // Mock search function (replace with actual API call)
    function mockSearch(query) {
        // Mock data - in a real app, you would use the YouTube Music API
        const mockResults = [
            {
                id: '1',
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                duration: '3:20',
                image: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
                videoId: '4NRXx6U8ABQ'
            },
            {
                id: '2',
                title: 'Save Your Tears',
                artist: 'The Weeknd',
                duration: '3:35',
                image: 'https://i.ytimg.com/vi/XXYlFuWEuKI/maxresdefault.jpg',
                videoId: 'XXYlFuWEuKI'
            },
            {
                id: '3',
                title: 'Stay',
                artist: 'The Kid LAROI, Justin Bieber',
                duration: '2:21',
                image: 'https://i.ytimg.com/vi/kTJczUoc26U/maxresdefault.jpg',
                videoId: 'kTJczUoc26U'
            },
            {
                id: '4',
                title: 'good 4 u',
                artist: 'Olivia Rodrigo',
                duration: '2:58',
                image: 'https://i.ytimg.com/vi/gNi_6U5Pm_o/maxresdefault.jpg',
                videoId: 'gNi_6U5Pm_o'
            },
            {
                id: '5',
                title: 'Levitating',
                artist: 'Dua Lipa',
                duration: '3:23',
                image: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg',
                videoId: 'TUVcZfQe-Kw'
            },
            {
                id: '6',
                title: 'Montero',
                artist: 'Lil Nas X',
                duration: '2:17',
                image: 'https://i.ytimg.com/vi/6swmTBVI83k/maxresdefault.jpg',
                videoId: '6swmTBVI83k'
            }
        ].filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) || 
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        
        renderSearchResults(mockResults);
    }
    
    // Render search results
    function renderSearchResults(results) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found. Try a different search.</p>';
            return;
        }
        
        results.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';
            songCard.innerHTML = `
                <img src="${song.image}" alt="${song.title}" class="playlist-img">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist} • ${song.duration}</div>
                </div>
            `;
            songCard.addEventListener('click', () => {
                playSong(song, index, results);
            });
            resultsContainer.appendChild(songCard);
        });
    }
    
    // Play a song
    function playSong(song, index, queue) {
        currentSongIndex = index;
        songsQueue = queue;
        
        // Update UI
        currentSongArt.src = song.image;
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        
        // In a real app, you would use the YouTube Music API to get the stream URL
        // For demo purposes, we'll use a placeholder
        audio.src = `https://www.youtube.com/watch?v=${song.videoId}`;
        
        // Play the audio
        audio.play()
            .then(() => {
                isPlaying = true;
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            })
            .catch(error => {
                console.error('Playback failed:', error);
                alert('Playback failed. This is a demo - in a real app, this would play the song.');
            });
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (audio.src === '') {
            alert('No song selected. Search for a song to play.');
            return;
        }
        
        if (isPlaying) {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audio.play()
                .then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                });
        }
        isPlaying = !isPlaying;
    }
    
    // Play previous song
    function playPrevious() {
        if (songsQueue.length === 0) return;
        
        currentSongIndex = (currentSongIndex - 1 + songsQueue.length) % songsQueue.length;
        playSong(songsQueue[currentSongIndex], currentSongIndex, songsQueue);
    }
    
    // Play next song
    function playNext() {
        if (songsQueue.length === 0) return;
        
        currentSongIndex = (currentSongIndex + 1) % songsQueue.length;
        playSong(songsQueue[currentSongIndex], currentSongIndex, songsQueue);
    }
    
    // Update progress bar
    function updateProgress() {
        const { currentTime: time, duration: dur } = audio;
        progressBar.value = time / dur * 100;
        currentTime.textContent = formatTime(time);
    }
    
    // Update duration display
    function updateDuration() {
        duration.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
    }
    
    // Seek audio
    function seekAudio() {
        audio.currentTime = progressBar.value * audio.duration / 100;
    }
    
    // Set volume
    function setVolume() {
        audio.volume = volumeBar.value;
    }
    
    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Initialize the app
    init();
});