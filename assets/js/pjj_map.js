// Photojojo SVG Status Map

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

// takes a lat/long pair and draws a red dot on the map, with a label for debugging
function pathTest(testNum, lat, long, label) {

	// origin coordinates (Mobridge, SD)
	var originX = 431;
	var originY = 116;

	// compute coordinates
	var destX = projectLat(lat);
	var destY = projectLong(long);

	// add a label
	if (label !== undefined) {
		// add white background for legibility
		var lbl_bg = map.text(destX+5, destY, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 12, fill: '#fff', 'text-anchor': 'start', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'})
		var lbl = map.text(destX+5, destY, label).attr({'font-family': 'sans-serif', 'font-weight': 'bold', 'font-size': 12, fill: '#f00', 'text-anchor': 'start'})
	}

	// draw red map marker
	var mrkr = map.ellipse(destX, destY, 2, 2).attr({stroke: "none", fill: "#f00"}).translate(-1, -1);	
	
	// don't draw a path for origin
	if (originX == destX && originY == destY) {
		return;
	}
	
	setTimeout(function() {
	
		// midpoint coordinates (for curve)
		var midpointX = (originX+destX) / 2;
		var midpointY = (originY+destY) / 2;

		// draw shipping path from origin
		var pathSVG = 'M '+originX+' '+originY+' Q '+(midpointX-30)+' '+(midpointY+80)+' '+destX+' '+destY;
		
		// draw shipping path
		var ship_path = map.path(pathSVG).attr({opacity: .5, stroke: '#222', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '});
		
		// package marker
		var marker = map.ellipse(originX, originY, 6, 6).attr({stroke: "none", fill: "#66cccc"});
		marker.animateAlong(ship_path, 1000, function() {
			this.hide();
		});
	
	}, (testNum-1)*1000);
	
	
}

// project latitude onto map, return X coordinate
function projectLat(lat) {

	// TODO: map projection
	return lat;
	
}

// project longitude onto map, return Y coordinate
function projectLong(long) {
	
	// TODO: map projection
	return long;
	
}

// setup DEBUG flag for development
var DEBUG = ('debug' in urlParams);

// setup raphael object
var map = Raphael(document.getElementById('map'), 970, 500);

// draw usa outline
var usa = map.path(mapAssets.usa).attr({opacity: '.8', stroke: '#92724d', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'});

if (DEBUG) {

	// change map background to real map for debug
	$('#map').css('background-image', "url('./assets/images/realmap_bg.jpg')");
	
} else {
		
	// draw customer icon
	var customer = map.set();
	map.importSVG(mapAssets.customerSVG, customer);
	customer.scale(.7, .7).translate(120, 85);

	// draw warehouse icon
	var warehouse = map.path(mapAssets.warehouse).attr({fill: '#222', stroke: '#222', 'stroke-width': .5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}).translate(625, 200);

	// draw PJJ HQ
	var hq = map.image("./assets/images/pjj_hq.png", 80, 243, 80, 60);

	// draw example shipping path
	var pathSVG = 'M 660 245 c0,150 -200-100 -200,0 s-100,50 -100,0 s50,-50 50,0 s-100,50 -100,0 s50,-100 -130,-100';
	var ship_path = map.path(pathSVG).attr({stroke: '#3b4449', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '}); 

	// yellow location marker
	var marker = map.ellipse(660, 245, 8, 8).attr({stroke: "none", fill: "#ff0"});
	marker.animateAlong(ship_path, 8000, function() {
		this.hide();
	});
	
}

// setup some locations for projection testing
var tests = [];
tests[0] = [431, 116, 'Mobridge'];
tests[1] = [123, 74, 'Seattle'];
tests[2] = [271, 210, 'Salt Lake City'];
tests[3] = [122, 263];
tests[4] = [268, 338, 'Phoenix'];
tests[5] = [470, 392, 'Austin'];
tests[6] = [700, 419, 'Orlando'];
tests[7] = [696, 195, 'Cleveland'];

// test some locations
for (var l = 0; l < tests.length; l++) {
	pathTest(l, tests[l][0], tests[l][1], tests[l][2]);	
}
