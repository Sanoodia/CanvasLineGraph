function drawLineGraph(options) {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext("2d");
  const canvasHeight = 470,
    canvasWidth = 850;
  const padding = 80;
  // set canvas width/height
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // calculate average point
  console.log(options.dataset)
  const averagePoints = options.dataset.map((d) => d.average);
  // const averagePoints =  caculateMovingAverage(closingPoint,20) //for 20 days


  // get dates
  const dates = options.dataset.map((d) => d.date.split("T")[0]);
  // add total step by total dates on x-axis
  options.xAxis.totalSteps = dates.length - 1;

  //set graph min,max points
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;
  const graphMinX = padding,
    graphMaxX = canvasWidth - padding;
  const graphMinY = padding,
    graphMaxY = canvasHeight - padding;

  //upper and lower bounds y-axis value for chart
  const minAverage = Math.floor(Math.min(...averagePoints));
  const maxAverage = Math.ceil(Math.max(...averagePoints));

  //calculate stepSize for x,y-axis
  const stepSizeX = graphWidth / options.xAxis.totalSteps
  const stepSizeY = graphHeight / options.yAxis.totalSteps;

  // draw chart title
  context.save();
  context.fillStyle = "black";
  context.font = "16px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("20 Days Moving Average", canvasWidth / 2, padding / 2);

  // draw coordinates
  context.beginPath();
  context.moveTo(graphMinX, graphMinY);
  context.lineTo(graphMinX, graphMaxY);
  context.lineTo(graphMaxX, graphMaxY);
  context.stroke();

  //draw grid
  context.beginPath();
  context.strokeStyle = "#ccc";
  context.lineWidth = 1;
  context.setLineDash([5, 5]);

  // grid horizontal steps
  for (let i = 0; i <= options.yAxis.totalSteps; i++) {
    context.moveTo(padding, padding + i * stepSizeY);
    context.lineTo(padding + graphWidth, padding + i * stepSizeY);
    // y ticks
    context.font = options.yAxis.label.font;
    context.fillText(maxAverage - (((maxAverage - minAverage) / options.yAxis.totalSteps) * i),
      graphMinX - 40,
      padding + i * stepSizeY);
  }
  // grid vertical steps    
  for (let i = 0; i <= options.xAxis.totalSteps; i++) {
    context.moveTo(graphMaxX - (stepSizeX * i), graphMinY);
    context.lineTo(graphMaxX - (stepSizeX * i), graphMaxY);
    context.save();
    // x ticks
    if (dates[options.xAxis.totalSteps - i]) {
      context.translate(graphMaxX - (stepSizeX * i) - 15, graphMaxY + (padding / 2));
      context.rotate(-Math.PI / 3);
      context.font = options.xAxis.label.font;
      context.fillText(dates[options.xAxis.totalSteps - i], 0, 0);
      context.restore();
    }
  }
  context.stroke();

  // draw average line
  context.beginPath();
  context.strokeStyle = options.lineColor;
  context.lineWidth = 3;
  context.setLineDash([0, 0]);
  context.shadowColor = '#898';
  context.shadowBlur = 5;
  context.shadowOffsetX = 9;
  context.shadowOffsetY = 1.5;
  let circles = []
  for (let i = 0; i < averagePoints.length; i++) {
    const x = (stepSizeX * i) + padding;
    const y = ((maxAverage - averagePoints[i]) * (graphHeight / (maxAverage - minAverage)) + padding);
    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
      context.stroke();
    }
    // drawing points circles
    context.beginPath();
    context.arc(x, y, 3, 0, 2 * Math.PI);
    context.fillStyle = options.circleColor;
    context.fill();
    context.stroke();
    circles.push({
      id: averagePoints[i], // some ID
      x: x,
      y: y,
      radius: 3
    });
  }

  canvas.addEventListener("mousemove", function (e) {
    // correct mouse coordinates:
    var rect = canvas.getBoundingClientRect(), // make x/y relative to canvas
      x = e.clientX - rect.left,
      y = e.clientY - rect.top,
      i = 0,
      circle;

    // check which circle:
    while (circle = circles[i++]) {
      context.beginPath(); // we build a path to check with, but not to draw
      context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
      if (context.isPointInPath(x, y)) {
        console.log('aaa')
        showTooltip(e.clientX - 25, e.clientY - 55, "Circle", circle.id, dates[i - 1]);
        break;
      }
      hideTooltip();
    }
  });

}

function showTooltip(x, y, text, point, date) {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.innerHTML = `Average: ${Math.round(point * 10) / 10} <br> Date: ${date}`;
  tooltip.style.display = "block";
}

// Function to hide tooltip
function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}

const caculateMovingAverage = (data, window) => {
    const steps = data.length - window;
	const result = [ ];
    for (let i = 0; i < steps; ++i) {
        const sum = data.slice(i, i + window).reduce((prev, current) => {
          return prev + current.close;
        }, 0);
        result.push({
          average: sum / window,
          date: data[i].date
        });
    }
  	return result;
};

const getData = () =>{
  fetch("https://eodhistoricaldata.com/api/eod/IBM.US?api_token=5f5d2cad2a1510.03138117&fmt=json&period=d&from=2023-04-01")
	.then(response => response.json())
	.then(data =>{
    const dataset = caculateMovingAverage(data, 20);
    //draw line Graph

    const options = {
      dataset: dataset,
      lineColor: '#ca7370',
      circleColor: '#ca7370',
      yAxis: {
        totalSteps: 10,
        label: {
          color: "#000",
          font: "12px Arial",
          align: "center"
        },
      },
      xAxis: {
        label: {
          color: "#000",
          font: "12px Arial",
          align: "left"
        },
      }
    }
    
    drawLineGraph(options);
    }
  )
	.catch(err => console.error(err));

}
getData();