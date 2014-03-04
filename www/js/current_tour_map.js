

//flag to control multiple jquery calls
var flag = true, has_child = false;

// Start and destination locations
var strt_loc = {
	"lat" : null,
	"lng" : null
}, dest_loc = {
	"lat" : null,
	"lng" : null
};

// Map options
var map_opt;

// Map center position position
var map_pos_center;

// Display map object
var map_obj;

// Marker start and destination positions
var pos_strt_mrk, pos_dest_mrk;

// Marker start and destination options
var mrk_strt_opt, mrk_dest_opt;

// Start and destination marker objects
var mrk_strt_obj, mrk_strt_obj;

// Display directions object (DirectionRenderer)
var dir_render, dir_render_opt;

// Directions service object
var dir_service;


//Current position coords
var curr_pos = {"lat":null, "lng":null};

//Way points
var way_pts = [], travelled_pos, pos_latlng;

//Markers on direction
var dir_mrk_opt, dir_mrk_array = [];

//Marker info window
//var mrk_info_obj, mrk_info_txt_capture, mrk_info_txt_upload;

//Camera objects
var destination_type;
var picture_source;

/**
 * Called when google maps initialized
 */
function initialize() {
	console.log("**DEBUG**: Function initialized");
	var trip_id = location.search.substring(9);
	console.log("**DEBUG**: TRIP_ID" + trip_id);
	// alert(trip_id);

	// Let the firebas retrieve Firebase coordinates
	$.getScript('https://cdn.firebase.com/v0/firebase.js',
		function() {
			var fb_trip_id = new Firebase('https://trip-chronicle.firebaseio.com/'
											+ window.localStorage.getItem("fb_id")+ '/' + trip_id);
			console.log("**DEBUG**: Connected to firebase");

			// alert(fb_trip_id.name());
			var map_div = document.getElementById("map_canvas");
				
			// map Dimensions
			map_div.style.width = window.innerWidth - 30 + "px";
			map_div.style.height = window.innerHeight - 80 + "px";

			// Assigning lat and lng to the variables
			fb_trip_id.on('value',function(childSnapShot) {
				strt_loc = childSnapShot.child("strt_loc").val();
				dest_loc = childSnapShot.child("dest_loc").val();

				console.log("**DEBUG**: Start latitude : "
							+ strt_loc.lat
							+ "\n Start Longitude : "
							+ strt_loc.lng);
				console.log("**DEBUG**: Destination latitude : "
							+ dest_loc.lat
							+ "\n Destination Longitude : "
							+ dest_loc.lng);

				// Just to check the integer values of latitude and longitude
//				var sum = strt_loc.lat +strt_loc.lng;
//				alert(sum);

				// Including Latitude and longitude
				pos_strt_mrk = (map_pos_center = new google.maps.LatLng(strt_loc.lat, strt_loc.lng));

				map_opt = {
					center		: map_pos_center,
					zoom		: 16,
					mapTypeId	: google.maps.MapTypeId.ROADMAP
				};

				map_obj = new google.maps.Map(map_div, map_opt);
				// google.maps.event.trigger(map, 'resize');

				mrk_strt_opt = {
					position	: pos_strt_mrk,
					visible		: true,
					icon 		: 'http://www.google.com/mapfiles/ms/micons/green-dot.png',
					draggable 	: false,
					clickable	: true,
					map			: map_obj
				};

				mrk_strt_obj = new google.maps.Marker(mrk_strt_opt);

				pos_dest_mrk = new google.maps.LatLng(dest_loc.lat, dest_loc.lng);
				mrk_dest_opt = {
					position	: pos_dest_mrk,
					visible 	: true,
					icon 		: 'http://www.google.com/mapfiles/ms/micons/red-dot.png',
					draggable 	: false,
					clickable 	: true,
					map 		: map_obj
				};

				mrk_dest_obj = new google.maps.Marker(mrk_dest_opt);
				
//				// Marker info window object
//				mrk_info_obj = new google.maps.InfoWindow();
				

				/****************************************
				 * 				Directions				*
				 ****************************************/
				//DirectionService object
				dir_service = new google.maps.DirectionsService();
				
				//DirectionRender options
				dir_render_opt = {
						preserveViewport: true,
						draggable		: false,
						suppressMarkers	: true
				};
				
				//Direction render object
				dir_render = new google.maps.DirectionsRenderer(dir_render_opt);
				//Render directions on map object
				dir_render.setMap(map_obj);
				
				//Clear all direction markers
				for(var i=0; i<dir_mrk_array.length; i++){
					if(dir_mrk_array[0] != null)
						dir_mrk_array[i].setMap(null);
				}
				dir_mrk_array.length = 0;
				
				// Way points between start and destination locations
				way_pts.length = 0;		// empty the way_list array to push each value again
				var index = 0;
				if(childSnapShot.hasChild('locations')){
					fb_trip_id.child('locations').on('child_added', function(posSnapshot){
						has_child = true;
						travelled_pos = posSnapshot.child('pos').val();
						pos_latlng = new google.maps.LatLng(travelled_pos.lat, travelled_pos.lng);
						way_pts.push({location:pos_latlng, 
									stopover:true});
						dir_mrk_array[index] = new google.maps.Marker({position	: pos_latlng,
																icon		: 'http://maps.google.com/mapfiles/kml/pal4/icon29.png',
																map			: map_obj,
																clickable	: true
																});
						// Marker click event
						google.maps.event.addListener(dir_mrk_array[index], 'click', function(){
							popUp(pos_latlng, fb_trip_id.child('locations/'+posSnapshot.name()));
//							map_obj.setZoom(16);
//							map_obj.panTo(pos_latlng);
//							$("#popup").popup("open");
//							$(".btn.capture").click(function() {
//								fb_trip_id.child('locations/'+posSnapshot.name()).child('images').push().set({'img':'base64'});
//							});
//							mrk_info_txt_capture = $('<a>').attr('data-role', 'button').text('Capture').button();
//							mrk_info_txt_upload = $('<a>').attr('data-role', 'button').text('Upload').button();
//							mrk_info_obj.setPosition(pos_latlng);
//							mrk_info_obj.setContent(mrk_info_txt_capture[0]);
//							mrk_info_obj.open(map_obj, dir_mrk_array[index]);
						});
						index++;
					});
				}
				
				/************************************************************
				 * 	On click marker popup image capture and upload buttons	*
				 ************************************************************/
				destination_type = navigator.camera.DestinationType;
				picture_source = navigator.camera.PictureSourceType;
				function popUp(mrk_pos, firebase_snapshot) {
					console.log('**DEBUG**: Clicked on marker');
					map_obj.setZoom(16);
					map_obj.panTo(mrk_pos);
					$('#popup').popup('open');
					console.log('**DEBUG**: Firebase reference: '+firebase_snapshot.name());
					//On click capture
					$(".btn.capture").one('click', function() {
						console.log('**DEBUG**: Clicked on capture');
						capturePhotoEdit(firebase_snapshot);
						$('#popup').popup('close');
					});
					
					//On click upload
					$(".btn.upload").one('click', function() {
						console.log('**DEBUG**: Clicked on upload');
						uploadPhoto(picture_source.PHOTOLIBRARY, firebase_snapshot);
						$('#popup').popup('close');
					});
				}
				
				/********************************************
				 * 	Capture photo and upload to firebase	*
				 ********************************************/				
				function capturePhotoEdit(firebase_snapshot) {
					navigator.camera.getPicture(function(image_data) {
						console.log('**DEBUG**: Captured image');
						console.log('**DEBUG**: Image base64 string: '+image_data);
						firebase_snapshot.child('images').push().set(image_data, function() {
							alert('Successfully uploaded your image');
						});
					}, function(message) {
						alert('Failure: '+message);
					}, {
						quality			: 50,
						allowEdit		: true,
						destinationType	: destination_type.DATA_URL
					});
				}
				
				/****************************************************************
				 * 	Upload image from local file system and upload to firebase	*
				 ****************************************************************/
				function uploadPhoto(source, firebase_snapshot) {
					navigator.camera.getPicture(function(image_data) {
						console.log('**DEBUG**: Uploaded image');
						console.log('**DEBUG**: Image base64 string: '+image_data);
						firebase_snapshot.child('images').push().set(image_data, function() {
							alert('Successfully uploaded your image');
						});
					}, function(message) {
						alert('Failure: '+message);
					}, {
						quality			: 50,
						destinationType	: destination_type.DATA_URL,
						sourceType		: source
					});
				}
				
				/************************
				 *	Direction display	*
				 ************************/
				var request = {
					origin				: pos_strt_mrk,
					destination 		: pos_dest_mrk,
					waypoints			: way_pts,
					optimizeWaypoints	: true,
					travelMode 			: google.maps.TravelMode.DRIVING
				};
				
				//Display route
				dir_service.route(request, function(response, status) {
					console.log("**DEBUG**: Trying to retrieve the route");
					if (status == google.maps.DirectionsStatus.OK) {
						dir_render.setDirections(response);
					} 
					else {
						alert('No directions found');
					}
					if(has_child){
						map_obj.panTo(pos_latlng);
						has_child = false;
					}
				});
				
				
				/****************************************************************
				 *	Markers on click event for start and destination markers	*
				 ****************************************************************/
				google.maps.event.addListener(mrk_strt_obj, 'click', function(){
					popUp(mrk_strt_obj.getPosition(), fb_trip_id.child('strt_loc'))
				});
				
				google.maps.event.addListener(mrk_dest_obj, 'click', function(){
					popUp(mrk_dest_obj.getPosition(), fb_trip_id.child('dest_loc'))
				});
				
				/************************************
				 *	Current position coordinates	*
				 * @returns {"lat":int, "lng":int}	*
				 ************************************/
				function getPosition() {
					navigator.geolocation.getCurrentPosition(function(position) {
						console.log("**DEBUG**: Retrieving your current location.");
						curr_pos.lat = position.coords.latitude;
						curr_pos.lng = position.coords.longitude;
					}, function(error) {
						alert('Unable to retrieve your current location');
					});
					return curr_pos;
				}
				
				/****************************
				 * 	On click update button	*
				 ****************************/
				$('.btn.update').click(function() {
					console.log("Clicked on update button.");
					var pos = getPosition();
					if(pos.lat != null && pos.lng != null){
//						alert(pos.lat+', '+pos.lng);
						//Prevent from multiple jquery calls so that the firebase does not explode with the duplicates
						var onComplete = function(error){
							if(error) alert('Unable to save your location');
							else alert('Successfully saved your location');
							flag = true;
						};
						if(flag==true){
							flag = false;
							fb_trip_id.child('locations').push().child('pos').set(pos, onComplete);
						}
					}
				});
				
				/************************************
				 * 	End tour button on click event	*
				 ************************************/
				$('.btn.end').click(function() {
					console.log('**DEBUG**: Clicked on end tour');
					fb_trip_id.update({'status':'DONE'}, function() {
						$.mobile.changePage("../html/past_tour.html", {changeHash: false});
					});
				});

			});
		});
}