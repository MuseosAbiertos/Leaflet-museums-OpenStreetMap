/*
****************************************
Mapa Leaflet
****************************************
*/
// Se crea el mapa
var mymap = L.map('mapid', {
  center: [-34.6161,-58.4333],
  zoom:12
});

// llamada a la API de Openstreetmap
// https://wiki.openstreetmap.org/wiki/Tile_servers
var apiOpenstreetmap = {
  //    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //    url:'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  	url:'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    options: {attribution:'<a href="https://museosabiertos.org">Museos Abiertos</a> bajo <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> & <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
  }
var renderMap = L.tileLayer(apiOpenstreetmap.url,apiOpenstreetmap.options);
renderMap.addTo(mymap);

// Añade la información al popUp
function dataPopup(feature,layer){
  var outData = [];
  if (feature.properties){
    for(key in feature.properties){
      switch (key) {
        case 'wikimedia_commons':
        var re = feature.properties[key].replace(/file:/gi, 'Special:FilePath/');
        var wikimedia = `
          <a class="tagDescription" href="https://commons.wikimedia.org/wiki/${re}" target="_blank">
          <img class="tagImage" src="https://commons.wikimedia.org/wiki/${re}" alt="${re}"/>
          </a>
        `
        break;
        case 'name':
        var name = `<h1 class="tagTitle">${feature.properties[key]}</h1>`;
        break;
        case 'official_name':
        var officialname = `<p class="tagDescription"><span class="tagKey>Nombre oficial: </span>${feature.properties[key]}</p>`;
        break;
        case 'description':
        var description = `<p class="tagDescription">${feature.properties[key]}</p>`;
        break;
        case 'museum':
        var museum = `<p class="tagDescription museo1"><span class="tagKey">Museo: </span>${feature.properties[key]}</p> `;
        break;
        case 'museum_type':
        var museumType = `<p class="tagDescription museo2"><span class="tagKey">Tipo de museo: </span>${feature.properties[key]}</p>`;
        break;
        case 'addr:street':
        var street = `<div class="tagStreet"><span class="tagKey"></span>${feature.properties[key]}</div>`;
        break;
        case 'addr:housenumber':
        var house = `<div class="tagStreet"><span>&nbsp;<!--Nº--></span>${feature.properties[key]}</div>`;
        break;
        case 'addr:postcode':
        var postCode = `<div class="tagStreet cp">${feature.properties[key]}</div>`;
        break;
        case 'addr:city':
        var city = `<div class="tagStreet">${feature.properties[key]}</div>`;
        break;
        case 'website':
        var website = `<p class="tagDescription web"><a href="${feature.properties[key]}" rel="noopener noreferrer" target="_blank">${feature.properties[key]}</a></p>`;
        break;
        case 'email':
        var email = `<p class="tagDescription mail"><a href="mailto:${feature.properties[key]}" rel="noopener noreferrer" target="_blank">${feature.properties[key]}</a></p>`;
        break;
        case 'opening_hours':
        var hours = `<p class="tagDescription"><span class="tagKey">Horarios de apertura: </span><br/>${feature.properties[key]}</p>`;
        break;
        case 'wikidata':
        var wikidata = `<p class="tagDescription wd"><a href="https://www.wikidata.org/wiki/${feature.properties[key]}" rel="noopener noreferrer" target="_blank"><span class="tagKey">&rarr; ver museo en Wikidata</span></a></p>`;
        break;
        case 'wikipedia':
        var wikipedia = `<p class="tagDescription wp"><a href="https://www.wikipedia.org/wiki/${feature.properties[key]}" rel="noopener noreferrer" target="_blank"><span class="tagKey">&rarr; ver museo en Wikipedia</span></a></p>`;
        break;
        case 'heritage':
        var heritage = `<p class="tagDescription"><span class="tagKey">Patrimonio: </span>${feature.properties[key]}</p>`;
        break;
        case 'historic':
        var historic = `<p class="tagDescription"><span class="tagKey">Histórico: </span>${feature.properties[key]}</p>`;
        break;
        case '@id':
        var urlOsmArr = feature.properties[key].split('/')
        var urlOsm = `<a class="urlOsm" href="https://openstreetmap.org/${urlOsmArr[0]}/${urlOsmArr[1]}" rel="noopener noreferrer" target="_blank">Editar museo con OpenStreetMap</a><br/><br/><p class="tagDescription ver">v0.0.7</p><p class="tagDescription up">última actualización: 2019-07-10</p>`
        break;
    }
  }
  // Inserta los tags en el orden deseado
  outData.push(name, wikimedia, officialname, description, museum, museumType, street, house, postCode, city, website, email, hours, wikidata, wikipedia, heritage, historic, urlOsm)
  layer.bindPopup(outData.join(''));
  }
}

// Se define la variable markers para utilizarlo con el plugin MarkerCluster
var markers = new L.MarkerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 20
});

// Llamada ajax para mostrar los datos del geojson en el mapa
var myLoader = document.getElementById('myLoaderContainer');
var xhr = new XMLHttpRequest();

xhr.open('GET', 'data/export.geojson');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.responseType = 'json';
xhr.onload = function() {
    if (xhr.status == 200){
      var geojsonAjax = L.geoJSON(xhr.response, {onEachFeature:dataPopup});
      // Añade markerCluster.
      markers.addLayer(geojsonAjax);
      mymap.addLayer(markers);
      // Quita el loader, y muestra los markes si se han cargado.
      myLoader.style.display = "none";
    }else {
      alert("Error al cargar el mapa. Por favor inténtelo más tarde.")
      myLoader.style.display = "none";
    }
};
xhr.send();
/*
****************************************
PopUp personalizado
****************************************
*/
// captura los datos del marcador que ha recibido el click
var clickMapa = document.getElementById('mapid');
var containerMyPopup = document.getElementById('containerMyPopup')
var closeContainer = document.getElementById('closeContainer')
var contentPopup;

function popupDefault(e) {
  // Selecciona el container del popup
  var popupLeafletMap = document.querySelectorAll('.leaflet-popup-pane');
  var clickMyPopup = e.target.className;
  // Si se hace click en myPopup se sale de la function popupDefault
  if (clickMyPopup == "tagTitle" || clickMyPopup == "tagDescription" || clickMyPopup == "tagContainer" || clickMyPopup == "containerMyPopup myPopupVisibility") {
    // El popup no se cierra
    return
  } else {
    // El popup se cierra y elimina el svg de cierre
    closeContainer.style.right = '-100%'
  }

  // Si el popup tiene información
  if (popupLeafletMap[0].innerHTML != "") {
    // Selecciona el contenido del popup
    contentPopup = document.querySelectorAll('.leaflet-popup-content');
    // Agrega la información del popup a myPopup
    containerMyPopup.innerHTML = `<div class="myPopup">${contentPopup[0].innerHTML}</div>`;
    containerMyPopup.classList.add('myPopupVisibility');
    // Agrega el cierre del popup personalizado
    closeContainer.style.right = '0';
    // Resetea la información que hay en el popup
    popupLeafletMap[0].innerHTML = "";
  }else {
    containerMyPopup.classList.remove('myPopupVisibility');
    // Resetea la información que hay en el popup
    popupLeafletMap[0].innerHTML = "";
    // Resetea la información que hay en el popup personalizado
    containerMyPopup.innerHTML = "";
  }
};
clickMapa.addEventListener('click', popupDefault);
closeContainer.addEventListener('click', popupDefault);
