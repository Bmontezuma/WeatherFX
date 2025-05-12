const apiKey = '520514a007f3bb24be51a8b7f35a90f3';

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayWeather(data);
    window.currentForecast = `
      The current weather in ${data.name} is ${data.weather[0].description}.
      The temperature is ${data.main.temp} degrees Fahrenheit,
      with a high of ${data.main.temp_max} and a low of ${data.main.temp_min}.
      Humidity is at ${data.main.humidity} percent.
      Wind speed is around ${data.wind.speed} miles per hour.
      Atmospheric pressure is ${data.main.pressure} millibars.
      Visibility is ${data.visibility / 1000} kilometers.
    `;
    triggerVisualEffect(data.weather[0].main);
    updateRadar(data.coord.lat, data.coord.lon);
    await getFiveDayForecast(city);
  } catch (err) {
    document.getElementById('weatherOutput').innerText = 'City not found.';
    console.error(err);
  }
}

function displayWeather(data) {
  const weather = `
    <h2>${data.name}</h2>
    <p>${data.weather[0].description}</p>
    <p>Temp: ${data.main.temp}°F</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} mph</p>
  `;
  document.getElementById('weatherOutput').innerHTML = weather;
}

function speakWeather() {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(window.currentForecast || "Please get the weather first.");
  utter.voice = synth.getVoices().find(v => v.name.includes("Google US English") || v.lang === "en-US");
  utter.rate = 0.85;
  utter.pitch = 0.9;
  synth.speak(utter);
}

function triggerVisualEffect(condition) {
  const scene = document.querySelector('#weatherScene');
  scene.innerHTML = '<a-sky color="#88ccee"></a-sky>'; // reset

  let effect = '';

  switch (condition.toLowerCase()) {
    case 'rain':
      effect = `<a-entity particle-system="preset: rain; color: #7f8c8d;"></a-entity>`;
      break;
    case 'snow':
      effect = `<a-entity particle-system="preset: snow; color: white;"></a-entity>`;
      break;
    case 'clear':
      effect = `<a-entity light="type: point; color: #ffffaa; intensity: 2;" position="0 5 0"></a-entity>`;
      break;
    case 'clouds':
      effect = `<a-sky color="#bdc3c7"></a-sky>`;
      break;
    case 'thunderstorm':
      effect = `
        <a-sky color="#2c3e50"></a-sky>
        <a-light type="point" color="#ffffff" intensity="4" position="0 5 0"></a-light>
      `;
      break;
    case 'wind':
      effect = `<a-box position="0 1.5 -3" animation="property: position; to: 2 1.5 -3; dir: alternate; dur: 1000; loop: true" color="#95a5a6"></a-box>`;
      break;
  }

  scene.innerHTML += effect;

  setTimeout(() => {
    scene.innerHTML = '<a-sky color="#88ccee"></a-sky>';
  }, 10000);
}

async function getFiveDayForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

  try {
    const res = await fetch(forecastUrl);
    const data = await res.json();

    const forecastContainer = document.getElementById('forecastOutput');
    forecastContainer.innerHTML = '<h3>5-Day Forecast</h3>';

    for (let i = 0; i < data.list.length; i += 8) {
      const forecast = data.list[i];
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      const temp = forecast.main.temp;
      const desc = forecast.weather[0].description;

      const card = document.createElement('div');
      card.classList.add('forecast-card');
      card.innerHTML = `
        <strong>${date}</strong><br>
        ${desc}<br>
        Temp: ${temp}°F
      `;
      forecastContainer.appendChild(card);
    }
  } catch (err) {
    console.error('Forecast fetch failed:', err);
  }
}

function updateRadar(lat, lon) {
  const radarFrame = document.getElementById('radarMap');
  radarFrame.src =
    `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=7&level=surface&overlay=radar&menu=&message=true&marker=&calendar=&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;
}
