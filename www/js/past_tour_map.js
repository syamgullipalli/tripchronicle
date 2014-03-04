

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


//Way points
var way_pts = [], travelled_pos, pos_latlng;

//Markers on direction
var dir_mrk_opt, dir_mrk_array = [];

//Image data
var img_data, img_src;

//Marker info window
//var mrk_info_obj, mrk_info_txt_capture, mrk_info_txt_upload;


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
						});
						index++;
					});
				}
				
				/************************************************************
				 * 	On click marker popup image capture and upload buttons	*
				 ************************************************************/
				function popUp(mrk_pos, firebase_snapshot) {
					console.log('**DEBUG**: Clicked on marker');
					map_obj.setZoom(16);
					map_obj.panTo(mrk_pos);
					$('#popup').popup('open');
					console.log('**DEBUG**: Firebase reference: '+firebase_snapshot.name());
					//On click capture
					$(".btn.imgdata").one('click', function() {
						console.log('**DEBUG**: Clicked on images button');
//						getImageData(firebase_snapshot);
						if(firebase_snapshot.name()=='strt_loc'||firebase_snapshot.name()=='dest_loc')
							window.location.href = "../html/review.html?fb_ref="+trip_id+"/"+firebase_snapshot.name();
						else
							window.location.href = "../html/review.html?fb_ref="+trip_id+"/locations/"+firebase_snapshot.name();
//						$('#popup').popup('close');
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
			});
		});
}