# PJJ Order Status Map Changelog

**July 7th, 2011 (x hours)**

- cleaned up v4 map, traced new USA outline closer to reference map.
- output new background images and SVG for new outline
- matched test cities to new map


**July 5th, 2011 (6 hours)**

- setup git repo, moved Raphael and svg-import into submodules to keep them updated
- moved all dropbox source files (.psd, .ai, .fla) to `/source` in repo
- cleaned up original map PSD, fit map to 970px X 500px (USA is now a little larger on paper, slightly less curve to edges)
- imported USA outline, warehouse and customer graphics into Illustrator and ran "simplify path" to cut down on SVG markup
- moved graphic SVG definitions into `/assets/js/pjj_map_assets.js`... when copying SVG markup from illustrator, make sure you remove all line breaks
- separated PJJ/GGB icon into transparent png, this is probably easier than dealing with SVG assets but doesn't scale
- added PJJ logo header and changed template width to match 970px. the thin grey border is just for reference
- added DEBUG flag for testing against a real map. if you visit **http://pastelabs.com/client/pjj_map/?debug** the background becomes the reference map. you can see the outline of the illustrated map doesn't match exactly. it wouldn't be difficult to redo it for accuracy
- wrote pathTest method in `/assets/js/pjj_map.js` which takes X/Y coordinates and draws a red dot, city label and shipping path from the origin (Mobridge, SD)
- added midpoint calculation for a simple curve to the paths
- added delayed animation for each testing path, interesting to see the performance drops painfully on IE when animating multiple items
- added README and pushed repo to private GitHub

_Next:
The map is coming along pretty quickly, but this was mostly the easy stuff. I've got the skeleton functions ready for lat/long conversion, hopefully I can just work out a simple formula that gives accurate results. From there it's gonna be animating monsters and lots of work on the path drawing._






