import fetchData from "./FetchData.js";
import weatherImage from "./WeatherImage.js";
import formatDate from "./FormatDate.js";
import convertToFahrenheit from "./ConvertToFahrenheit.js";

// get DOM elements
const searchLocationBtn = document.getElementById("searchLocationBtn");
const closeOffCanvasBtn = document.getElementById("closeOffCanvasBtn");
const offCanvas = document.querySelector(".offcanvas");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const currentWeatherImg = document.getElementById("currentWeatherImg");
const weatherTemp = document.getElementById("weatherTemp");
const weatherStateName = document.getElementById("weatherStateName");
const todayEL = document.getElementById("today");
const location = document.getElementById("location");
const forecastResults = document.getElementById("forecastResults");
const windSpeedEl = document.getElementById("windSpeed");
const windDirectionEl = document.getElementById("windDirectionTxt");
const humadityPercentageEl = document.getElementById("humadityPercentage");
const progressWidthEl = document.getElementById("progressWidth");
const visibilityEl = document.getElementById("visibility");
const airPressureEl = document.getElementById("airPressure");
const formSearchLocation = document.getElementById("formSearchLocation");
const locationList = document.getElementById("locationList");
const invalidFeedback = document.querySelector(".invalid-feedback");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const loaders = document.querySelectorAll(".loader");
const contents = document.querySelectorAll(".content");

let weatherData = [];
let temperature = "celsius";

searchLocationBtn.addEventListener("click", openOffCanvas);
closeOffCanvasBtn.addEventListener("click", closeOffCanvas);
currentLocationBtn.addEventListener("click", getCurrentLocation);
formSearchLocation.addEventListener("submit", (e) => {
  e.preventDefault();
  const locationName = formSearchLocation["location"].value.trim();
  if (locationName === "") {
    invalidFeedback.textContent = "City name is required!";
    return;
  }
  if (locationName.length < 3) {
    invalidFeedback.textContent =
      "City name cannot be less than three characters!";
    return;
  }
  getLocations(locationName);
});
celsiusBtn.addEventListener("click", () => {
  removeActiveClassBtn();
  celsiusBtn.classList.add("active");
  temperature = "celsius";
  if (weatherData.length === 0) return;
  updateDOM(weatherData);
});
fahrenheitBtn.addEventListener("click", () => {
  removeActiveClassBtn();
  fahrenheitBtn.classList.add("active");
  temperature = "fahrenheit";
  if (weatherData.length === 0) return;
  updateDOM(weatherData);
});

// Show Offcanvas menu
function openOffCanvas() {
  offCanvas.classList.add("visible");
}

// close Offcanvas menu
function closeOffCanvas() {
  offCanvas.classList.remove("visible");
  invalidFeedback.textContent = "";
  formSearchLocation.reset();
  locationList.innerHTML = "";
}

// remove current class active on button temperature
function removeActiveClassBtn() {
  document.querySelector(".btn-temp.active").classList.remove("active");
}

// show loaders
function showLoaders() {
  loaders.forEach((loader) => (loader.style.display = "block"));
  contents.forEach((content) => (content.style.display = "none"));
}

// hide loaders
function hideLoaders() {
  loaders.forEach((loader) => (loader.style.display = "none"));
  contents.forEach((content) => (content.style.display = "flex"));
}

// get current location by coordinates (latitude & longitude)
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      getLocationId(latitude, longitude);
    });
  }
}

// get location ID
async function getLocationId(latitude, longitude) {
  const data = await fetchData(
    `https://cors.bridged.cc/https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`
  );
  const { woeid } = data[1];
  getLocationInformation(woeid);
}

// get location information
async function getLocationInformation(woeid) {
  showLoaders();
  const data = await fetchData(
    `https://cors.bridged.cc/https://www.metaweather.com/api/location/${woeid}/`
  );
  weatherData = data;
  updateDOM(weatherData);
  hideLoaders();
}

