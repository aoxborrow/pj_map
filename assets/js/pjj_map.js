// Photojojo SVG Status Map
$(document).ready(function(){

	// get query string params
	// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript/2880929#2880929
	var urlParams = {};
	(function () {
	    var e,
	        a = /\+/g,  // regex for replacing addition symbol with a space
	        r = /([^&=]+)=?([^&]*)/g,
	        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
	        q = window.location.search.substring(1);

	    while (e = r.exec(q))
	       urlParams[d(e[1])] = d(e[2]);
	})();

	// setup DEBUG flag for development
	var DEBUG = ('debug' in urlParams);

	// setup raphael object
	var map = Raphael(document.getElementById('map'), 970, 500);

	// setup some locations for projection testing
	// http://www.getlatlon.com
	var tests = [];
	tests[0] = ['Mobridge', 45.5372162, -100.4279129];
	tests[1] = ['Seattle', 47.6062095, -122.3320708, ];
	tests[2] = ['.  SF', 37.7749295, -122.4194155];
	tests[3] = ['Phoenix', 33.4483771, -112.0740373];
	tests[4] = ['Austin', 30.267153, -97.7430608];
	tests[5] = ['Miami', 25.7889689, -80.2264393];
	tests[6] = ['Atlanta', 33.7489954, -84.3879824];
	tests[7] = ['Pittsburgh', 40.4406248, -79.9958864];
	tests[8] = ['North', 49.023461463214126, -95.185546875];

	// test some locations
	for (var l = 0; l < tests.length; l++) {
		pathTest(map, l, tests[l][0], tests[l][1], tests[l][2]);	
	}

	// pretty print JSON
	var debug_text = JSON.stringify(tests, null, 2);

	// add to body
	$('body').append('<div id="debug">' + debug_text + '</div>');

	if (DEBUG) {

		// change map background to real map for debug
		$('#map').css('background-image', "url('./assets/images/realmapv4_bg.jpg')");
		
	
	} else {
		
		// draw usa outline 
		var usa = map.path(mapAssets.usa).attr({opacity: '.7', stroke: brown, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'});		
		
		// draw PJJ HQ
		var hq = map.image("./assets/images/pjj_hq.png", 94, 240, 80, 60);			

		/*	
		// draw customer icon
		var customer = map.set();
		map.importSVG(mapAssets.customerSVG, customer);
		customer.scale(.7, .7).translate(120, 85);

		// draw warehouse icon
		var warehouse = map.path(mapAssets.warehouse).attr({fill: '#222', stroke: '#222', 'stroke-width': .5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}).translate(625, 200);

		// draw example shipping path
		var pathSVG = 'M 660 245 c0,150 -200-100 -200,0 s-100,50 -100,0 s50,-50 50,0 s-100,50 -100,0 s50,-100 -130,-100';
		var ship_path = map.path(pathSVG).attr({stroke: '#3b4449', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '}); 

		// location marker (yellow: #ff0)
		var marker = map.ellipse(660, 245, 8, 8).attr({stroke: "none", fill: "#ea8815"});
		marker.animateAlong(ship_path, 8000, function() {
			this.hide();
		});*/
	
	}
	
});

// color for paths
var brown = '#916639';

// top left coordinate, Seattle, Wash
var minLat = 47.66539;
var minLon = -122.43164;
var minX = 136;
var minY = 72;

// bottom right coordinate, Miami, Fl
var maxLat = 25.7889689;
var maxLon = -80.2264393;
var maxX = 719;
var maxY = 454;

// takes a lat/lon pair and draws a red dot on the map, with a label for debugging
function pathTest(map, testNum, label, lat, lon) {
	
	// origin coordinates (Mobridge, SD)
	var originX = 440;
	var originY = 114;

	// map projection to get coordinatess
	var dest = mapProject1(lat, lon);
	var destX = dest.x;
	var destY = dest.y;
	
	// don't test first location, the origin
	if (testNum > 0) {
		setTimeout(function() {
	
			// midpoint coordinates (for curve)
			var midpointX = (originX+destX) / 2;
			var midpointY = (originY+destY) / 2;

			// draw shipping path from origin
			var pathSVG = 'M '+originX+' '+originY+' Q '+(midpointX-30)+' '+(midpointY+80)+' '+destX+' '+destY;
		
			// draw shipping path
			var ship_path = map.path(pathSVG).attr({opacity: .5, stroke: brown, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '});
		
			// package marker
			var marker = map.ellipse(originX, originY, 6, 6).attr({stroke: "none", fill: "#66cccc"});
			marker.animateAlong(ship_path, 1000, function() {
				this.hide();
			});
	
		}, (testNum-1)*1000);

	}
	
	// add a label
	if (label !== undefined) {
		// add white background for legibility
		var lbl_bg = map.text(destX+7, destY, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 12, fill: '#fff', 'text-anchor': 'start', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'})
		var lbl = map.text(destX+7, destY, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 12, fill: brown, 'text-anchor': 'start'})
	}

	// draw location marker
	var mrkr = map.ellipse(destX, destY, 2, 2).attr({stroke: "none", fill: brown});
	
}

// project latitude onto map, return coordinates
// using distance calculation
// http://www.meridianworlddata.com/Distance-Calculation.asp
function mapProject1(lat, lon) {
	
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

// project latitude onto map, return coordinates
// using full Mercator projection
// http://stackoverflow.com/questions/1019997/convert-lat-longs-to-x-y-co-ordinates/1020681#1020681
function mapProject2(lat, lon) {

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

// project latitude onto map, return coordinates
// using simple linear interpolation
function mapProject3(lat, lon) {
	
	// lat = 25.7, shift = 1
	// lat = 47.6, shift = 1.1
	// gradient = .00456x + 0.883
	var shiftY = .00456 * lat + 0.883;

	var x = ((lon - minLon) / (maxLon - minLon)) * (maxX - minX);
	var y = ((lat - minLat) / (maxLat - minLat)) * (maxY - minY);

	return {x:x + minX, y:minY + y * shiftY};

}
