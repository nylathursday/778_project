/*Nyla Thursday GEOG 778 Final Project: UW Madison, May 2023
Data: County Health Rankings & Roadmap 2014-2022*/

//declare global variables
var map;
var attributes;
var currentAttribute;

//creat the map
function createMap(){
    map = L.map('map', {
        center: [44.7, -90], //might need to edit this based on web layout
        zoom: 6.5
    });
    //add base map
    //**CHANGE base map OR do I not need a basemap?
    // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    // }).addTo(map);
    getData(map); //getData function called here
};

//create a Leaflet GeoJSON layer and add it to the map
function createChoropleth(data, attributes){
    geojsonHO = L.geoJSON(data, {
        style: function(feature){
            return styleOutcome(feature, attributes); //styleOutcome called here
        },
        onEachFeature: onEachFeatureHO //on each feature makes highlight happen
    }).addTo(map);
};

//color scale for health outcomes. Color and classes from annual report
function getOutcomeColor(value) {
    switch (true) {
      case value > 54:
        return '#3C6754';
      case value > 36:
        return '#72AC93';
      case value > 18:
        return '#B2D2C4';
      default:
        return '#F2F7F5';
    }
};

//adds highlight
function highlightFeatureHO(e) {
    var layerHO = e.target;

    layerHO.setStyle({ //highlight style
        weight: 3,
        color: '#F29727',
        dashArray: '',
        fillOpacity: 0.7
    });
  
    // puts the highlight on top
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layerHO.bringToFront();
  
    infoHO.update(layerHO.feature.properties);
    }
  };

//removes highlight 
function resetHighlightHO(e) {
    var layerHO = e.target; 
    geojsonHO.resetStyle(e.target); 
    infoHO.update();
  };

//mouseover highlights feature, mouseout resests from highight
function onEachFeatureHO(feature, layerHO) {
    layerHO.on({
        mouseover: highlightFeatureHO,
        mouseout: resetHighlightHO,
    });
  };

//style for health outcomes
function styleOutcome(feature, attributes) {
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[currentAttribute]); 
    return {
      fillColor: getOutcomeColor(attValue),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '5',
      fillOpacity: 1
    };
}

//add year panel
var infoHO = L.control();

function infoPanel(buttonId){
  infoHO.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'infoHO'); // create a div with a class "info"
      
      this.update(buttonId);
      return this._div;
  };
  
  //update the control based on feature properties passed
  infoHO.update = function (buttonId, props) { 
    var title;
    if (buttonId == 'health_outcomes0') {
        title = 'Health Outcomes';
    } else if (buttonId == 'health_outcomes1') {
        title = 'Length of Life';
    } else if (buttonId == 'health_outcomes2') {
        title = 'Quality of Life';
    }
    this._div.innerHTML = '<h4>' + title + '</h4>' + (props ? //could I add year in here as well?
          '<b>' + props.COUNTY_NAM + ' County'+ '</b><br />' + Number(props[currentAttribute]) 
          : 'Hover over a county');
  };
  infoHO.addTo(map); 
};

// //come back to fill this, remove control - just static of ranking
// function createLegend (map) {
//   var LegendControl = L.control.extend({
//     options: {
//       position: "bottomright",
//     },
//     onAdd: function (map) {

//     }
//   });
// }

//update choropleth from slider and buttons
function updateChoropleth(attribute){
    currentAttribute = attribute;
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
           var value = layer.feature.properties[attribute];
            layer.setStyle({
                fillColor: getOutcomeColor(value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '5',
                fillOpacity: 0.8
            });
           var year = attribute.split("_")[1];
        };
    });
    infoHO.update(currentAttribute);
};


function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first feature in the dataset //* CAN I change to make new array for next set of features, like if i did 1 table
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with RANK values
       if (attribute.indexOf("RANK") > -1){
            attributes.push(attribute); //placing all attributes into the array for other functions to move through
        };
    };
    return attributes;
};

function createSequenceControls(attributes){
    //create range input element (slider)
    if (!document.querySelector(".range-slider")) {
        var slider = "<input class='range-slider' type='range'></input>";
        document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);
        //set slider attributes
        document.querySelector(".range-slider").max = 8;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;
      }
      
      //add step buttons if they don't already exist
      if (!document.querySelector("#reverse")) {
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">2022</button>');
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">2014</button>');
        //replace button content with images
        document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>") //CHANGE this 2022
        document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>") //CHANGE this 2014
      }
    var steps = document.querySelectorAll('.step');
    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            
            if (step.id == 'forward'){
                index++;
                
                index = index > 9 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                
                index = index < 0 ? 9 : index;
            };
            document.querySelector('.range-slider').value = index;
            updateChoropleth(attributes[index]);
        })
    })
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        updateChoropleth(attributes[index]);
    });
};

function getData(map) {
  // define a function that loads the data
  function loadData(dataUrl) {
    fetch(dataUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        //call functions for map
        attributes = processData(json);
        currentAttribute = attributes[0];
        createChoropleth(json, attributes);
        createSequenceControls(attributes);
        infoPanel();
      });
  }
  // load default data
  loadData("data/health_outcomes.geojson");
  // attach click event handlers to the buttons
  $("#health_outcomes0").on("click", function () {
    loadData("data/health_outcomes.geojson");
    infoPanel(this.id);
  });

  $("#health_outcomes1").on("click", function () {
    loadData("data/length_life.geojson");
    infoPanel(this.id);
  });
  $("#health_outcomes2").on("click", function () {
    loadData("data/quality_life.geojson");
    infoPanel(this.id);
  });

  // update infoPanel on button click
  $(".btn-group > button").on("click", function() {
    var buttonId = $(this).attr("id");
    var geojsonLayer = getGeoJSONLayer();
    geojsonLayer.eachLayer(function(layer) {
      var props = layer.feature.properties;
      infoHO.update(buttonId, props);
    });
  });
};

document.addEventListener('DOMContentLoaded',createMap)

