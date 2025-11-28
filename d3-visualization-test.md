# D3.js 可视化测试

这是一个测试D3.js可视化的示例文档。

## 基础条形图

```javascript-viz
const data = [30, 86, 168, 281, 303, 365];

const svg = d3.select(container)
  .append("svg")
  .attr("width", 600)
  .attr("height", 400);

const margin = {top: 20, right: 30, bottom: 30, left: 40};
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const x = d3.scaleBand()
  .domain(data.map((d, i) => `项目${i+1}`))
  .range([0, width])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data)])
  .nice()
  .range([height, 0]);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

g.append("g")
  .call(d3.axisLeft(y));

g.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", (d, i) => x(`项目${i+1}`))
  .attr("width", x.bandwidth())
  .attr("y", d => y(d))
  .attr("height", d => height - y(d))
  .attr("fill", "steelblue");
```

## 交互式饼图

```javascript-viz
const data = [
  { name: "JavaScript", value: 45, color: "#f0db4f" },
  { name: "Python", value: 38, color: "#68b684" },
  { name: "Java", value: 25, color: "#ef4444" },
  { name: "C++", value: 15, color: "#60a5fa" },
  { name: "Other", value: 12, color: "#94a3b8" }
];

const width = 500;
const height = 500;
const radius = Math.min(width, height) / 2;

const svg = d3.select(container)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${width/2},${height/2})`);

const pie = d3.pie()
  .value(d => d.value)
  .sort(null);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

const arcHover = d3.arc()
  .innerRadius(0)
  .outerRadius(radius * 1.1);

const arcs = g.selectAll(".arc")
  .data(pie(data))
  .enter()
  .append("g")
  .attr("class", "arc")
  .append("path")
  .attr("d", arc)
  .attr("fill", d => d.color)
  .on("mouseover", function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", arcHover);
  })
  .on("mouseout", function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", arc);
  });

arcs.append("text")
  .attr("transform", d => `translate(${arc.centroid(d)})`)
  .attr("text", d => `${d.name}: ${d.value}%`)
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .style("font-size", "12px");
```

## 动画折线图

```javascript-viz
const data = [
  { month: "1月", value: 100 },
  { month: "2月", value: 150 },
  { month: "3月", value: 120 },
  { month: "4月", value: 200 },
  { month: "5月", value: 180 },
  { month: "6月", value: 220 }
];

const margin = {top: 20, right: 30, bottom: 30, left: 50};
const width = 600 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select(container)
  .append("svg")
  .attr("width", 600)
  .attr("height", 300);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand()
  .domain(data.map(d => d.month))
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .nice()
  .range([height, 0]);

const line = d3.line()
  .x(d => x(d.month))
  .y(d => y(d.value))
  .curve(d3.curveMonotoneX);

g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

g.append("g")
  .call(d3.axisLeft(y));

const path = g.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line);

const totalLength = path.node().getTotalLength();

path
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  .transition()
  .duration(2000)
  .ease(d3.easeLinear)
  .attr("stroke-dashoffset", 0);

g.selectAll(".dot")
  .data(data)
  .enter().append("circle")
  .attr("class", "dot")
  .attr("cx", d => x(d.month))
  .attr("cy", d => y(d.value))
  .attr("r", 5)
  .attr("fill", "steelblue")
  .on("mouseover", function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("r", 8);
  })
  .on("mouseout", function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("r", 5);
  });
```