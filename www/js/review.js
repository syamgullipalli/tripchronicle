function onDeviceReady() {
	navigator.splashscreen.show();
	var loc_ref = location.search.substring(8);
	$.getScript('https://cdn.firebase.com/v0/firebase.js', function() {
		var img_ref = new Firebase('https://trip-chronicle.firebaseio.com/'
				+ window.localStorage.getItem("fb_id") + '/' + loc_ref
				+ '/images');

		img_ref.on("child_added", function(dataSnapshot, prevChild) {
			var output = dataSnapshot.val();

			console.log("**DEBUG**:" + output);

			var smallImage = document.getElementById('smallImage');
			smallImage.style.display = 'block';
			navigator.splashscreen.hide();
			smallImage.src = "data:image/jpeg;base64," + output;

		});

	});
}

document.addEventListener("deviceready", onDeviceReady, false);