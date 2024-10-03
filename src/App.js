import './App.css';
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

function App() {
  const [gdpData, setGdpData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGDPData = async () => {
      try {
        const response = await fetch('http://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setGdpData(data[1]);

      } catch (error) {
        console.error('Error fetching GDP data:', error);
        setError('Failed to fetch data');
      }
    };

    fetchGDPData();
  }, []);

  useEffect(() => {
    if (gdpData.length > 0) {
      const dataset = gdpData.map((ell) => [new Date(ell.date).getFullYear(), ell.value]);
      const w = 800;
      const h = 500;
      const padding = 100;

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([d3.min(dataset, d => d[0]), d3.max(dataset, d => d[0])])
        .range([padding, w - padding]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])])
        .range([h - padding, padding]);

      // Select the div and append the SVG
      d3.select("#chart").selectAll("*").remove(); // Clear previous chart if re-rendering
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      const tooltip = d3.select("body")
                        .append("div")
                        .attr("id", "tooltip");

      // Create bars
      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0])) 
        .attr("y", d => yScale(d[1]))
        .attr("width", 12)
        .attr("height", d => h - padding - yScale(d[1]))
        .attr("class", "bar")
        .attr("data-date", d => d.date)
        .attr("data-gdp", d => d.value)
        .on("mouseover", function(event, d){
          tooltip.style("display", "block")
                  .html(`Year: ${d[0]}<br>GDP: $${(d[1] / 1e12).toFixed(2)}T`)
                  .attr("data-date", d[0])

        })
        .on("mousemove", function(event) {
          tooltip
            .style("top", `${h - 100}px`)  // Fixed 100px above the bottom of the chart
            .style("left", `${event.pageX + 70}px`);  // 70px to the right of the cursor
        })
        .on("mouseout", function(){
          tooltip.style("display", "none")
        })


      const xAxis = d3.axisBottom(xScale)
                      .tickFormat(d3.format("d"));

      const yAxis = d3.axisLeft(yScale)
                      .tickFormat(d3.format(".2s"))
                      .tickFormat(d => d / 1e12);

      svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis);

      svg.append("text")
          .attr("x", w/2)
          .attr("y", h - 50)
          .attr("text-anchor", "middle")
          .attr("class", "axis-label")
          .text("Year")

      svg.append("text")
          .attr("x", -h / 2)
          .attr("y", 50)
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("class", "axis-label")
          .text("GDP (in trillions)")
    }
  }, [gdpData]); // Run this effect when gdpData changes

  return (
    <div id = 'main'>
      <h1 id='title'>United States GDP</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div id="chart"></div> 
      )}
    </div>
  );
}

export default App;
