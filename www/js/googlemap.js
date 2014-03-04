// Map screen resolution
var scr_width,
	scr_height;

// Map div id
var strt_map_div,
	dest_map_div;

// Locations
var strt_loc,
	dest_loc;

// Coords
var strt_coord = {"lat":51.732330, "lng":8.736560},
	dest_coord = {"lat":51.732330, "lng":8.736560};

// Map options
var strt_map_opt,
	dest_map_opt;

// Map objects
var strt_map_obj,
	dest_map_obj;

// Marker options
var strt_mrk_opt,
	dest_mrk_opt;

// Marker Objects
var strt_mrk_obj,
	dest_mrk_obj;

// Initialization
var init = false,
	count = 0;

// Trip name
var trip_name;

function initialize() {
	console.log("**DEBUG**: Google map initialized");
	
	$(".done-btn").hide();			// Hide "Done" buttons
	$(".label").show();
	$(".map").show();	// Show all map class objects
	$(".strt-btn").show();				// Show start now and start later buttons
	
	// Set map size according to screen resolution
	scr_width = window.innerWidth-20+"px";
	scr_height = window.innerHeight/3+"px";
	
	/********************************
	 * 			Start Location		*
	 ********************************/
	
	// Set start location initial position to HNI 
	strt_loc = new google.maps.LatLng(strt_coord.lat, strt_coord.lng);
	
	// Start location map options
	strt_map_opt = {
			zoom		: 14,
			mapTypeId	: google.maps.MapTypeId.ROADMAP,
			center		: strt_loc 
			};
	
	//  Get sart map div id
	strt_map_div = document.getElementById("map_canvas_strt");
	
	// Adjust start map size according to screen resolution
	strt_map_div.style.width = scr_width;
	strt_map_div.style.height = scr_height;
	
	// Start location map object
	strt_map_obj = new google.maps.Map(strt_map_div, strt_map_opt);
	
	// Set marker on start location map
	strt_mrk_opt = {
			position	: strt_loc,
			visible 	: true, 
			icon		: 'http://www.google.com/mapfiles/ms/micons/green-dot.png',
			animation	: google.maps.Animation.DROP,
			map			: strt_map_obj,
			draggable	: true,
			clickable 	: true
			};
	
	// Start location marker object
	strt_mrk_obj = new google.maps.Marker(strt_mrk_opt);
	
	
	/********************************
	 * 		Destination Location	*
	 ********************************/
	
	// Set destination location initial position to HNI
	dest_loc = new google.maps.LatLng(dest_coord.lat, dest_coord.lng);
	
	// Start location map options
	dest_map_opt = {
			zoom		: 14,
			mapTypeId	: google.maps.MapTypeId.ROADMAP,
			center		: dest_loc 
			};
	
	// Get destination map div id
	dest_map_div = document.getElementById("map_canvas_dest");
	
	// Adjust destination map size according to screen resolution
	dest_map_div.style.width = scr_width;
	dest_map_div.style.height = scr_height;
	
	// Destination location map object
	dest_map_obj = new google.maps.Map(dest_map_div, dest_map_opt);
	
	// Set marker on destination location map
	dest_mrk_opt = {
			position	: dest_loc,
			visible 	: true, 
			icon		: 'http://www.google.com/mapfiles/ms/micons/red-dot.png',
			animation	: google.maps.Animation.DROP,
			map			: dest_map_obj,
			draggable	: true,
			clickable 	: true
			};
	
	// Start location marker object
	dest_mrk_obj = new google.maps.Marker(dest_mrk_opt);
	
	/************************************
	 * Get geolocation using PhoneGap	*
	 ************************************/
	if(init == false){	// Run only for the first time
		console.log("**DEBUG**: Retrieving your current location");
		
		//Get current position
		google.maps.event.addListenerOnce(strt_map_obj, 'tilesloaded', function() {
			init = true;	// Stop running geolocation code for second time
			navigator.geolocation.getCurrentPosition(function(position) {
				// Set current position to start location
				strt_coord.lat = position.coords.latitude;
				strt_coord.lng = position.coords.longitude;
				strt_loc = new google.maps.LatLng(strt_coord.lat, strt_coord.lng);
				
				console.log("**DEBUG**: Got your current location");
				
				// Change marker position on start location
				strt_map_obj.panTo(strt_loc);	// Set current position as the center of start location map (smooth transition)
				strt_mrk_obj.setPosition(strt_loc);	// Set marker on current location
				strt_mrk_obj.setMap(strt_map_obj);	// Apply all strt_mrk_obj options on strt_map_obj
//				initialize();
			}, function(error){
				init = true;	// Stop running geolocation code for second time
				//TODO: Implement logic for on geolocationErros 
				alert("Problem while accessing your location.");
				console.error("**DEBUG**: Failure while retrieving your current location");
			});
		});
	}
	
	/********************************************
	 *	Expand map on click : Start Location	* 
	 ********************************************/
	$(".map.strt").on("click", function(){
		console.log("**DEBUG**: Clicked on map strt");
		$('.done-btn.strt').show();
		$('.label').hide();
		$('.map.dest').hide();
		$('.strt-btn').hide();
		var pos = $(".label.strt").position();
		scr_height = window.innerHeight-100+"px";
		scr_width = window.innerWidth-20+"px"
		$(this).css({"width":scr_width, "height":scr_height});
		google.maps.event.trigger(strt_map_obj, 'resize');
	});
	
	/************************************************
	 *	Expand map on click : Destination Location	* 
	 ************************************************/
	$(".map.dest").on("click", function(){
		console.log("**DEBUG**: Clicked on map dest");
		$('.done-btn.dest').show();
		$('.label').hide();
		$('.map.strt').hide();
		$('.strt-btn').hide();
		var pos = $(".label.strt").position();
		scr_height = window.innerHeight-140+"px";
		scr_width = window.innerWidth-20+"px"
		$(this).css({"width":scr_width, "height":scr_height});
		google.maps.event.trigger(dest_map_obj, 'resize');
	});
	
	/************************************************
	 * 	On taphold create a marker : Start Location	*
	 ************************************************/
	google.maps.event.addListener(strt_map_obj, 'mousedown', function(event){
		console.log("**DEBUG**: strt : mouse down (google.maps.event.addListener)");
		$(".map.strt").on('taphold', function(){
			console.log("**DEBUG**: tap and hold on map strt");
			strt_mrk_obj.setPosition(event.latLng); // Retrieve the taphold position and change marker position
		});
	});

	/********************************************************
	 * 	On taphold create a marker : Destination Location	*
	 ********************************************************/
	google.maps.event.addListener(dest_map_obj, 'mousedown', function(event){
		console.log("**DEBUG**: dest : mouse down (google.maps.event.addListener)");
		$(".map.dest").on('taphold', function(){
			console.log("**DEBUG**: tap and hold on map dest");
			dest_mrk_obj.setPosition(event.latLng); // Retrieve the taphold position and change marker position
		});
	});
	
	/************************************************
	 *	Done button on click event: Start Location	*
	 ************************************************/
	$(".done-btn.strt").on('click', function(){
		console.log("**DEBUG**: Clicked on Done :strt");
		strt_coord.lat = strt_mrk_obj.getPosition().lat();
		strt_coord.lng = strt_mrk_obj.getPosition().lng();
		initialize();
	});
	
	/********************************************************
	 *	Done button on click event: Destination Location	*
	 ********************************************************/
	$(".done-btn.dest").on('click', function(){
		console.log("**DEBUG**: Clicked on Done :dest");
		dest_coord.lat = dest_mrk_obj.getPosition().lat();
		dest_coord.lng = dest_mrk_obj.getPosition().lng();
		initialize();
	});
	
	/************************************
	 *	Start now button on click event	*
	 ************************************/
	$(".strt-btn.now").on("click", function(e){
		console.log("**DEBUG**: Clicked on start now");
		if(count == 0)
		{
			// Retrive start and destination positions
			strt_coord.lat = strt_mrk_obj.getPosition().lat();
			strt_coord.lng = strt_mrk_obj.getPosition().lng();
			dest_coord.lat = dest_mrk_obj.getPosition().lat();
			dest_coord.lng = dest_mrk_obj.getPosition().lng();
			
			// Prompt for trip name
			trip_name = prompt('Trip Name');
			
			// Define firebase object
			var fb_id_ref = new Firebase('https://trip-chronicle.firebaseio.com/'+window.localStorage.getItem("fb_id"));
			console.log("**DEBUG**: Connected to firebase");
			
			// Create anonymous trip_id
			var trip_id = fb_id_ref.push();
			
			// Save trip_id to local storage to use it later
			window.localStorage.setItem('trip_id', trip_id);
			
			// Upload strt_loc, dest_loc, trip_name, status to firebase under anonymous id
			trip_id.child('strt_loc').update(strt_coord);
			trip_id.child('dest_loc').update(dest_coord);
			trip_id.update({'trip_name':trip_name});
			
			// Call this on firebase update
			var onComplete = function(error){
				if(error)	// Sync failed on error
					alert("Synchronization failed. Please check your internet connection");
				else	// Redirect to current_tour.html on data sync success
					window.location.replace("../html/current_tour.html");
			};
			trip_id.update({'status':'current'}, onComplete);
			console.log("**DEBUG**: Updated firebase");
		}
		
		// Protect from multiple calls
		count++;
	});
	
	/********************************
	 *	Start later on click event	*
	 ********************************/
	$(".strt-btn.later").on("click", function() {
		console.log("**DEBUG**: Clicked on start later");
		if(count == 0)
		{
			// Retrive start and destination positions
			strt_coord.lat = strt_mrk_obj.getPosition().lat();
			strt_coord.lng = strt_mrk_obj.getPosition().lng();
			dest_coord.lat = dest_mrk_obj.getPosition().lat();
			dest_coord.lng = dest_mrk_obj.getPosition().lng();
			
			// Prompt for trip name
			trip_name = prompt('Trip Name');
			
			// Define firebase object
			var fb_id_ref = new Firebase('https://trip-chronicle.firebaseio.com/'+window.localStorage.getItem("fb_id"));
			console.log("**DEBUG**: Connected to firebase");
			
			// Create anonymous trip_id
			var trip_id = fb_id_ref.push();
			
			// Save trip_id to local storage to use it later
			window.localStorage.setItem('trip_id', trip_id);
			
			// Upload strt_loc, dest_loc, trip_name, status to firebase under anonymous id
			trip_id.child('strt_loc').update(strt_coord);
			trip_id.child('dest_loc').update(dest_coord);
			trip_id.update({'trip_name':trip_name});
			
			// Call this on firebase update
			var onComplete = function(error){
				if(error)	// Sync failed on error
					alert("Synchronization failed. Please check your internet connection");
				else	// Redirect to welcome.html on data sync success
					window.location.replace("../html/welcome.html");
			};
			trip_id.update({'status':'current'}, onComplete);
			console.log("**DEBUG**: Updated firebase");
		}
		
		// Protect from multiple calls
		count++;
	});
	
}