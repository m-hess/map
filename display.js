/*
PROJECT: Fake Data Map
DATE: 2.19.2018
AUTHORS: Madeline Hess
*/


// GENERATE MAP
mapboxgl.accessToken = 'pk.eyJ1IjoibWhlc3MiLCJhIjoiY2pja3F6dml1M2xqNDMzdDVjcmZyaWk1dCJ9.ONgNzFewg2rKF7bRvd7TPA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mhess/cjd6epxve56ti2qnjyxcw6aj1',
  center: [-96, 37.8],
  zoom: 3
});



// PULL DATA

// 1.) Pull JSON data from local file and create a usable array with it
$.loadJSON('generated.json', function(json) {

  // 2.) Transform incoming JSON data to GeoJSON,
  // create empty set called geojson to store transformed json data
  var geojson = {
    type: "FeatureCollection",
    features: [],
  };

  // 3.) Iterate through json array and add each item to geojson after formating
  // WARNING: No break statement implemented yet, if error occurs --> infinite loop
  for (i = 0; i < json.length; i++) {
    geojson.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [json[i].longitude, json[i].latitude]
      },
      "properties": {
        "address": json[i].address,
      },
    });
  }


  console.log(geojson);

  // ADD GEOCODER (ADDRESS SEARCH BAR)
  // Sources: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder/
  // https://www.mapbox.com/mapbox-gl-js/example/point-from-geocoder-result/
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  });

  map.addControl(geocoder);

  // Give proximity bias to Mapbox Geocoding API search results
  // Source: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-proximity-bias/
  map.on('load', updateGeocoderProximity); // set proximity on map load
  map.on('moveend', updateGeocoderProximity); // and then update proximity each time the map moves

  function updateGeocoderProximity() {
    if (map.getZoom() >= 11) {
      var center = map.getCenter().wrap(); // ensures the longitude falls within -180 to 180 as the Geocoding API doesn't accept values outside this range
      geocoder.setProximity({
        longitude: center.lng,
        latitude: center.lat
      });
      //console.log(center);
    } else if (map.getZoom() > 9) {
      var center = map.getCenter().wrap(); // ensures the longitude falls within -180 to 180 as the Geocoding API doesn't accept values outside this range
      geocoder.setProximity({
        longitude: center.lng,
        latitude: center.lat
      });
      //console.log(center);
    } else {
      geocoder.setProximity(null);
    }
  }



  // After the map style has loaded on the page, add a source layer and default
  // styling for a single point.
  map.on('load', function() {
    map.addSource('single-point', {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": []
      }
    });

    map.addLayer({
      "id": "point",
      "source": "single-point",
      "type": "circle",
      "paint": {
        "circle-radius": 8,
        "circle-color": "#0000ad"
      }
    });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
      map.getSource('single-point').setData(ev.result.geometry);
    });
  });


  // ADD DATA/LAYERS TO MAP
  map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("incidents", {
      type: "geojson",
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: geojson, //JSON.stringify(geojson, null, 2), //PROBLEM
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // Generate cluster circle layer
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "incidents",
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        "circle-color": [
          "step", ["get", "point_count"],
          "#e0ccff",
          50,
          "#a366ff",
          100,
          "#8533ff"
        ],
        "circle-radius": [
          "step", ["get", "point_count"],
          20,
          50,
          30,
          100,
          40
        ]
      }
    });

    // Generate cluster count layer
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "incidents",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12
      }
    });

    // Generate unclustered point layer
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "incidents",
      filter: ["!has", "point_count"],
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 4,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff"
      }
    });

    // Add popup layer for clusters
    // Taken from https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.


    //Add popups to unclustered points
    map.on('click', "unclustered-point", function(e) {
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        //DOESN'T WORK RIGHT NOW .setHTML('<h3>' + e.properties.title + '</h3><p>' + e.properties.assigneeregion + '</p><p>' + e.properties.address + '</p>')
        .setHTML(e.features[0].properties.address)
        .addTo(map);
    });


    // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
    map.on('click', 'clusters', function(e) {
      map.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: 9
      });
    });


    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function() {
      map.getCanvas().style.cursor = '';
    });

  });


  //Create Drawing tool, https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/
  var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    }
  });
  map.addControl(draw);

  map.on('draw.create', updateArea);
  map.on('draw.delete', updateArea);
  map.on('draw.update', updateArea);

  function updateArea(e) {
    var data = draw.getAll();
    var answer = document.getElementById('calculated-area');
    if (data.features.length > 0) {
      var area = turf.area(data);
      // restrict to area to 2 decimal points
      var rounded_area = Math.round(area * 100) / 100;
      answer.innerHTML = '<p>Area = <strong>' + rounded_area + '</strong> square meters</p>';
    } else {
      answer.innerHTML = '';
      if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
    }
  }


});
