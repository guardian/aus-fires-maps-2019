import * as d3 from "d3"
import * as topojson from "topojson"
import moment from "moment"

var zoomOn = null;
var env = process.env.PATH;
var url = '<%= path %>/assets/image.png';

console.log(url)

function numberFormat(num) {
    if ( num > 0 ) {
        if ( num > 1000000000 ) { return ( num / 1000000000 ).toFixed(1) + 'bn' }
        if ( num > 1000000 ) { return ( num / 1000000 ).toFixed(1) + 'm' }
        if (num % 1 != 0) { return num.toFixed(2) }
        else { return num.toLocaleString() }
    }
    if ( num < 0 ) {
        var posNum = num * -1;
        if ( posNum > 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + 'bn'];
        if ( posNum > 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + 'm'];
        else { return num.toLocaleString() }
    }
    return num;
}

function makeMap(states, data) {

	var statusMessage = d3.select("#statusMessage");
	console.log(data);
	var width = document.querySelector("#mapContainer").getBoundingClientRect().width
	var height = width * 0.6

	if (width < 500) {
	    height = width * 0.8;
	}
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	var active = d3.select(null);
	var scaleFactor = width / 860
	var parseDate = d3.timeParse("%Y-%m-%d");

	var topRadius = 25 * scaleFactor;
	var bottomRadius = 3 * scaleFactor;



	var radius = d3.scaleSqrt()
					.range([bottomRadius,topRadius])    
					.domain([1,550])	

	var projection = d3.geoMercator()
	                .center([155,-28])
	                .scale(width * 1.8)
	                .translate([width/2,height/2])


	var locations = d3.select('#points');	                

	// console.log(sa2s.objects.sa2s
	   

	d3.select("#mapContainer svg").remove();
	        
	var canvas = d3.select("#mapContainer").append("canvas")	
	                .attr("width", width)
	                .attr("height", height)
	                .attr("id", "map")
	                .attr("overflow", "hidden");                          

	var context = canvas.node().getContext("2d"); 	              

	// context.clearRect(0, 0, width, height);

	var path = d3.geoPath()
	    .projection(projection)
	    .context(context);

	var graticule = d3.geoGraticule();  

	function drawMap() {
		context.beginPath();
	    path(graticule());
	    context.strokeStyle = "#efefef";
	    context.stroke();
	    
	    context.beginPath();
	    path(topojson.feature(states,states.objects.states));
	    context.fillStyle = "#dcdcdc";
	    context.fill();

	    context.beginPath();
	    path(topojson.mesh(states,states.objects.states, function(a, b) { return a !== b; }));
	    context.strokeStyle= "#ffffff";
	    context.stroke();
	}

	drawMap();

	// features.append("g")
	//     .selectAll("path")
	//     .data(topojson.feature(states,states.objects.states).features)
	//     .enter().append("path")
	//         .attr("class", "country")
	//         .attr("id", d => d.properties.ADMIN)
	//         .attr("fill", "#dcdcdc")
	//         .attr("data-tooltip","")
	//         .attr("d", path);

	// if (width > 480) {
	//     features.append("path")
	//       .attr("class", "mesh")
	//       .attr("stroke-width", 0.5)
	//       .attr("d", path(topojson.mesh(states,states.objects.states, function(a, b) { return a !== b; }))); 
	// }
	      

	var color = d3.scaleOrdinal()
				.domain(['exploration', 'appraisal/pilot', 'development/production', 'other'])
				.range(["#fa8775",
						"#cd34b5",
						"#0000ff",
						"#767676"]);


	data.forEach(function(d) {
		d.lat = +d.lat;
		d.lon = +d.lon;
		d.date = parseDate(d.date);
	})

	var dataByMonth = [];
	
	function updateCircles(i) {

		// draw map

		context.clearRect(0,0,width,height);

		drawMap()

		if (i == 0) {
			d3.selectAll(".mapCircle").remove()
		}

		var newData = dataByMonth[i]

		// console.log(newData);

		// var mapCircles = features.selectAll(".mapCircle")
		// 					.data(newData, function(d) { return d.index});				

		// mapCircles
		// 	.exit()
		// 	.remove()

		var elements = locations.selectAll("points.arc");
	  	elements.each(function(d) {
	    var node = d3.select(this);
	    context.beginPath();
		context.arc(node.attr("x"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
		context.fillStyle = node.attr("fillStyle");
	    context.fill();
	    context.closePath();
		})


		// mapCircles					
		// 	.enter()
		// 	.append("svg:circle")
		// 	.attr("class", "mapCircle")
		// 	.attr("cx",function(d){
		// 	 return projection([d.lon,d.lat])[0]
		// 	})
		// 	.attr("cy",function(d){ return projection([d.lon,d.lat])[1]})
		// 	.attr("r", function(d){ return 2 })
		// 	.style("fill", function(d) { return color(d.purpose); })
		// 	.style("opacity", 0.8);


	}

	statusMessage.transition(600).style("opacity",0);


	// updateCircles('1996-01-01');


	var startDateStr = '1980-08-01'
	// '2018-06-01'
	
	var endDate = moment('2018-06-01', 'YYYY-MM-DD')

	
	var currentDate = moment(startDateStr);
	var prevDate = moment(startDateStr).subtract(1, 'months');

	// while (currentDate < endDate) {

	// 	console.log("prevDate",prevDate.format("YYYY-MM-DD"), "currentDate", currentDate.format("YYYY-MM-DD"))

	// 	var filterdata = data.filter(function(d)
	// 		{ 
	// 			if (d.date >= prevDate && d.date < currentDate)
	// 			return d

	// 		});

	// 	dataByMonth.push(filterdata)
	// 	currentDate.add(1, 'months'); 
	// 	prevDate.add(1, 'months'); 
	// }

	console.log(dataByMonth);

	var monthText = d3.select("#monthText")
	var yearText = d3.select("#yearText")


	var endIndex = dataByMonth.length
	var counter = 0;

	function animate(t) {
		console.log(counter);
		if (counter == endIndex) {
			counter = 0
		}
		// updateCircles(counter)
		counter++
	}

	// var interval = d3.interval(animate, 200);



}


Promise.all([
	d3.json('<%= path %>/assets/au-states.json'),
	d3.csv('<%= path %>/assets/combined-wells.csv')
])
.then((results) =>  {
	makeMap(results[0],results[1])
});