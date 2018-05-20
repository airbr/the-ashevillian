import axios from 'axios';
import {$} from './bling';


// const mapOptions = {
//   center: {lat: 40.758896, lng: -73.985130},
//   zoom: 8
// };

function loadPlaces(map, lat = 40.758896, lng = -73.985130) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
      .then(res => {
        const places = res.data;
        console.log(places);
        if (!places.length) {
          console.log('No places Found');
          return;
        }
        // create a bound
        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        const markers = places.map(place => {
          const [placeLng, placeLat] = place.location.coordinates;
          const position = {lat: placeLat, lng: placeLng};
          bounds.extend(position);
          const marker = new google.maps.Marker({
            map: map,
            position: position
          });
          marker.place = place;
          return marker;
        });

        //When marker is clicked, show details
        markers.forEach(marker => marker.addListener('click', function() {
          const html = `
          
          <div class="popup">
           <a href="/store/${this.place.slug}"></a>
           <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"/>
           <p>${this.place.name} - ${this.place.location.address}</p>
           </div>
          `;

          infoWindow.setContent(html);
          infoWindow.open(map, this)
        }));

        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
      }).catch(console.error);
}

function finishMap(mapDiv, lat, lng) {
  if (!mapDiv) return;
  var mapOptions = {};
  mapOptions.center = {lat, lng};
  mapOptions.zoom = 8;

  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map, lat, lng);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng() )
  })
}

function makeMap(mapDiv) {
  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.getCurrentPosition(function(position) {
      finishMap(mapDiv, position.coords.latitude, position.coords.longitude);
    });
    return;
  } else {
    /* geolocation IS NOT available default to Times Square */
    finishMap(mapDiv, 40.758896, -73.985130);
    return;
  }
}

export default makeMap;