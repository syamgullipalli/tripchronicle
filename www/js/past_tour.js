function onDeviceReady() {
	navigator.splashscreen.show();
	$.getScript('https://cdn.firebase.com/v0/firebase.js', function() {
		var fb_id_ref = new Firebase('https://trip-chronicle.firebaseio.com/'
				+ window.localStorage.getItem("fb_id"));
		console.log("**DEBUG**: Connected to firebase");

		// Go through all anonymous trip ids
		fb_id_ref.on('child_added',
				function(childSnapShot) {
					console.log("**DEBUG**: Looking for child snapshots");
					if (childSnapShot.child('status').val() == 'DONE') {
						navigator.splashscreen.hide();
						$('<a>').attr(
								'href',
								'past_tour_map.html?trip_id='
										+ childSnapShot.name()).attr(
								'data-role', 'button').attr('data-icon',
								'flag-checkered').text(
								childSnapShot.child('trip_name').val())
								.appendTo('.past.tour-list')
								.button();
					}
				});
	});
}

document.addEventListener("deviceready", onDeviceReady, false);