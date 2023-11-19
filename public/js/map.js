// JavaScript function to place a marker
function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

//Call this function to place a marker
var myLocation = {lat: -34.397, lng: 150.644};
placeMarker(myLocation);

// JavaScript function to get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            placeMarker(userLocation);  // Place a marker on user's location
            map.setCenter(userLocation);  // Center the map on user's location
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}


