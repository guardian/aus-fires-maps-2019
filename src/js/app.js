import * as d3 from "d3"
import * as topojson from "topojson"
import moment from "moment"

var interval = null;
var firstRun = true;
var currentDate = null;

function makeMap(states, data, places) {

	var statusMessage = d3.select("#statusMessage");
	// console.log(data, places);
	var width = document.querySelector("#mapContainer").getBoundingClientRect().width
	var height = width * 0.6
	var mobile = false;

	if (width < 861) {
	    height = width * 0.8;
	    mobile = true;
	}
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	var active = d3.select(null);
	var scaleFactor = width / 860
	var parseDate = d3.timeParse("%Y-%m-%d");

	var topRadius = 10 * scaleFactor;
	var bottomRadius = 2;

	// var mapScale = 1.8;

	// if (mobile) {
	// 	mapScale = 2
	// }

	var maxYears = 10 * 364

	var radius = d3.scaleSqrt()
					.range([bottomRadius,topRadius])    
					.domain([6,400])	

	var gradient = d3.scaleLinear()
						.range(['rgba(219, 0, 14, 0.6)', 'rgba(1, 77, 175, 0.6)'])
						.domain([0,maxYears])


	var projection = d3.geoMercator()
	                .scale(1)
	                .translate([0,0])


	var locations = d3.select('#points');	                
	var imageObj = new Image()
	imageObj.src = '<%= path %>/assets/aus-crop-light.png'

	// console.log(sa2s.objects.sa2s
	   

	d3.select("#mapContainer canvas").remove();
	d3.select("#keyContainer svg").remove();

	var keyWidth = 110
	var keyHeight = 100

	if (width < 450) {
		keyWidth = 110
		keyHeight = 70
	}

	var key = d3.select("#keyContainer").append("svg")
					.attr("width", keyWidth)
	                .attr("height", keyHeight)
	                .attr("id", "keySvg");

	key.append("svg:circle")
		.attr("class", "keyCircle")
		.attr("cx", keyWidth * 0.33)
		.attr("cy",keyHeight * 0.5)
		.attr("r", radius(6));
             
	key.append("svg:circle")
		.attr("class", "keyCircle")
		.attr("cx", keyWidth * 0.66)
		.attr("cy",keyHeight * 0.5)
		.attr("r", radius(400));

	key.append("text")
		.attr("class", "keyLabel")
		.attr("x", keyWidth * 0.33)
		.attr("y",keyHeight * 0.8)
		.attr("text-anchor", "middle")
		.text("6");	

	key.append("text")
		.attr("class", "keyLabel")
		.attr("x", keyWidth * 0.66)
		.attr("y", keyHeight * 0.8)
		.attr("text-anchor", "middle")
		.text("400");		
	
	key.append("text")
		.attr("class", "keyHeading")
		.attr("x", keyWidth * 0.5)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.text("Estimated deaths");			

	var canvas = d3.select(".interactive-container #mapContainer").append("canvas")	
	                .attr("width", width)
	                .attr("height", height)
	                .attr("id", "map-animation-csg")
	                .attr("overflow", "hidden");                          

	var context = canvas.node().getContext("2d"); 	              

	// context.clearRect(0, 0, width, height);

	var path = d3.geoPath()
	    .projection(projection)
	    .context(context);

	var bounds = path.bounds(topojson.feature(states,states.objects.states));

	var mapScale = 1 / Math.max(
	    (bounds[1][0] - bounds[0][0]) / width,
	    (bounds[1][1] - bounds[0][1]) / height);

	var translation = [
	    (width - mapScale * (bounds[1][0] + bounds[0][0])) / 2,
	    (height - mapScale * (bounds[1][1] + bounds[0][1])) / 2];

	projection
		.scale(mapScale)
		.translate(translation);

	var raster_width = (bounds[1][0] - bounds[0][0]) * mapScale;
	var raster_height = (bounds[1][1] - bounds[0][1]) * mapScale;

	var rtranslate_x = (width - raster_width) / 2;
	var rtranslate_y = (height - raster_height) / 2;	       

	var graticule = d3.geoGraticule();  

	var filterPlaces = places.features.filter(function(d){ 
		if (mobile) {
			return d.properties.scalerank < 2	
		}

		else {
			return d.properties.scalerank < 3		
		}
		
	});
	// console.log(filterPlaces);

	function drawMap() {
		// context.beginPath();
	 //    path(graticule());
	 //    context.strokeStyle = "#efefef";
	 //    context.stroke();
	    
	    context.drawImage(imageObj, rtranslate_x, rtranslate_y, raster_width, raster_height);

	    // context.beginPath();
	    // path(topojson.feature(states,states.objects.states));
	    // context.fillStyle = "#dcdcdc";
	    // context.fill();

	    context.beginPath();
	    path(topojson.mesh(states,states.objects.states));
	    context.strokeStyle= "#bcbcbc";
	    context.stroke();
	    context.closePath();

	    filterPlaces.forEach(function(d,i) {
			context.beginPath();
			context.save();
			context.fillStyle="#767676";
			context.shadowColor="white";
			context.shadowBlur=5;
			context.fillText(d.properties.name,projection([d.properties.longitude,d.properties.latitude])[0],projection([d.properties.longitude,d.properties.latitude])[1]);
			context.font = "15px 'Guardian Text Sans Web' Arial";
		    context.closePath();
		    context.restore();

		})

	}



	drawMap();
	      
	// var colorPurpose = d3.scaleOrdinal()
	// 			.domain(['exploration', 'appraisal/pilot', 'development/production', 'other'])
	// 			.range(["rgba(250, 135, 117,0.8)",
	// 					"rgba(205, 52, 181,0.8)",
	// 					"rgba(0, 0, 255,0.8)",
	// 					"rgba(118, 118, 118, 0.8)"]);
	
	// var colorStatus = d3.scaleOrdinal()
	// 			.domain(["plugged and abandoned","suspended/capped/shut-in","producing","water bore","unknown"])
	// 			.range(["rgba(255,164,116,0.8)",
	// 					"rgba(244,116,97,0.8)",
	// 					"rgba(139,0,0,0.8)",
	// 					"rgba(118, 118, 118, 0.8)",
	// 					"rgba(118, 118, 118, 0.8)"]);



	function sortPurposeIndex(purposeText) {

		if (purposeText === 'development/production') {
			return 0
		}

		else if (purposeText === 'appraisal/pilot') {
			return 1
		}

		else if (purposeText === 'exploration') {
			return 2
		}

		else {
			return 3
		}

	}		

	function sortStatusIndex(statusText) {

		if (statusText === "producing") {
			return 0
		}

		else if (statusText === "suspended/capped/shut-in") {
			return 1
		}

		else if (statusText === 'plugged and abandoned') {
			return 2
		}

		else {
			return 3
		}

	}			

	data.forEach(function(d) {
		d.lat = +d.Latitude;
		d.lon= +d.Longitude;
		if (firstRun) {
			d.date = parseDate(d.date);
		}
		
		// d.sort_status = sortStatusIndex(d.status)
		// d.sort_purpose = sortPurposeIndex(d.purpose)
	})

	function sortData(sortBy) {
		data.sort(function(a, b){
   			return d3.descending(a["sort_" + sortBy], b["sort_" + sortBy]);
		})
	}

	function getRadius(d) {
		if (d < 6) {
			return radius(6)
		}

		else {
			return radius(d)
		}
	}

	function fillGradient(date1, date2) {
		//Get 1 day in milliseconds
		var one_day=1000*60*60*24;

		// Convert both dates to milliseconds
		var date1_ms = date1.getTime();
		var date2_ms = date2.getTime();

		// Calculate the difference in milliseconds
		var difference_ms = date2_ms - date1_ms;

		// Convert back to days and return
		// console.log(Math.round(difference_ms/one_day))
		var daysDiff = Math.round(difference_ms/one_day)
		if (daysDiff > maxYears) {
			daysDiff = maxYears
		}
		return gradient(Math.round(daysDiff))
	}


	function updateCircles(dateUpto) {

		// draw map

		context.clearRect(0,0,width,height);
		// console.log(show)
		drawMap()

		var uptoDate = parseDate(dateUpto);

		var filterData = data.filter(function(d){ 
			return d.date < uptoDate
		});

		filterData.forEach(function(d,i) {
			context.beginPath();
			context.arc(projection([d.lon,d.lat])[0], projection([d.lon,d.lat])[1], getRadius(d.Total_Dead_Mean), 0, 2 * Math.PI);
			context.fillStyle = fillGradient(d.date, uptoDate)
		    context.fill();
		    context.closePath();
		})


	}

	statusMessage.transition(600).style("opacity",0);

	var animationSpeed = 25

	// updateCircles('1996-01-01');


	var startDateStr = '1794-01-01'
	var latest = '2018-06-01'
	// '2018-06-01'
	var endDate = moment('1930-01-01', 'YYYY-MM-DD')
	if (firstRun) {
		currentDate = moment(startDateStr);
	}

	function animate(t) {

		if (currentDate.isSameOrAfter(endDate)) {
			console.log("stop")
			interval.stop()
			animationRestart();
		}

		// console.log(currentDate.format("YYYY-MM-DD"));
		updateCircles(currentDate.format("YYYY-MM-DD"));
		monthText.text(currentDate.format("MMM"))
		yearText.text(currentDate.format("YYYY"))
		currentDate.add(1, 'months'); 
	
	}


	// sortData('status');
	// console.log(data)
	// updateCircles(latest,'status');

	sortData('purpose');
	// console.log(interval)
	// if (interval != null) {
	// 	console.log(interval)
	// 	interval.stop()
	// }
	interval = d3.interval(animate, animationSpeed);
	var monthText = d3.select("#monthText")
	var yearText = d3.select("#yearText")

	function animationRestart() {
		console.log("pause")
		
		monthText.text("Replaying")

		var t = d3.timer(function(elapsed) {
			monthText.text("Paused")
		  	yearText.text(10 - Math.round(elapsed/1000))
		  	// console.log(elapsed)
		  	if (elapsed > 10000)

		  	{
		  		t.stop()
		  		currentDate = moment(startDateStr, 'YYYY-MM-DD');
				interval.restart(animate, animationSpeed)
		  	} 
		}, 1000);

		// setTimeout(function(){ 
		// 	console.log("restart")
		// 	currentDate = moment(startDateStr, 'YYYY-MM-DD');
		// 	interval.restart(animate, animationSpeed)
		// }, 100000);
	}
	firstRun = false
	// var interval = d3.interval(animate, 200);

}


Promise.all([
	d3.json('<%= path %>/assets/au-states.json'),
	d3.csv('<%= path %>/assets/combined.csv'),
	d3.json('<%= path %>/assets/places.json')
])
.then((results) =>  {
	makeMap(results[0],results[1],results[2])

	var to=null
	var lastWidth = document.querySelector("#mapContainer").getBoundingClientRect()
	window.addEventListener('resize', function() {

		var thisWidth = document.querySelector("#mapContainer").getBoundingClientRect()
		if (lastWidth != thisWidth) {
			
			window.clearTimeout(to);
			to = window.setTimeout(function() {
					interval.stop()
				    makeMap(results[0],results[1],results[2])
				}, 100)
		}
			
	})

});