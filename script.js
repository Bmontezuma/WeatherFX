const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace this with your actual key

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayWeather(data);
    window.currentForecast = `In ${data.name}, it's ${data.weather[0].description} with a temperature of ${data.main.temp} degrees Fahrenheit.`;
    triggerVisualEffect(data.weather[0].main);
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

