import * as d3 from "d3"
import * as topojson from "topojson"
import moment from "moment"

var zoomOn = null;

function makeMap(states, data, places) {

	var statusMessage = d3.select("#statusMessage");
	// console.log(data, places);
	var width = document.querySelector("#mapContainer").getBoundingClientRect().width
	var height = width * 0.6
	var mobile = false;

	if (width < 500) {
	    height = width * 0.8;
	    mobile = true;
	}
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	var active = d3.select(null);
	var scaleFactor = width / 860
	var parseDate = d3.timeParse("%Y-%m-%d");

	var topRadius = 25 * scaleFactor;
	var bottomRadius = 3 * scaleFactor;

	var mapScale = 1.8;

	if (mobile) {
		mapScale = 2
	}

	var radius = d3.scaleSqrt()
					.range([bottomRadius,topRadius])    
					.domain([1,550])	

	var projection = d3.geoMercator()
	                .center([155,-28])
	                .scale(width * mapScale)
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

	    filterPlaces.forEach(function(d,i) {
			context.beginPath();
			context.fillStyle = "#767676";
			context.fillText(d.properties.name,projection([d.properties.longitude,d.properties.latitude])[0],projection([d.properties.longitude,d.properties.latitude])[1]);
			context.font = "15px 'Guardian Text Sans Web' Arial";
		    context.closePath();

		})

	}

	drawMap();
	      
	var colorPurpose = d3.scaleOrdinal()
				.domain(['exploration', 'appraisal/pilot', 'development/production', 'other'])
				.range(["rgba(250, 135, 117,0.8)",
						"rgba(205, 52, 181,0.8)",
						"rgba(0, 0, 255,0.8)",
						"rgba(118, 118, 118, 0.8)"]);
	
	var colorStatus = d3.scaleOrdinal()
				.domain(["plugged and abandoned","suspended/capped/shut-in","producing","water bore","unknown"])
				.range(["rgba(255,164,116,0.8)",
						"rgba(244,116,97,0.8)",
						"rgba(139,0,0,0.8)",
						"rgba(118, 118, 118, 0.8)",
						"rgba(118, 118, 118, 0.8)"]);



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
		d.lat = +d.lat;
		d.lon = +d.lon;
		d.date = parseDate(d.date);
		d.sort_status = sortStatusIndex(d.status)
		d.sort_purpose = sortPurposeIndex(d.purpose)
	})

	
	function sortData(sortBy) {
		data.sort(function(a, b){
   			return d3.descending(a["sort_" + sortBy], b["sort_" + sortBy]);
		})
	}

	function updateCircles(dateUpto,show) {

		// draw map

		context.clearRect(0,0,width,height);
		console.log(show)
		drawMap()

		// console.log(dateUpto);

		var uptoDate = parseDate(dateUpto);

		var filterData = data.filter(function(d){ return d.date < uptoDate});

		function fillCategory(d) {
				if (show === 'status') {
					return colorStatus(d.status)
				}

				else if (show === 'purpose') {
					return colorPurpose(d.purpose)	
				}
				
		}

		filterData.forEach(function(d,i) {

			context.beginPath();
			context.arc(projection([d.lon,d.lat])[0], projection([d.lon,d.lat])[1], 2, 0, 2 * Math.PI);
			context.fillStyle = fillCategory(d)
		    context.fill();
		    context.closePath();

		})


	}

	statusMessage.transition(600).style("opacity",0);


	// updateCircles('1996-01-01');


	var startDateStr = '1980-08-01'
	var latest = '2018-06-01'
	// '2018-06-01'
	var endDate = moment('2018-06-01', 'YYYY-MM-DD')
	var currentDate = moment(startDateStr);

	function animate(t) {

		if (currentDate > endDate) {
			currentDate = moment(startDateStr, 'YYYY-MM-DD');
		}
		console.log(currentDate.format("YYYY-MM-DD"));
		updateCircles(currentDate.format("YYYY-MM-DD"), 'purpose');
		monthText.text(currentDate.format("MMM"))
		yearText.text(currentDate.format("YYYY"))
		currentDate.add(1, 'months'); 
	
	}

	// sortData('status');
	// console.log(data)
	// updateCircles(latest,'status');

	sortData('purpose');
	var interval = d3.interval(animate, 100);

	var monthText = d3.select("#monthText")
	var yearText = d3.select("#yearText")


	// var interval = d3.interval(animate, 200);



}


Promise.all([
	d3.json('<%= path %>/assets/au-states.json'),
	d3.csv('<%= path %>/assets/combined-wells.csv'),
	d3.json('<%= path %>/assets/places.json')
])
.then((results) =>  {
	makeMap(results[0],results[1],results[2])
});