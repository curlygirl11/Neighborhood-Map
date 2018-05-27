// Creates global variables
var map;
var marker;
var markers = [];

function initMap() {
	// Top Tourist Locations in SF
	var locations = [{
		title: 'Golden Gate Bridge',
		location: {
			lat: 37.821879,
			lng: -122.478452
		}
	}, {
		title: 'Golden Gate Park',
		location: {
			lat: 37.771851,
			lng: -122.454748
		}
	}, {
		title: 'Fishermans Wharf',
		location: {
			lat: 37.810139,
			lng: -122.417762
		}
	}, {
		title: 'San Francisco Zoo',
		location: {
			lat: 37.733645,
			lng: -122.504989
		}
	}, {
		title: 'AT&T Park',
		location: {
			lat: 37.779256,
			lng: -122.390097
		}
	}];
	// Create a styles array to use with the map.
	var styles = [{
		featureType: 'water',
		stylers: [{
			color: '#19a0d8'
		}]
	}, {
		featureType: 'administrative',
		elementType: 'labels.text.stroke',
		stylers: [{
			color: '#ffffff'
		}, {
			weight: 6
		}]
	}, {
		featureType: 'administrative',
		elementType: 'labels.text.fill',
		stylers: [{
			color: '#e85113'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [{
			color: '#990099'
		}, {
			lightness: -40
		}]
	}, {
		featureType: 'transit.station',
		stylers: [{
			weight: 9
		}, {
			hue: '#e85113'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'labels.icon',
		stylers: [{
			visibility: 'off'
		}]
	}, {
		featureType: 'water',
		elementType: 'labels.text.stroke',
		stylers: [{
			lightness: 100
		}]
	}, {
		featureType: 'water',
		elementType: 'labels.text.fill',
		stylers: [{
			color: 'b3d9ff'
			//  },
			//    {
			//       lightness: -100
		}]
	}, {
		featureType: 'poi',
		elementType: 'geometry',
		stylers: [{
			visibility: 'on'
		}, {
			color: '#f0e4d3'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'geometry.fill',
		stylers: [{
			color: '#efe9e4'
		}, {
			lightness: -25
		}]
	}];
	// Constructor creates a new map
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 37.79544,
			lng: -122.4477
		},
		zoom: 11,
		styles: styles,
		mapTypeControl: false
	});
	// The following group uses the 'data' array to create an array of markers on initialize.
	var largeInfoWindow = new google.maps.InfoWindow();
	// Creates a "default location" marker color for when user closes infowindow
	var defaultIcon = makeMarkerIcon('40ff00');
	// Creates a "highlighted location" marker color for when the user clicks on the marker.
	var highlightedIcon = makeMarkerIcon('FFFF24');
	for (var i = 0; i < locations.length; i++) {
		// Get the position and title from the data array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
			id: i
		});
		// Attach the marker to the place object
		vm.places()[i].marker = marker;
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfoWindow);
		});
		// Two event listeners - one for mouseover, one for mouseout, to change the colors back and forth.
		marker.addListener('click', function() {
			var self = this;
			self.setIcon(highlightedIcon);
			self.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				self.setAnimation(null);
				self.setIcon(defaultIcon);
			}, 4100);
		});
	}
	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	function populateInfoWindow(marker, infowindow) {
		// Creates a "default location" marker color for when user closes infowindow
		var defaultIcon = makeMarkerIcon('40ff00');
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			// Clear the infowindow content to give the streetview time to load.
			infowindow.setContent('');
			infowindow.marker = marker;
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				//infowindow.setMarker = null;
				marker.setAnimation(null);
				marker.setIcon(defaultIcon);
			});
		}
		var innerHTML = '<div>'; //information in infowindow from foursquare
		innerHTML += '<h3>' + marker.title + '</h3>';
		fsRating(marker.title, function(data) {
			infowindow.setContent(innerHTML += '<br><br>' + '<strong> ' + data.usersCount + '</strong> ' + 'foursquare user(s) checked into ' + marker.title + '<strong> ' + data.checkinsCount + ' </strong> times.' + '<div id="pano"></div>');
			//      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		});
		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
	// This function takes in a COLOR, and then creates a new marker
	// icon of that color. The icon will be 21 px wide by 34 high, have an origin
	// of 0, 0 and be anchored at 10, 34).
	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34), new google.maps.Size(21, 34));
		return markerImage;
	}
	// Foursquare helper function
	function callFoursquare(data, callback) {
		// Specify foursquare url components
		var VERSION = "20170921";
		var CLIENT_SECRET = "RYUXNWEETQARHBSRBPJIZZLI04OKBY3LVWZBBN34XNSYHCQ5";
		var CLIENT_ID = "WEOSJYPSSW5XC33V11EJOMI3ULSOBJFQOMRYGTUMEFK3BH4P";
		var LL = "39.513295,-119.81618";
		var query = data.toLowerCase().replace("", "");
		var fsURL = "https://api.foursquare.com/v2/venues/search?v=" + VERSION + "&ll=" + LL + "&query=" + query + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET;
		// Request JSON from foursquare api, process response
		$.getJSON(fsURL).done(function(data) {
			var places = data.response.venues[0];
			callback(places);
		}).fail(function() {
			alert("We are Sorry. The Foursquare API returned an error. Please refresh the page and try again");
		});
		//Debugging code used to ensure the callFoursquare function is returning
		//the correct data unique to the location selected in map
		console.group('Debug location details');
		console.log(data + ' vs ' + title);
		console.groupEnd();
	}
	// Function for returning the check-ins of a place on foursquare
	function fsRating(data, callback) {
		callFoursquare(data, function(data) {
			var foursquare = {};
			foursquare.checkinsCount = data.stats.checkinsCount;
			foursquare.usersCount = data.stats.usersCount;
			callback(foursquare);
		});
	}
}
// Handles error if map doesn't load
mapError = function() {
	alert("We are Sorry. The Google Maps API failed to load correctly. Please try again later.");
};
// My ViewModel.
ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([{
		title: 'Golden Gate Bridge',
	}, {
		title: 'Golden Gate Park',
	}, {
		title: 'Fishermans Wharf',
	}, {
		title: 'San Francisco Zoo',
	}, {
		title: 'AT&T Park',
	}]);
	// Filters 'Top Places'.
	self.filter = ko.observable('');
	self.filteredPlaces = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (!filter) {
			self.places().forEach(function(place) {
				if (place.marker) {
					place.marker.setVisible(true);
				}
			});
			return self.places();
		} else {
			return ko.utils.arrayFilter(self.places(), function(place) {
				if (place.title.toLowerCase().indexOf(filter) > -1) {
					place.marker.setVisible(true);
					return true;
				} else {
					place.marker.setVisible(false);
					return false;
				}
			});
		}
	}, self);
	self.showInfo = function(location) {
		google.maps.event.trigger(location.marker, 'click');
	};
};
var vm = new ViewModel();
ko.applyBindings(vm);
