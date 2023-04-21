import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';

function App() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState({});
  const [fastestAsteroid, setFastestAsteroid] = useState(null);
  const [closestAsteroid, setClosestAsteroid] = useState(null);
  const [averageSize, setAverageSize] = useState(null);

  const handleClick = async () => {
    try {
      const apiKey = "wx4sN1e4MVWCcd3vTa7wmZeB7CaKrGThsPZvN9Yi";
      const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

      const response = await axios.get(apiUrl);

      const dateLabels = Object.keys(response.data.near_earth_objects).sort();

      const data = {
        labels: dateLabels,
        datasets: [
          {
            label: "Number of Near Earth Objects",
            data: dateLabels.map(
              (date) => response.data.near_earth_objects[date].length
            ),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
      
      const options = {
        scales: {
          x: [{
            type: 'time',
            time: {
              tooltipFormat: 'll HH:mm',
              displayFormats: {
                hour: 'lll HH:mm',
                day: 'll',
              },
            },
            title: {
              display: true,
              text: 'Date',
            },
          }],
          y: [{
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Near Earth Objects',
            },
          }],
        },
      };
  
      setChartData({ data, options });

      const nearEarthObjects = response.data.near_earth_objects;
      let fastest = null;
      let closest = null;
      let totalSize = 0;
      let numAsteroids = 0;
      Object.values(nearEarthObjects).forEach((asteroidList) => {
        asteroidList.forEach((asteroid) => {
          const speed = asteroid.close_approach_data[0].relative_velocity
            .kilometers_per_hour;
          if (fastest === null || speed > fastest.speed) {
            fastest = { speed, name: asteroid.name };
          }

          const distance = asteroid.close_approach_data[0].miss_distance.kilometers;
          if (closest === null || distance < closest.distance) {
            closest = { distance, name: asteroid.name };
          }

          totalSize += asteroid.estimated_diameter.kilometers.estimated_diameter_max;
          numAsteroids++;
        });
      });

      setFastestAsteroid(fastest);
      setClosestAsteroid(closest);
      setAverageSize(totalSize / numAsteroids);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="start-date">Start Date:</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="end-date">End Date:</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button onClick={handleClick}>Search</button>
      {Object.keys(chartData).length > 0 && (
        <Line data={chartData.data} options={chartData.options} />
      )}
      {fastestAsteroid && (
        <p>Fastest Asteroid: {fastestAsteroid.name} ({fastestAsteroid.speed} km/h)</p>
      )}
      {closestAsteroid && (
        <p>Closest Asteroid: {closestAsteroid.name} ({closestAsteroid.distance} km away)</p>
      )}
      {averageSize && (
        <p>Average size of asteroids: {averageSize}</p>
      )}
    </div>
  );
}

export default App;