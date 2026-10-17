// 1. Listen for the button click
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityField').value.trim();
    if (city) {
        getCoordinates(city);
    } else {
        showError("Please enter a city name");
    }
});

// 2. First API Call: Get Coordinates (Chaining Step 1)
async function getCoordinates(city) {
    showError(""); // Clear previous errors
    try {
        // Open-Meteo Geocoding API (No key needed)
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        
        if (!response.ok) throw new Error("City not found");
        
        const data = await response.json();
        
        // Check if the API actually found a location
        if (!data.results || data.results.length === 0) {
            throw new Error("Location not found. Try a bigger city.");
        }

        // Extract coordinates from the response
        const { latitude, longitude, name, country } = data.results[0];
        
        // Pass the coordinates to the next function (Chaining)
        getWeather(latitude, longitude, name, country);

    } catch (error) {
        showError(error.message);
    }
}

// 3. Second API Call: Get Weather (Chaining Step 2)
async function getWeather(latitude, longitude, city, country) {
    try {
        // Open-Meteo Forecast API (No key needed)
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        
        if (!response.ok) throw new Error("Weather data not available");
        
        const data = await response.json();
        
        // Display the data
        displayWeather(data.current_weather, city, country);

    } catch (error) {
        showError(error.message);
    }
}

// 4. Update the HTML with the results (Data Shaping)
function displayWeather(weather, city, country) {
    document.getElementById('weatherContainer').style.display = 'block';
    
    // Map the WMO weather code to a simple text description
    // (Open-Meteo returns codes like 0, 1, 2, 3, 45, etc.)
    const weatherCodes = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
        55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 95: "Thunderstorm"
    };
    
    const conditionText = weatherCodes[weather.weathercode] || "Unknown";

    document.getElementById('cityName').textContent = `${city}, ${country}`;
    document.getElementById('temperature').textContent = `Temperature: ${weather.temperature}°C`;
    document.getElementById('condition').textContent = `Condition: ${conditionText}`;
    document.getElementById('windSpeed').textContent = `Wind Speed: ${weather.windspeed} km/h`;
}

// 5. Helper to show errors
function showError(message) {
    document.getElementById('weatherContainer').style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}