var trip_name; // variable to store the trip name

/*******************************************************************************
 * Load javascript dynamically and * execute callback function only after * the
 * javascript source has been loaded *
 ******************************************************************************/
// function loadJS(src, callback) {
// var s = document.createElement('script');
// s.src = src;
// s.async = true;
// s.onreadystatechange = s.onload = function() {
// var state = s.readyState;
// if (!callback.done && (!state || /loaded|complete/.test(state))) {
// callback.done = true;
// callback();
// }
// };
// document.getElementsByTagName('head')[0].appendChild(s);
// }
function onDeviceReady() {
	 navigator.splashscreen.show();
	// alert('device ready');
	// Let the firebase javascript source load before creating new Firebase
	// object
	$.getScript('https://cdn.firebase.com/v0/firebase.js', function() {
		var fb_id_ref = new Firebase('https://trip-chronicle.firebaseio.com/'
				+ window.localStorage.getItem("fb_id"));
		console.log("**DEBUG**: Connected to firebase");

		// Go through all anonymous trip ids
		fb_id_ref.on('child_added', function(childSnapShot) {
			console.log("**DEBUG**: fireBaseRef.on()");
			// retrieve each trip name under trip id from firebase
			if (childSnapShot.child('status').val() == 'current') {
				 navigator.splashscreen.hide();
				// Display all trip names as buttons to select a trip and add
				// anonymous id as query string to target url
				$('<a>')
						.attr('href', 'current_tour_map.html?trip_id='+ childSnapShot.name())
						.attr('data-role', 'button')
						.attr('data-icon', 'road')
						.text(childSnapShot.child('trip_name').val())
						.appendTo('.current.tour-list')
						.button();
			}
		});
	});
}

document.addEventListener("deviceready", onDeviceReady, false);