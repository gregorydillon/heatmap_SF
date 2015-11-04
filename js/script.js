// This example shows how to use the bounding box of a leaflet view to 
// SODA within_box query, pulling data for the current map view from a Socrata dataset

  //initialize the leaflet map, set options, view, and basemap
  
  
  
  
  var map = L.map('map', {
      zoomControl: false,
      
      scrollWheelZoom: false
    })
    .setView([37.760693, -122.418475], 14);
  
    //add an OSM tileset as the base layer
    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
      minZoom: 14,
      maxZoom: 16,
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);


  // L.tileLayer(
  //   'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
  //     minZoom: 0,
  //     maxZoom: 19,
  //     attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  //   }).addTo(map);

  var markers = new L.FeatureGroup();

  //figure out what the date was 7 days ago
  var sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //show the "since" date in the title box
  $('#startDate').html(sevenDaysAgo.toDateString());

  //create a SODA-ready date string for 7 days ago that looks like: YYYY-mm-dd
  sevenDaysAgo = sevenDaysAgo.getFullYear() + '-' 
    + cleanDate((sevenDaysAgo.getMonth() + 1)) + '-' 
    + cleanDate((sevenDaysAgo.getDate() + 1));


  //call getData() once
  getData();

  function getData() {
    //clear markers before getting new ones
    markers.clearLayers();


    var sodaQueryCircle = "37.760693, -122.418475,2000";

    //use jQuery's getJSON() to call the SODA API for SF311
    $.getJSON(buildQuery(sevenDaysAgo, sodaQueryCircle), function(data) {

      //iterate over each 311 complaint, add a marker to the map
      for (var i = 0; i < data.length; i++) {
        
        var marker = data[i];
        var markerItem = L.circleMarker(
          [marker.point.latitude,marker.point.longitude], {
            radius: 5,
            fillColor: "steelblue",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });

        markerItem.bindPopup(
          '<h4>' + marker.status + '</h4>' 
          + (new Date(marker.opened)).toDateString() 
          + ((marker.address != null) ? '<br/>' + marker.address : '')
        );

        markers.addLayer(markerItem);
      }
      //.addTo(map);
      map.addLayer(markers);

      //fade out the loading spinner
      $('#spinnerBox').fadeOut();
    })
  }

  //assemble a valid SODA API call using within_box() and opened>{a week ago}
  function buildQuery(sevenDaysAgo, sodaQueryCircle) {
    var query =
      "https://data.sfgov.org/City-Infrastructure/Homeless_Concerns_Source-311app/jr8h-g9z9?$select=point,closed,opened,status,case_id,address&$where=opened>'" +
      sevenDaysAgo + "' AND within_circle(point," + sodaQueryCircle +
      ")&$order=opened desc";

    console.log(query);
    return query;
  }

  //add leading zero if month or day is less than 10
  function cleanDate(input) {
    return (input < 10) ? '0' + input : input;
  }


