// prepare and init pjj_map
$(document).ready(function(){

	// get query string params
	// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript/2880929#2880929
	var urlParams = {};
	(function () {
		var e,
			a = /\+/g,	// regex for replacing addition symbol with a space
			r = /([^&=]+)=?([^&]*)/g,
			d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
			q = window.location.search.substring(1);

		while (e = r.exec(q))
		   urlParams[d(e[1])] = d(e[2]);
	})();

	// instantiate global pjj_map object
	window.pjj_map = new pjj_map();

	// setup debug flag for development
	pjj_map.debug = ('debug' in urlParams);

	// init pjj_map
	pjj_map.init();

	if ('debug' in urlParams) {

		// test map projection	
		pjj_map.testProjection();
		
	} else {
		
		// test map routing		
		pjj_map.testRoute();
		
	}

});

// Photojojo SVG Status Map
function pjj_map() {

	// raphael map object
	this.map;

	// debug flag for devlopment
	this.debug = false;

	// color for paths
	var brown = '#916639';

	// origin coordinates (Mobridge, SD)
	var origin = {x: 440, y: 114, lat: 45.53722, lon: -100.42791, label: 'MOBRIDGE, SD'};

	// top left coordinate (Seattle, Wash)
	var minLat = 47.66539;
	var minLon = -122.43164;
	var minX = 136;
	var minY = 72;

	// bottom right coordinate (Miami, Fl)
	var maxLat = 25.7889689;
	var maxLon = -80.2264393;
	var maxX = 719;
	var maxY = 454;

	// setup raphael map object
	this.init = function() {

		// setup raphael object
		map = Raphael(document.getElementById('map'), 970, 500);

		// draw usa outline
		map.path(mapAssets.usa).attr({opacity: '.7', stroke: brown, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'});

		// draw PJJ HQ
		map.image("./assets/images/pjj_hq.png", 94, 240, 80, 60);

	}
	
	// clear and re-init map
	this.reset = function() {
		
		map.clear();
		$('#results').empty();		
		this.init();
		
	}

	// test map projection with input form
	this.testProjection = function() {
		
		// add some locations for projection testing
		// http://www.getlatlon.com
		var tests = [];
		tests[0] = ['Mobridge', 45.5372162, -100.4279129];
		tests[1] = ['Seattle', 47.6062095, -122.3320708, ];
		tests[2] = ['San Francisco', 37.7749295, -122.4194155];
		tests[3] = ['Phoenix', 33.4483771, -112.0740373];
		tests[4] = ['Austin', 30.267153, -97.7430608];
		tests[5] = ['Miami', 25.7889689, -80.2264393];
		tests[6] = ['Atlanta', 33.7489954, -84.3879824];
		tests[7] = ['Pittsburgh', 40.4406248, -79.9958864];
		tests[8] = ['North', 49.023461463214126, -95.185546875];

		// change background to real map for location testing
		$('#map').css('background-image', "url('./assets/images/realmapv4_bg.jpg')");
		
		// setup test input
		$('#location').focus(function() {
			if (this.value = this.defaultValue) {
				this.value = "";
			}
		});

		// setup test location form
		$('#mapit').submit(function() {
			pjj_map.serviceRequest($('#location').val());
			return false;
		}).show();

		// hide route select
		$('#maproute').hide();

		// test locations
		for (var l = 0; l < tests.length; l++) {
			pjj_map.pathTest(l, tests[l][0], tests[l][1], tests[l][2]);
		}

	}

	// test shipment routes
	this.testRoute = function() {

		shipments = [];
		shipments[0] = [];
		shipments[0].push(['SIOUX FALLS, SD', 43.54998, -96.70033, false]);
		shipments[0].push(['ST. LOUIS, MO', 38.646991, -90.224967, true]);
		shipments[0].push(['RALEIGH, NC', 35.772096, -78.6386145, false]);
	
		shipments[1] = [];
		shipments[1].push(['SALT LAKE CITY, UT', 40.7607793, -111.8910474, true]);
		shipments[1].push(['PHOENIX, AZ', 33.4483771, -112.0740373, false]);
		
		shipments[3] = [];				
		shipments[3].push(['SPRINGFIELD, MO', 37.26530995561875, -93.33984375, true]);		
		shipments[3].push(['ATLANTA, GA', 33.8339199536547, -84.462890625, false]);

		shipments[2] = [];		
		shipments[2].push(['POCATELLO, ID', 42.8713032, -112.4455344, true]);
		shipments[2].push(['RENO, NV', 39.5296329, -119.8138027, false]);

				
		// add route options
		$.each(shipments, function(key, value) {
			var destination = value[value.length-1][0];
			$('#maproute').append(new Option(destination, key));
		});		
		
		// setup route select
		$('#maproute').change(function(){
			
			if ($(this).val() !== '') {
				pjj_map.reset();				
				var shipment = shipments[$(this).val()];
				var route = pjj_map.formatRoute(shipment.slice(0));
				$('#results').prepend('<br>' + JSON.stringify(route, null, 2) + '<br><br>');
				pjj_map.drawRoute(route);
			}
			
		}).show().change();
		
	}
		
	// format shipment array into route object, do map projections	
	this.formatRoute = function(shipment) {
		
		// format shipment into route object
		var route = {};
		route.origin = origin;
		
		// destination is last element in shipment array
		var destination = shipment.pop();
		
		// translate destination coords
		route.destination = this.mapProject(destination[1], destination[2]);		
		route.destination.lat = destination[1];
		route.destination.lon = destination[2];
		route.destination.label = destination[0];

		route.points = [];
		for (r = 0; r < shipment.length; r++) {
			
			// translate point coords
			var point = this.mapProject(shipment[r][1], shipment[r][2]);
			point.lat = shipment[r][1];
			point.lon = shipment[r][2];
			point.label = shipment[r][0];
			point.monster = shipment[r][3];
			
			route.points.push(point);
		}
		
		route.points.push(route.destination);
				
		return route;
		
	}

	// draw shipment route
	this.drawRoute = function(route) {
		
		// add warehouse icon
		map.image('./assets/images/warehouse.png', route.origin.x - 45, route.origin.y - 45, 90, 50);

		// DEBUG location marker
		this.locationMarker(route.origin.lat, route.origin.lon, route.origin.x, route.origin.y, route.origin.label);

		// add customer icon, facing left or right depending on relation to origin
		if (route.destination.x < route.origin.x) {
			map.image('./assets/images/customer_left.png', route.destination.x - 40, route.destination.y - 50, 55, 91);
		} else {
			map.image('./assets/images/customer_right.png', route.destination.x - 35, route.destination.y - 40, 55, 91);
		}

		// beging path drawing at origin
		var ship_path = 'M '+origin.x+' '+origin.y;

		// alternate curve
		var alt = false;
		
		// translate intermediate points
		for (var p = 0; p < route.points.length; p++) {
			
			// use destination for final point
			var point = route.points[p];

			// leave phoenix path incomplete
			if (point.label == 'PHOENIX, AZ') {
				continue;
			}

			// use origin for first point
			var prevpoint = (p > 0) ? route.points[p-1] : origin;
			var midpoint = {x: (prevpoint.x + point.x) / 2, y: (prevpoint.y + point.y) / 2};

			// distance formula
			var xs = Math.pow(prevpoint.x - point.x, 2);
			var ys = Math.pow(prevpoint.y - point.y, 2);
			var dist = Math.sqrt(xs + ys);
			
			// location of curve control points
			var shiftX = dist * .5;
			var shiftY = dist * .5;
			
			// alternate curve, depending on relation to origin
			if (route.destination.x > route.origin.x) {
				shiftX = -dist;
			}
			
			// alternate curve
			if (alt) {
				shiftX *= -1;
				shiftY *= -1;
			}
						 
			alt = ! alt;
				
			// draw shipping path with curve
			ship_path += ' Q '+(midpoint.x + shiftX)+' '+(midpoint.y + shiftY)+' '+point.x+' '+point.y;
			
			// control points
			// map.ellipse(midpoint.x, midpoint.y, 2, 2).attr({stroke: "none", fill: '#00f'});
			// map.ellipse(midpoint.x + shiftX, midpoint.y + shiftY, 2, 2).attr({stroke: "none", fill: '#0f0'});				
			
			// add monster icon
			if (point.monster) {
				map.image("./assets/images/brown_monster.png", point.x - 75, point.y - 60, 100, 69);				
			}
			
			// add location marker and label
			this.locationMarker(point.lat, point.lon, point.x, point.y, point.label);
			

		}
				
		// draw shipping path
		map.path(ship_path).attr({opacity: .8, stroke: brown, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '-'}).toBack();
	
		// location marker
		var marker = map.ellipse(origin.x, origin.y, 8, 8).attr({stroke: "none", fill: "#ea8815"});
		marker.animateAlong(ship_path, 7000, function() {
			this.hide();
		});
		


	}

	// takes a lat/lon pair and draws a dot and path on the map, with a label for debugging
	this.pathTest = function(testNum, label, lat, lon) {

		// map projection to get coordinatess
		var destination = this.mapProject(lat, lon);

		// don't test first location, the origin
		if (testNum > 0) {
			setTimeout(function() {

				// midpoint coordinates (for curve)
				var midpoint = {x: (origin.x + destination.x) / 2, y: (origin.y + destination.y) / 2};				

				// draw shipping path from origin
				var ship_path = 'M '+origin.x+' '+origin.y+' Q '+(midpoint.x - 30)+' '+(midpoint.y + 80)+' '+destination.x+' '+destination.y;

				// draw shipping path
				map.path(ship_path).attr({opacity: .8, stroke: brown, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '});

				// package marker
				var marker = map.ellipse(origin.x, origin.y, 6, 6).attr({stroke: "none", fill: "#66cccc"});
				marker.animateAlong(ship_path, 1000, function() {
					this.hide();
				});
				
				// draw marker with label
				pjj_map.locationMarker(lat, lon, destination.x, destination.y, label);				

			}, (testNum-1)*1000);

		}


	}
	
	this.locationMarker = function(lat, lon, x, y, label) {

		// add a label
		if (label !== undefined) {
			// add white background for legibility
			map.text(x+7, y+1, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 11, fill: '#fff', 'text-anchor': 'start', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}).toFront();
			map.text(x+7, y, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 11, fill: brown, 'text-anchor': 'start'}).toFront();
		}

		// draw location marker
		map.ellipse(x, y, 5, 5).attr({stroke: "none", fill: brown});
		
		// add coords to debug pane
		$('#results').prepend(label + ', ' + lat + ', ' + lon + "<br/>");
				

	}

	// just to easily switch out map projection methods
	this.mapProject = function(lat, lon) {

		var coords = this.mapProject2(lat, lon);
		
		return {x: Math.floor(coords.x), y: Math.floor(coords.y)};

	}

	// project lat/lon onto map, return X/Y coordinates
	// using distance calculation
	// http://www.meridianworlddata.com/Distance-Calculation.asp
	this.mapProject1 = function(lat, lon) {

		// calculate distance in miles
		var distY = 69.1 * (lat - minLat);
		var distX = 69.1 * (lon - minLon) * Math.cos(minLat/57.3);

		// lat = 25, shift = 1
		// lat = 48, shift = .85
		// gradient = -.0062x + 1.1625
		var shiftY = (-.0062 * lat) + 1.1625;

		// calculate miles per pixel
		// distance between seattle and miami
		// lon/x = 1938 miles / 583 pixels = 3.324 miles/pixel
		// lat/y = 1510 miles / 382 pixels = 3.953 miles/pixel
		var x = (distX / 3.36) + minX;
		var y = (distY / (3.953 * -shiftY)) + minY;

		return {x:x, y:y};

	}

	// project lat/lon onto map, return X/Y coordinates
	// using full Mercator projection
	// http://stackoverflow.com/questions/1019997/convert-lat-longs-to-x-y-co-ordinates/1020681#1020681
	this.mapProject2 = function(lat, lon) {

		// 1 degree of longitude in pixels
		var lon_size = 13.82;

		// 1 degree of latitude in pixels (average)
		var lat_size = 20.82;

		var map_width = lon_size * 360;
		var map_height = lat_size * 360;

		// longitude is simple scale
		var x = ((map_width * (180 + lon) / 360) % map_width);

		// convert from degrees to radians
		lat = lat * Math.PI / 180;

		// do the Mercator projection (w/ equator of 2pi units)
		var y = Math.log(Math.tan((lat/2) + (Math.PI/4)));

		// fit to our map
		y = (map_height / 2) - (map_width * y / (2 * Math.PI));

		// number of pixels to the prime meridian from 0, 0
		var shiftX = -660;

		// number of pixels to the equator from 0, 0
		var shiftY = -2925;

		return {x:x + shiftX, y:y + shiftY};
	}

	// project lat/lon onto map, return X/Y coordinates
	// using simple linear interpolation
	this.mapProject3 = function(lat, lon) {

		// lat = 25.7, shift = 1
		// lat = 47.6, shift = 1.1
		// gradient = .00456x + 0.883
		var shiftY = .00456 * lat + 0.883;

		var x = ((lon - minLon) / (maxLon - minLon)) * (maxX - minX);
		var y = ((lat - minLat) / (maxLat - minLat)) * (maxY - minY);

		return {x:x + minX, y:minY + y * shiftY};

	}

	// geocoding service request
	this.serviceRequest = function(query) {

		// geocoding service
		var service = 'http://tinygeocoder.com/create-api.php?q=' + query + '&callback=pjj_map.drawLocation';

		// request lat/lon pair with callback
		$.ajax({
			url: service,
			dataType: "script"
		});

	}

	// callback for geocoding service to draw location
	this.drawLocation = function(coords) {

		var label = $('#location').val();
		var lat = coords[0];
		var lon = coords[1];

		// draw location based on supplied coords
		this.pathTest(1, label, lat, lon);

		// clear input box
		$('#location').val('');

	}

}
