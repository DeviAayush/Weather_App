document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const searchButton = document.getElementById('search-button');
    const weatherInfoDiv = document.getElementById('weather-info');
    const errorMessageDiv = document.getElementById('error-message');

    const cityNameEl = document.getElementById('city-name');
    const weatherIconImg = document.getElementById('weather-icon-img');
    const temperatureValueEl = document.getElementById('temperature-value');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const hourlyForecastItemsEl = document.getElementById('hourly-forecast-items');

    const API_KEY = '24ad2fbac021811f4f156d034817e2d2';
    const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

    searchButton.addEventListener('click', fetchWeather);
    searchBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeather();
        }
    });

    async function fetchWeather() {
        const city = searchBox.value.trim();
        if (!city) {
            showError('Please enter a city name.');
            return;
        }

        weatherInfoDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');

        try {
            const currentWeatherResponse = await fetch(`${API_BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
            if (!currentWeatherResponse.ok) {
                handleApiError(currentWeatherResponse, city);
                return;
            }
            const currentWeatherData = await currentWeatherResponse.json();

            const forecastResponse = await fetch(`${FORECAST_API_BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
            if (!forecastResponse.ok) {
                handleApiError(forecastResponse, city, "forecast");
                return;
            }
            const forecastData = await forecastResponse.json();

            displayWeather(currentWeatherData, forecastData);

        } catch (error) {
            console.error('Fetch weather error:', error);
            showError('Failed to fetch weather data. Check your internet connection or the API service.');
        }
    }

    function handleApiError(response, city, type = "current weather") {
        if (response.status === 401) {
            showError(`Invalid API Key for ${type}. Please check your API key in script.js.`);
        } else if (response.status === 404) {
            showError(`City "${city}" not found for ${type}. Please check the spelling.`);
        } else {
            showError(`Error fetching ${type}: ${response.statusText} (Status: ${response.status})`);
        }
    }

    function displayWeather(currentData, forecastData) {
        if (!currentData || !currentData.name) {
            showError('Received invalid current weather data from service.');
            return;
        }

        cityNameEl.textContent = currentData.name;
        temperatureValueEl.textContent = Math.round(currentData.main.temp);
        weatherDescriptionEl.textContent = currentData.weather[0].description;
        weatherIconImg.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        weatherIconImg.alt = currentData.weather[0].description;

        updateDynamicBackground(currentData.weather[0].main, currentData.weather[0].id);

        displayHourlyForecast(forecastData);

        weatherInfoDiv.classList.remove('hidden');
        errorMessageDiv.classList.add('hidden');
        searchBox.value = '';
    }

    function showError(message) {
        errorMessageDiv.querySelector('p').textContent = message;
        errorMessageDiv.classList.remove('hidden');
        weatherInfoDiv.classList.add('hidden');
        document.body.className = 'bg-default';
        if (hourlyForecastItemsEl) {
            hourlyForecastItemsEl.innerHTML = '';
        }
    }

    function displayHourlyForecast(forecastData) {
        if (!hourlyForecastItemsEl) return;
        hourlyForecastItemsEl.innerHTML = '';

        if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
            const errorItem = document.createElement('p');
            errorItem.textContent = 'Hourly forecast data not available.';
            errorItem.style.gridColumn = "span 4";
            hourlyForecastItemsEl.appendChild(errorItem);
            return;
        }

        const forecastToShow = forecastData.list.slice(0, 8);

        forecastToShow.forEach(item => {
            const forecastItemDiv = document.createElement('div');
            forecastItemDiv.classList.add('forecast-item');

            const timeP = document.createElement('p');
            const date = new Date(item.dt * 1000);
            timeP.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            const iconImg = document.createElement('img');
            iconImg.src = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
            iconImg.alt = item.weather[0].description;

            const tempP = document.createElement('p');
            tempP.textContent = `${Math.round(item.main.temp)}°C`;

            forecastItemDiv.appendChild(timeP);
            forecastItemDiv.appendChild(iconImg);
            forecastItemDiv.appendChild(tempP);
            hourlyForecastItemsEl.appendChild(forecastItemDiv);
        });
    }

    function updateDynamicBackground(weatherMain, weatherId) {
        document.body.className = '';
        let bgClass = 'bg-default';

        switch (weatherMain.toLowerCase()) {
            case 'clear':
                bgClass = 'bg-clear-sky';
                break;
            case 'clouds':
                if (weatherId === 801) bgClass = 'bg-few-clouds';
                else if (weatherId === 802) bgClass = 'bg-scattered-clouds';
                else if (weatherId === 803 || weatherId === 804) bgClass = 'bg-broken-clouds';
                else bgClass = 'bg-scattered-clouds';
                break;
            case 'rain':
            case 'drizzle':
                bgClass = 'bg-rain';
                if (weatherId >= 500 && weatherId <= 504) bgClass = 'bg-rain';
                if (weatherId >= 520 && weatherId <= 531) bgClass = 'bg-shower-rain';
                break;
            case 'thunderstorm':
                bgClass = 'bg-thunderstorm';
                break;
            case 'snow':
                bgClass = 'bg-snow';
                break;
            case 'mist':
            case 'smoke':
            case 'haze':
            case 'dust':
            case 'fog':
            case 'sand':
            case 'ash':
            case 'squall':
            case 'tornado':
                bgClass = 'bg-mist';
                break;
            default:
                bgClass = 'bg-default';
        }
        document.body.classList.add(bgClass);
    }

    document.body.classList.add('bg-default');
});