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
var DEBUG = ("debug" in urlParams);

// change map background to real map for debug
if (DEBUG) {
	$('#paper').css("background-image", "url('./assets/images/realmap_bg.jpg')"); 
}

// setup raphael object
var paper = Raphael(document.getElementById('paper'), 970, 500);

// draw usa outline
var usa = paper.path(pjjMapAssets.usa).attr({opacity: '.8', stroke: '#92724d', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'});

// draw customer icon
var customer = paper.set();
paper.importSVG(pjjMapAssets.customerSVG, customer);
customer.scale(.7, .7).translate(120, 85);

// draw warehouse icon
var warehouse = paper.path(pjjMapAssets.warehouse).attr({fill: '#222', stroke: '#222', 'stroke-width': .5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}).translate(625, 200);

// draw PJJ HQ
if (! DEBUG) {
	var hq = paper.image("./assets/images/pjj_hq.png", 80, 243, 80, 60);
}

// draw shipping path
var ship_path = paper.path('M 660 245 c0,150 -200-100 -200,0 s-100,50 -100,0 s50,-50 50,0 s-100,50 -100,0 s50,-100 -130,-100').attr({stroke: '#3b4449', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '- '}); 

// yellow location marker
var marker = paper.ellipse(664, 251, 8, 8).attr({stroke: "none", fill: "#ff0"}).translate(-4, -4);
marker.animateAlong(ship_path, 8000, function() {
	this.hide();
});
