/**
 * Facebook authentication
 */

//global variables
var app_id = '604553956268935'; //facebook App ID

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

//subscribe auth.login auth.login
FB.Event.subscribe('auth.login', function(response) {
    console.log("**DEBUG**: auth.login.event");
});


//login function
function login() {
    FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
//            alert('Already logged in');
              console.log("**DEBUG**: FB.login: Login Successful\n Welcome! ", response.name);
//                alert('redirecting to welcome.html');
                window.location.replace("../html/welcome.html");        	
        } 
        else {
//            alert('Not logged in. Proceed to login');
            FB.login(
                    function(response) {
                        if(response.status == 'connected'){
                        	window.localStorage.setItem("logged_in", "True"); //If user login add an entry to local database
                        	login();
                        }
                        else {
                            console.error('**DEBUG**: FB.login: Failed to login');
                            alert('login fail!');
                        }
                    },
                    {scope : 'email'}
                    );
        }             
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
		login();
		}
	catch (e) {
		alert('init exception: '+e);
		console.error("**DEBUG**: FB.init: Failure\n Exception: ", e);
		}
}

//User permission to access facebook
function exitApp() {
    //navigator.app is true for Android
    if(navigator.app){
    	alert('exitApp() Android');
        console.log("**DEBUG**: Closing Trip Chronicle App in Android.")
        navigator.app.exitApp();    //close application
    }
    //navigator.device is true for iOS
    else if (navigator.device) {
    //TODO: Apple rejects the app if you close it from the application level.
    //It should be closed by pressing the home button.
    navigator.device.exitApp(); //TODO: Replace this line with a code navigating to good bye page.
    }
}