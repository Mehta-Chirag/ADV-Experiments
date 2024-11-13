// Load the CSV data
d3.csv("Algerian_forest_fires_dataset_CLEANED.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.Temperature = +d.Temperature;
        d.FWI = +d.FWI;
        d.RH = +d.RH;
        d.month = +d.month;
        d.Classes = d.Classes.trim();
    });

    // Scatter Plot: Temperature vs. FWI
    createScatterPlot(data);

    // Histogram: Humidity Distribution
    createHistogram(data);

    // Bar Chart: Monthly Fire Incidents
    createBarChart(data);

    // Pie Chart: Fire Incident Class Distribution
    createPieChart(data);

    // Line Chart: Average Temperature by Month
    createLineChart(data);
});

// Scatter Plot: Temperature vs. FWI
function createScatterPlot(data) {
    const width = 400, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const svg = d3.select("#scatter-plot").append("svg").attr("width", width).attr("height", height);

    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Temperature)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain(d3.extent(data, d => d.FWI)).range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    svg.selectAll("circle").data(data).enter().append("circle")
        .attr("cx", d => x(d.Temperature))
        .attr("cy", d => y(d.FWI))
        .attr("r", 3)
        .attr("fill", "steelblue");

    svg.append("text").attr("x", width / 2).attr("y", height - 20).attr("text-anchor", "middle").text("Temperature");
    svg.append("text").attr("x", -height / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)").text("FWI");
    svg.append("text").attr("x", width / 2).attr("y", margin.top).attr("text-anchor", "middle").text("Temperature vs FWI");
}

// Histogram: Humidity Distribution
function createHistogram(data) {
    const width = 400, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const svg = d3.select("#humidity-histogram").append("svg").attr("width", width).attr("height", height);

    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const bins = d3.bin().domain(x.domain()).thresholds(10)(data.map(d => d.RH));
    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    svg.selectAll("rect").data(bins).enter().append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - margin.bottom - y(d.length))
        .attr("fill", "green");

    svg.append("text").attr("x", width / 2).attr("y", height - 20).attr("text-anchor", "middle").text("Relative Humidity");
    svg.append("text").attr("x", -height / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)").text("Frequency");
    svg.append("text").attr("x", width / 2).attr("y", margin.top).attr("text-anchor", "middle").text("Humidity Distribution");
}

// Bar Chart: Monthly Fire Incidents
function createBarChart(data) {
    const width = 400, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const svg = d3.select("#monthly-bar-chart").append("svg").attr("width", width).attr("height", height);

    const fireIncidents = d3.rollup(data.filter(d => d.Classes === "fire"), v => v.length, d => d.month);
    const x = d3.scaleBand().domain(Array.from(fireIncidents.keys())).range([margin.left, width - margin.right]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(fireIncidents.values())]).range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat(d => `Month ${d}`));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    svg.selectAll("rect").data(Array.from(fireIncidents)).enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d[1]))
        .attr("fill", "orange");

    svg.append("text").attr("x", width / 2).attr("y", height - 20).attr("text-anchor", "middle").text("Month");
    svg.append("text").attr("x", -height / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)").text("Number of Fires");
    svg.append("text").attr("x", width / 2).attr("y", margin.top).attr("text-anchor", "middle").text("Monthly Fire Incidents");
}

// Pie Chart: Fire Incident Class Distribution
function createPieChart(data) {
    const width = 400, height = 400, radius = Math.min(width, height) / 2 - 40;

    // Create SVG
    const svg = d3.select("#fire-class-pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Prepare Pie Data
    const pie = d3.pie().value(d => d[1]); // Value for each slice
    const pieData = d3.rollup(data, v => v.length, d => d.Classes);
    const dataArray = Array.from(pieData);

    // Arcs
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const labelArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius * 0.7);

    // Color Scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw Slices
    svg.selectAll("path")
        .data(pie(dataArray))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(d.data[0]));

    // Add Labels (Percentages)
    svg.selectAll("text")
        .data(pie(dataArray))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => `${d.data[0]} (${(d.data[1] / d3.sum(dataArray, d => d[1]) * 100).toFixed(1)}%)`);

    // Chart Title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -radius - 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Fire Incident Distribution");
}


// Line Chart: Average Temperature by Month
function createLineChart(data) {
    const width = 400, height = 400, margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const svg = d3.select("#temperature-line-chart").append("svg").attr("width", width).attr("height", height);

    // Month number to name mapping
    const monthNames = { 6: "June", 7: "July", 8: "August", 9: "September" };

    // Prepare the data for monthly average temperature
    const avgTempByMonth = Array.from(
        d3.rollup(data, v => d3.mean(v, d => d.Temperature), d => d.month),
        ([month, temp]) => ({ month: monthNames[month] || month, temp }) // Map month number to name
    );

    const x = d3.scaleBand().domain(avgTempByMonth.map(d => d.month)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(avgTempByMonth, d => d.temp)]).range([height - margin.bottom, margin.top]);

    // Draw the axes with month names on the x-axis
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    // Add the line with smooth transition
    const line = d3.line().x(d => x(d.month) + x.bandwidth() / 2).y(d => y(d.temp)).curve(d3.curveMonotoneX);
    svg.append("path").datum(avgTempByMonth)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add data points
    svg.selectAll("circle")
        .data(avgTempByMonth)
        .enter().append("circle")
        .attr("cx", d => x(d.month) + x.bandwidth() / 2)
        .attr("cy", d => y(d.temp))
        .attr("r", 4)
        .attr("fill", "red");

    // Tooltip setup
    const tooltip = d3.select("body").append("div").style("position", "absolute").style("background", "#fff")
        .style("border", "1px solid #ccc").style("padding", "5px").style("visibility", "hidden");

    svg.selectAll("circle")
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .text(`Month: ${d.month}, Avg Temp: ${d.temp.toFixed(2)}°C`);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });

    // Add labels for axes
    svg.append("text").attr("x", width / 2).attr("y", height - 20).attr("text-anchor", "middle").text("Month");
    svg.append("text").attr("x", -height / 2).attr("y", 20).attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)").text("Average Temperature (°C)");

    // Add chart title
    svg.append("text").attr("x", width / 2).attr("y", margin.top / 2).attr("text-anchor", "middle")
        .style("font-size", "16px").text("Average Temperature by Month");
}
