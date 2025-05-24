const API_KEY = 'AIzaSyBtRey4UY_MKDI2eKWdJhG3xZDPhXvdjpU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

async function searchSongs() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    try {
        const response = await fetch(`${BASE_URL}?q=${query}&part=snippet&type=video&maxResults=10&key=${API_KEY}`);
        const data = await response.json();
        displayResults(data.items);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayResults(items) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.default.url;

        const videoElement = document.createElement('div');
        videoElement.classList.add('video');
        videoElement.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <div>
                <h3>${title}</h3>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Listen</a>
            </div>
        `;

        resultsDiv.appendChild(videoElement);
    });
}