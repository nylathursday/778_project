//Should I put this all in one geojson, if yes, then how and how will that change my code?
//Can I use 1 slider to change data in both maps?
// wait to edit info panel until decision on 1 or many and buttons work. OR drop down
//some of my data is in wrong order (eye roll)
//rethinking design. oh dear. Maybe  Idon't need to?

//declare map variable globally so all functions have access

//parse out the indicators

//rename indicators indicator_HF, similar to year, split at _
//console logs of whats currently happening with the year parsing, then try and build the indicator parsing, checking with console log
//choose 2 indicators
//goal get update panel working, then think through 2 indicator examples.

var map;
function createMap(){
    //create the map
    map = L.map('map', {
        center: [44.7, -90],
        zoom: 6.5
    });
    //add OSM base tilelayer
    //**CHANGE based map
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    //call getData function
    getData(map);

    
};
function createChoropleth(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    geojsonHO = L.geoJSON(data, {
        style: function(feature){
            return styleOutcome(feature, attributes);
            //**add highlight here?
        },
        onEachFeature: onEachFeatureHO
    }).addTo(map);
};
//color scale for health outcomes
function getOutcomeColor(value) { //using "value" but where does value get assigned?
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
    var layerHO = e.target;  //e.target = event object p. 106

    layerHO.setStyle({ //style of the highlight color
        weight: 3,
        color: '#F29727',
        dashArray: '',
        fillOpacity: 0.7
    });
  
    // puts the highlight on top
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layerHO.bringToFront();
  
    infoHO.update(layerHO.feature.properties); //commented this out until the info panel is added
    }
  };

//removes highlight 
function resetHighlightHO(e) {
    var layerHO = e.target; 
    geojsonHO.resetStyle(e.target); 
    infoHO.update(); //commented this out until the info panel is added
  };

//this makes the above functions happen
//mouseover highlights feature, mouseout resests from highight, click zooms to feature
function onEachFeatureHO(feature, layerHO) {
    layerHO.on({
        mouseover: highlightFeatureHO,
        mouseout: resetHighlightHO,
    });
  };



//style for health outcomes
function styleOutcome(feature, attributes) {
    var attribute = attributes[0];
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]); //bring this thinking into my infopanel function

    return {
      fillColor: getOutcomeColor(attValue), //attValue dynamic variable 
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '5',
      fillOpacity: 0.8
    };
}
function updateChoropleth(attribute){
    map.eachLayer(function(layer){
      
        if (layer.feature && layer.feature.properties[attribute]){ // what does this mean?
          
           var value = layer.feature.properties[attribute];
            layer.setStyle({
                fillColor: getOutcomeColor(value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '5',
                fillOpacity: 0.8
            });
          
           var year = attribute.split("_")[1]; //is this spliting and then saying, take [1]? which is year? and rank is [0]?
        //    console.log("year",year);
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

//info panel my way - should I pivot to try and make legend with rotating info?

var infoHO = L.control(); //moved outside to declare or else it did not work

//to make this dynaamic, look at pop up function 575 workbook
function infoPanel(props){

    infoHO.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'infoHO'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    
    // method that we will use to update the control based on feature properties passed
    infoHO.update = function (props) {
    
      this._div.innerHTML = '<h4>Health Outcome Rank</h4>' +  (props ?
            '<b>' + props.COUNTY_NAM + ' County'+ '</b><br />' + props.RANK_2022 //how to change and make RANK_2022 dynamic? need update info function
            : 'Hover over a county');

    };

    infoHO.addTo(map); //adding info box

};




function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    //set slider attributes
    document.querySelector(".range-slider").max = 8;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    //add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>") //CHANGE this 2022
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>") //CHANGE this 2014
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

function getData(map){
    //load the data
   fetch("data/health_outcomes.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            createChoropleth(json, attributes);
            createSequenceControls(attributes);
            infoPanel(map);
        })
};
document.addEventListener('DOMContentLoaded',createMap)