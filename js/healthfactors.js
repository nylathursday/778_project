/*Nyla Thursday GEOG 778 Final Project: UW Madison, May 2023
Data: County Health Rankings & Roadmap 2014-2022*/

//declare global variables
var map2;
var attributes2;
var currentAttribute2;

//creat the map
function createMapHF(){
    map2 = L.map('map2', {
        center: [44.8, -89.85],
        zoom: 6.5
    });
    getDataHF(map2);
};

//create a Leaflet GeoJSON layer and add it to the map
function createChoroplethHF(data, attributes2){
    geojsonHF = L.geoJSON(data, {
        style: function(feature){
            return styleOutcomeHF(feature, attributes2); //styleOutcome called here
        },
        onEachFeature: onEachFeatureHF //on each feature makes highlight happen
    }).addTo(map2);
};

//color scale for health outcomes. Color and classes from annual report
function getOutcomeColorHF(value) {
    switch (true) {
      case value > 54:
        return '#375881';
      case value > 36:
        return '#7095C2';
      case value > 18:
        return '#A9BFDA';
      default:
        return '#E2EAF3';
    }
};

//adds highlight
function highlightFeatureHF(e) {
    var layerHF = e.target;

    layerHF.setStyle({ //highlight style
        weight: 3,
        color: '#F29727',
        dashArray: '',
        fillOpacity: 0.7
    });
  
    // puts the highlight on top
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layerHF.bringToFront();
    }
  };

//removes highlight 
function resetHighlightHF(e) {
    var layerHF = e.target; 
    geojsonHF.resetStyle(e.target); 
  };

//mouseover highlights feature, mouseout resests from highight
function onEachFeatureHF(feature, layerHF) {
  layerHF.bindTooltip('<b>' + feature.properties.COUNTY_NAM + ' County'+ '</b><br /> <p id= "attInfoHF">' + Number(feature.properties[currentAttribute2]) +'</p>', {
    className:"rank_infoHF" //rank_info is what I use to style in css
  });  
  layerHF.on({
        mouseover: highlightFeatureHF,
        mouseout: resetHighlightHF,
    });
  };

//style for health outcomes
function styleOutcomeHF(feature, attributes2) {
    //For each feature, determine its value for the selected attribute
    var attValue2 = Number(feature.properties[currentAttribute2]); 
    return {
      fillColor: getOutcomeColorHF(attValue2),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '5',
      fillOpacity: 1
    };
}

var infoHF = L.control();
function infoPanelHF(){
  infoHF.onAdd = function (map2) {
      this._divHF = L.DomUtil.create('div', 'infoHF'); // create a div with a class "info"
      this._divHF.innerHTML = '<h4 id="info-titleHF">Health Factors</h4><h4 id="info-yrHF">2014</h4>';
      return this._divHF;
  };
  infoHF.addTo(map2); 
};


//update choropleth from slider and buttons
function updateChoroplethHF(attribute2){
    currentAttribute2 = attribute2;
    map2.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute2]){
           var value = layer.feature.properties[attribute2];
            layer.setStyle({
                fillColor: getOutcomeColorHF(value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '5',
                fillOpacity: 1
            });

            var toolTipHF = layer.getTooltip();
            var toolTipContHF = '<b>' + layer.feature.properties.COUNTY_NAM + ' County'+ '</b><br /> <p id= "attInfoHF">' + Number(layer.feature.properties[attribute2]) +'</p>';
            toolTipHF.setContent(toolTipContHF).update();

           var year2 = attribute2.split("_")[1]; //come back here for SLIDER edits
        };
    });
};


function processDataHF(data){
    //empty array to hold attributes
    var attributes2 = [];
    //properties of the first feature in the dataset //* CAN I change to make new array for next set of features, like if i did 1 table
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute2 in properties){
        //only take attributes with RANK values
       if (attribute2.indexOf("RANK") > -1){
            attributes2.push(attribute2); //placing all attributes into the array for other functions to move through
        };
    };
    return attributes2;
};

