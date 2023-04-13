/*Nyla Thursday GEOG 778 Final Project: UW Madison, May 2023
Data: County Health Rankings & Roadmap 2014-2022*/

//declare global variables
var map;
var attributes;
var currentAttribute;

//creat the map
function createMap(){
    map = L.map('map', {
        center: [44.8, -89.85],
        zoom: 6.5
    });
    getData(map);
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
    }
  };

//removes highlight 
function resetHighlightHO(e) {
    var layerHO = e.target; 
    geojsonHO.resetStyle(e.target); 
  };

//mouseover highlights feature, mouseout resests from highight
function onEachFeatureHO(feature, layerHO) {
  layerHO.bindTooltip('<b>' + feature.properties.COUNTY_NAM + ' County'+ '</b><br />' + Number(feature.properties[currentAttribute]), {
    className:"rank_info" //rank_info is what I use to style in css
  });  
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

//create title panel
var infoHO = L.control();
function infoPanel(){
  infoHO.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'infoHO'); // create a div with a class "info"
      this._div.innerHTML = '<h4 id="info-title">Health Outcomes</h4><h4 id="info-yr">2014</h4>';
      return this._div;
  };
  infoHO.addTo(map); 
};


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
      infoPanel();
      
      var slider = "<input class='range-slider' type='range'></input>";
        document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
        //set slider attributes
        document.querySelector(".range-slider").max = attributes.length -1;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;
      }
      
      //add step buttons if they don't already exist
      if (!document.querySelector("#reverse")) {
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">2014</button>');
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">2022</button>');
      }

      $('#reverse').off()
      $('#forward').off()
      
    var steps = document.querySelectorAll('.step');
    steps.forEach(function(step){
        $(step).on("click", function(){
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
            document.querySelector("#info-yr").innerHTML = attributes[index].split("_")[1];
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
         // infoPanel();
          legend.addTo(map);
        });
    }
    // load default data
    loadData("data/health_outcomes.geojson");
    // attach click event handlers to the buttons
    $("#health_outcomes0").on("click", function () {
      loadData("data/health_outcomes.geojson");
      document.querySelector("#info-title").innerHTML = this.value;
    });
    $("#health_outcomes1").on("click", function () {
      loadData("data/length_life.geojson");
      document.querySelector("#info-title").innerHTML = this.value;
    });
    $("#health_outcomes2").on("click", function () {
      loadData("data/quality_life.geojson");
      document.querySelector("#info-title").innerHTML = this.value;
    });
  };

document.addEventListener('DOMContentLoaded',createMap)

// Define the colors for each class
const colors = ['#3C6754', '#72AC93','#B2D2C4', '#F2F7F5' ];

// Define the labels for each class
const labels = [' 55 - 72', ' 37 - 54', ' 19 - 36', ' 1 - 18'];

// Create a new Leaflet control for the legend
const legend = L.control({ position: 'bottomleft' });

// Add a function to generate the HTML content for the legend
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b>County Rank</b><br>';
  for (let i = 0; i < colors.length; i++) {
    div.innerHTML += '<div><svg height="12" width="12"><rect x="0" y="0" width="12" height="12" style="fill:' + colors[i] + ';"/></svg>' + labels[i] + '</div>';
  }
  return div;
};