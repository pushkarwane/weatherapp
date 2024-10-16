
const apiKey = 'e86bffe7f8f2bb19ff328d1449358b01'; 
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

document.getElementById('search-btn').addEventListener('click', getWeatherData);

const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const forecastDiv = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');
const recentCitiesDropdown = document.getElementById('recent-cities');
const dropdown = document.getElementById('dropdown');


function getWeatherData() {
  const city = cityInput.value.trim();
  if (!city) {
    displayError('Please enter a city name');
    return;
  }

  fetch(`${baseUrl}weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        throw new Error(data.message);
      }
      displayCurrentWeather(data);
      saveToRecentCities(city);
      getExtendedForecast(city);
    })
    .catch(err => displayError(err.message));
}

function displayCurrentWeather(data) {
  weatherInfo.querySelector('#location').textContent = `${data.name}, ${data.sys.country}`;
  weatherInfo.querySelector('#current-weather').textContent = data.weather[0].description;
  weatherInfo.querySelector('#weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  weatherInfo.querySelector('#temperature').textContent = `Temperature: ${data.main.temp}°C`;
  weatherInfo.querySelector('#humidity').textContent = `Humidity: ${data.main.humidity}%`;
  weatherInfo.querySelector('#wind').textContent = `Wind Speed: ${data.wind.speed} m/s`;

  weatherInfo.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}


function getExtendedForecast(city) {
  fetch(`${baseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      displayExtendedForecast(data);
    })
    .catch(err => displayError(err.message));
}

function displayExtendedForecast(data) {
  forecastDiv.innerHTML = ''; 
  for (let i = 0; i < data.list.length; i += 8) {
    const forecast = data.list[i];
    const forecastCard = `
      <div class="bg-white p-4 rounded-lg shadow">
        <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon" />
        <p>Temp: ${forecast.main.temp}°C</p>
        <p>Wind: ${forecast.wind.speed} m/s</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      </div>
    `;
    forecastDiv.innerHTML += forecastCard;
  }

  forecastDiv.classList.remove('hidden');
}


function saveToRecentCities(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateDropdown(recentCities);
  }
}


function updateDropdown(cities) {
  recentCitiesDropdown.innerHTML = '';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
  dropdown.classList.remove('hidden');
}


recentCitiesDropdown.addEventListener('change', function () {
  cityInput.value = this.value;
  getWeatherData();
});


function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
  forecastDiv.classList.add('hidden');
}


window.onload = function () {
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (recentCities.length > 0) {
    updateDropdown(recentCities);
  }
};