// get some locations by city
async function getLocations(searchTerm) {
  const locations = await fetchData(
    `https://cors.bridged.cc/https://www.metaweather.com/api/location/search/?query=${searchTerm}`
  );

  invalidFeedback.textContent = "";
  locationList.innerHTML = "";

  if (locations.length === 0) {
    invalidFeedback.textContent = "Location could not be found!";
  } else {
    locations.forEach((location) => {
      const locationItem = document.createElement("li");
      const linkEl = document.createElement("a");
      locationItem.classList.add("location-item");
      linkEl.href = `https://www.metaweather.com/api/location/search/?query=${location.title}`;
      linkEl.setAttribute("data-woeid", location.woeid);
      linkEl.innerHTML = `${location.title} <span class="material-icons"> chevron_right </span>`;
      linkEl.addEventListener("click", handleClickLinkLocation);
      locationItem.appendChild(linkEl);
      locationList.appendChild(locationItem);
    });
  }
}

// handle click link location
function handleClickLinkLocation(event) {
  event.preventDefault();
  const locationId = this.dataset.woeid;
  getLocationInformation(locationId);
  closeOffCanvas();
}

// update DOM
function updateDOM(data) {
  const [currentWeather] = data["consolidated_weather"];
  const forecastWeathers = data["consolidated_weather"].slice(1);

  // image current weather
  currentWeatherImg.src = `https://www.metaweather.com/static/img/weather/${currentWeather.weather_state_abbr}.svg`;
  currentWeatherImg.alt = weatherImage[currentWeather.weather_state_name];

  // weather temp
  weatherTemp.innerHTML = `${
    temperature === "celsius"
      ? Math.floor(currentWeather.the_temp) + "<span>℃</span>"
      : convertToFahrenheit(Math.floor(currentWeather.the_temp)) +
        "<span>℉</span>"
  }`;

  // weather state name
  weatherStateName.textContent = currentWeather.weather_state_name;

  // created date
  todayEL.innerHTML = `Today <time>${formatDate(
    currentWeather.created
  )}</time>`;

  // location
  location.textContent = data.title;

  // clear forecast weather results
  forecastResults.innerHTML = "";

  // insert 5 day forecast into DOM forecast weather results
  forecastWeathers.forEach((weather, index) => {
    let dateText = "";
    index === 0
      ? (dateText = "Tomorrow")
      : (dateText = formatDate(weather["applicable_date"]));

    forecastResults.innerHTML += `
    <div class="weather-box">
      <time>${dateText}</time>
      <img
        src="${weatherImage[weather.weather_state_name]}"
        alt=""
      />
      <div class="degree">
        <p class="max-degree">${
          temperature === "celsius"
            ? Math.floor(weather["max_temp"]) + "<span>°C</span>"
            : convertToFahrenheit(Math.floor(weather["max_temp"])) +
              "<span>℉</span>"
        }</p>
        <p class="min-degree">${
          temperature === "celsius"
            ? Math.floor(weather["min_temp"]) + "<span>°C</span>"
            : convertToFahrenheit(Math.floor(weather["min_temp"])) +
              "<span>℉</span>"
        }</p>
      </div>
    </div>
    `;
  });

  // wind speed
  windSpeedEl.innerHTML = `${Math.floor(
    currentWeather["wind_speed"]
  )} <span>mph</span>`;

  // wind direction compass
  windDirectionEl.textContent = currentWeather["wind_direction_compass"];

  // humadity percentage
  humadityPercentageEl.innerHTML = `${currentWeather.humidity} <span>%</span>`;
  progressWidthEl.style.width = `${currentWeather.humidity}%`;

  // visibility
  visibilityEl.innerHTML = `${Math.floor(
    currentWeather.visibility
  )} <span>miles</span>`;

  // air pressure
  airPressureEl.innerHTML = `${Math.floor(
    currentWeather.air_pressure
  )} <span>mb</span>`;
}

getCurrentLocation();
