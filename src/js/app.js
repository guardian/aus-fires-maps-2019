import * as d3 from "d3"
import * as topojson from "topojson"
import moment from "moment"

var interval = null;
var firstRun = true;
var currentDate = null;

function makeMap(states, data, places) {

	var statusMessage = d3.select("#statusMessage");
	var width = document.querySelector("#mapContainer").getBoundingClientRect().width
	var height = width * 0.6
	var mobile = false;

	if (width < 861) {
	    // height = width * 0.8;
	    mobile = true;
	}
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	var active = d3.select(null);
	var scaleFactor = width / 620
	var parseDate = d3.timeParse("%Y-%m-%d %H%M");
	var formatDate = d3.timeFormat("%Y-%m-%d");
	var topRadius = 1 * scaleFactor;

	// var maxYears = 10 * 364

	var colors = ['rgba(219, 0, 14, 0.6)', 'rgba(0, 0, 0, 0.6)'];				

	var gradient = d3.scaleLinear()
						.range(['rgba(219, 0, 14, 1)', 'rgba(0, 0, 0, 1)'])
						.domain([0,48])


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

	var canvas = d3.select(".interactive-container #mapContainer").append("canvas")	
	                .attr("width", width)
	                .attr("height", height)
	                .attr("id", "map-animation-csg")
	                .attr("overflow", "hidden");                          

	var context = canvas.node().getContext("2d"); 	              

	// context.clearRect(0, 0, width, height);

	var filterPlaces = places.features.filter(function(d){ 
		if (mobile) {
			return d.properties.scalerank < 6	
		}

		else {
			return d.properties.scalerank < 7		
		}
		
	});
	// console.log(filterPlaces);

	var path = d3.geoPath()
		    .projection(projection)
		    .context(context);

	var graticule = d3.geoGraticule();  	    	

	var bounds = path.bounds(topojson.feature(states,states.objects.states));
	var scale = 4
	var posX = 0.5
	var posY = 0.5
	var offsetX = (width * 1.1)
	var offsetY = (height * 0.3)
	var mapScale = scale / Math.max(
	    (bounds[1][0] - bounds[0][0]) / width,
	    (bounds[1][1] - bounds[0][1]) / height);

	var translation = [
	    (width - mapScale * (bounds[1][0] + bounds[0][0])) * 0.5 - offsetX,
	    (height - mapScale * (bounds[1][1] + bounds[0][1])) * 0.5 - offsetY] ;

	projection
		.scale(mapScale)
		.translate(translation)

	var raster_width = (bounds[1][0] - bounds[0][0]) * mapScale;
	var raster_height = (bounds[1][1] - bounds[0][1]) * mapScale;


	var rtranslate_x = (width - raster_width) * 0.5 - offsetX;
	var rtranslate_y = (height - raster_height) * 0.5 - offsetY;		

	var point1 = projection([151.20346,-33.86760])[0]
	var point2 = projection([151.21432,-33.86760])[0]

	console.log(point1,point2)

	var rCircle = (point2 - point1)

	console.log(rCircle)
	function drawMap() {

		     
	    context.drawImage(imageObj, rtranslate_x, rtranslate_y, raster_width, raster_height);
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

	var boundsLon = [147,154];
	var boundsLat = [-24,-34];

	data.forEach(function(d) {
		d.lat = +d.latitude;
		d.lon = +d.longitude;
		d.date = moment.utc(d.time, "YYYY-MM-DD HHmm")
	})

	console.log(data[data.length-1])

	data.sort(function(a, b) {
	    return a.date - b.date
	});

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
		
		var one_hour=1000*60*60;

		// Convert both dates to milliseconds
		var date1_ms = date1.valueOf();
		var date2_ms = date2.valueOf();

		// Calculate the difference in milliseconds
		var difference_ms = date2_ms - date1_ms;

		// Convert back to days and return
		// console.log(Math.round(difference_ms/one_day))
		var daysDiff = Math.round(difference_ms/one_hour)
		// if (daysDiff > maxYears) {
		// 	daysDiff = maxYears
		// }
		return gradient(Math.round(daysDiff))
	}

	var circumference = 6371000 * Math.PI * 2;
	var angle = 1000000 / circumference * 360;

	var circle = d3.geoCircle().center([-100,40]).radius(angle);

	function updateCircles(dateUpto) {

		// draw map
		// context.clearRect(0,0,width,height);
		// console.log(show)
		// drawMap()

		// var uptoDate = parseDate(dateUpto);
		
		// var filterData = data.filter(function(d){ 
		// 	return d.date < dateUpto
		// });

		var filterData = data.filter(function(d){ 
			return d.date.isSame(dateUpto, "hour")
		});


		// console.log(formatDate(data[0].date))

		filterData.forEach(function(d,i) {
			var circleColor = colors[1]
			// console.log(formatDate(d.date), dateUpto)
			context.beginPath();
			context.arc(projection([d.lon,d.lat])[0], projection([d.lon,d.lat])[1], rCircle, 0, 2 * Math.PI);
			context.fillStyle = fillGradient(d.date, dateUpto)
		    context.fill();
		    context.closePath();
		})


	}

	statusMessage.transition(600).style("opacity",0);

	var animationSpeed = 50

	// updateCircles('1996-01-01');

	var startDate = moment.utc(data[0].time, "YYYY-MM-DD HHmm")
	
	var endDate = moment.utc(data[data.length-1].time, "YYYY-MM-DD HHmm")
	console.log("endDate",endDate)
	if (firstRun) {
		currentDate = moment.utc(data[0].time, "YYYY-MM-DD HHmm")
	}

	console.log("currentDate",currentDate)

	function animate(t) {

		if (currentDate.isSameOrAfter(endDate)) {
			console.log("stop")
			interval.stop()
			animationRestart();
		}

		// console.log(currentDate.format("YYYY-MM-DD HH:mm"), currentDate.format("YYYY-MM-DD HH:mm"));
		updateCircles(currentDate);
		monthText.text(currentDate.local().format("MMM D"))
		yearText.text(currentDate.local().format("HH:mm"))
		currentDate.add(1, 'hours'); 
	
	}

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
		  		currentDate = moment.utc(data[0].time, "YYYY-MM-DD HHmm");
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
	d3.csv('<%= path %>/assets/mapdata2.csv'),
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