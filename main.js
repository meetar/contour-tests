/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var locations = {
        'Oakland': [37.8044, -122.2708, 15],
        'New York': [40.70531887544228, -74.00976419448853, 15],
        'Seattle': [47.5937, -122.3215, 15],
        'San Francisco': [37.7696, -122.4330, 12.8]
    };

    var map_start_location = locations['San Francisco'];

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map',
        {"keyboardZoomOffset" : .05}
    );

    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        numWorkers: 2,
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>',
        unloadInvisibleTiles: false,
        updateWhenIdle: false
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    // setView expects format ([lat, long], zoom)
    map.setView(map_start_location.slice(0, 3), map_start_location[2]);

    var hash = new L.Hash(map);

        // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true, hideable: false, width: 300 });
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;
        gui.altitude = -5;
        gui.add(gui, 'altitude', -5, 20).name("&nbsp;&nbsp;altitude").onChange(function(value) {
            var a = 0;
            a = Math.min(1, .66/Math.abs(value + 5));
            scene.styles.sfneg5.shaders.uniforms.u_alpha_5 = a;
            a = .66/Math.abs(value - 0);
            scene.styles.sf0.shaders.uniforms.u_alpha0 = a;
            a = .66/Math.abs(value - 5);
            scene.styles.sf5.shaders.uniforms.u_alpha5 = a;
            a = .66/Math.abs(value - 10);
            scene.styles.sf10.shaders.uniforms.u_alpha10 = a;
            a = .66/Math.abs(value - 15);
            scene.styles.sf15.shaders.uniforms.u_alpha15 = a;
            a = .66/Math.abs(value - 20);
            scene.styles.sf20.shaders.uniforms.u_alpha20 = a;
            scene.requestRedraw();
        });
    }

    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
        });
        layer.addTo(map);
    });

    return map;

}());
