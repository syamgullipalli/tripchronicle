//global variables
var app_id = '604553956268935'; //facebook App ID
var img = document.createElement("img");

//Check if cordova.js is included
if((typeof cordova == 'undefined')&&(typeof Cordova == 'undefined'))
    console.error("**DEBUG**: Make sure that cordova.js is included in the current directory.");

//Check if cdv-plugin-fb-connect.js is included
if(typeof CDV == 'undefined')
    console.error("**DEBUG**: Make sure that cdv-plugin-fb-connect.js is included in the current " +
            "directory.");
    
//Check if facebook-js-sdk.js is included
if(typeof FB == 'undefined')
    console.error("**DEBUG**: Make sure that facebook-js-sdk.js is included in the current " +
            "directory.");

//subscribe auth.login auth.logout
FB.Event.subscribe('auth.logout', function(response) {
    console.log("**DEBUG**: auth.logout event");
});

//display facebook name
function displayName() {
	FB.api('/me', function(response) {
		if (response && !response.error) {
			document.getElementById('loading').innerHTML= "<p>Welcome</p> <h3>"
				+ response.name + "</h3>";
			window.localStorage.setItem("fb_id", response.id);
		}
	});
	FB.api('/me/picture',
			{
				"width"	: "70",
				"redirect" : false,
				"type" : "square",
				"height" : "70"
			}, 
			function(response){
//				alert(response.data.url);
//				var c = document.getElementById("profile_pic");
//				var cxt = c.getContext("2d");
//				var img = new Image();
//				img.src = response.data.url;
//				img.onload = function(){
//					cxt.drawImage(img,0,0);
//				}
				img.onload = function(e) {
					var c = document.getElementById("profile_pic");
					c.appendChild(e.target);
				}
				img.setAttribute("src", response.data.url);
	});
	 navigator.splashscreen.hide();
}

//logout function
function logout(){
    FB.logout(function(response){
        console.log('**DEBUG**: FB.logout: Logout Successful');
        document.getElementById('loading').innerHTML="Successfully logged out!";
        window.localStorage.removeItem("logged_in");
        alert('logged out');
        window.location.replace("../index.html");
    });
}

//run this when click on OK button
function fbInit() {
//	alert('fbInit()');
	try {
		//Make sure that you set app_id correct
//		alert('fbInit() try{}');
		FB.init({appId : app_id,
				 nativeInterface : CDV.FB,
				 useCacheDialogs : false,
				 logging : true,
				 status : true,
				 xfbml : false
				 });
		console.log("**DEBUG**: FB.init: Success. App ID: ", app_id);
		}
	catch (e) {
		alert('init exception: '+e);
		console.error("**DEBUG**: FB.init: Failure\n Exception: ", e);
//		alert(e);
		}
	displayName();
}


document.addEventListener("deviceready", fbInit, false);