//can I just call the same sequence controls??
function createSequenceControlsHF(attributesHF){
  //create range input element (slider)
  if (!document.querySelector(".range-sliderHF")) {
    infoPanelHF();
    
    var sliderHF = "<input class='range-sliderHF' type='range'></input>";
      document.querySelector("#panel").insertAdjacentHTML('beforeend',sliderHF);
      //set slider attributes
      document.querySelector(".range-sliderHF").max = attributesHF.length -1;
      document.querySelector(".range-sliderHF").min = 0;
      document.querySelector(".range-sliderHF").value = 0;
      document.querySelector(".range-sliderHF").step = 1;
    }
    
    //add step buttons if they don't already exist
    if (!document.querySelector("#reverseHF")) {
      document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverseHF">2014</button>');
      document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forwardHF">2022</button>');
    }

    $('#reverseHF').off()
    $('#forwardHF').off()
    
  var stepsHF = document.querySelectorAll('.step');
  stepsHF.forEach(function(stepHF){
      $(stepHF).on("click", function(){
          var indexHF = document.querySelector('.range-sliderHF').value;

          
          if (stepHF.id == 'forwardHF'){
              indexHF++;
              indexHF = indexHF > 9 ? 0 : indexHF;

          } else if (stepHF.id == 'reverseHF'){
              indexHF--;
              
              indexHF = indexHF < 0 ? 9 : indexHF;
          };
          document.querySelector('.range-sliderHF').value = indexHF;
          updateChoroplethHF(attributesHF[indexHF]);
          document.querySelector("#info-yrHF").innerHTML = attributesHF[indexHF].split("_")[1];
      })
  })
  document.querySelector('.range-sliderHF').addEventListener('input', function(){
      var indexHF = this.value;
      updateChoroplethHF(attributesHF[indexHF]);
  });
};

function getDataHF(map2) {
    // define a function that loads the data
    function loadDataHF(dataUrlHF) {
      fetch(dataUrlHF)
        .then(function (response) {
          return response.json();
        })
        .then(function (json) {
          //call functions for map
          attributes2 = processDataHF(json);
          currentAttribute2 = attributes2[0];
          createChoroplethHF(json, attributes2);
          createSequenceControlsHF(attributes2);
          // infoPanelHF(); //commented out here, b/c if here panel only updates for a second
          legendHF.addTo(map2);
        });
    }
    // load default data
    loadDataHF("data/health_factors.geojson");
    // attach click event handlers to the buttons
    $("#health_factors0").on("click", function () {
      loadDataHF("data/health_factors.geojson");
      document.querySelector("#info-titleHF").innerHTML= this.value;
    });
    $("#health_factors1").on("click", function () {
      loadDataHF("data/physical_env.geojson");
      document.querySelector("#info-titleHF").innerHTML = this.value;
    });
    $("#health_factors2").on("click", function () {
      loadDataHF("data/social_economic.geojson");
      document.querySelector("#info-titleHF").innerHTML = this.value;
    });
    $("#health_factors3").on("click", function () {
      loadDataHF("data/health_behaviors.geojson");
      document.querySelector("#info-titleHF").innerHTML = this.value;
    });
    $("#health_factors4").on("click", function () {
      loadDataHF("data/clinical_care.geojson");
      document.querySelector("#info-titleHF").innerHTML = this.value;
    });
  };

document.addEventListener('DOMContentLoaded',createMapHF)

// Define the colors for each class
const colorsHF = ['#375881', '#7095C2','#A9BFDA', '#E2EAF3' ];

// Define the labels for each class
const labelsHF = [' 55 - 72', ' 37 - 54', ' 19 - 36', ' 1 - 18'];

// Create a new Leaflet control for the legend
const legendHF = L.control({ position: 'bottomleft' });

// Add a function to generate the HTML content for the legend
legendHF.onAdd = function(map2) {
  const div = L.DomUtil.create('div', 'legendHF');
  div.innerHTML += '<b>County Rank</b><br>';
  for (let i = 0; i < colorsHF.length; i++) {
    div.innerHTML += '<div><svg height="12" width="12"><rect x="0" y="0" width="12" height="12" style="fill:' + colorsHF[i] + ';"/></svg>' + labelsHF[i] + '</div>';
  }
  return div;
};