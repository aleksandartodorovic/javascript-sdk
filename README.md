ShiftPlanning Javascript SDK
================

The [ShiftPlanning API](http://www.shiftplanning.com/api/) allows you to call modules within the ShiftPlanning [employee scheduling software](http://www.shiftplanning.com/) that respond in REST style JSON & XML.

This repository contains the open source Javascript SDK that allows you to utilize the
above on your website. Except as otherwise noted, the ShiftPlanning Javascript SDK
is licensed under the Apache Licence, Version 2.0
(http://www.apache.org/licenses/LICENSE-2.0.html)


Usage
-----

The [examples][examples] are a good place to start. The minimal you'll need to
have is:

	<script>
	var sdk_loader = (function()
	{//
		var s = document.createElement("script");
		s.src = document.location.protocol + "//www.shiftplanning.com/api/js-sdk/all.js";
		s.type = "text/javascript";
		document.getElementsByTagName("head")[0].appendChild(s);
	});
	if( window.addEventListener )
	{// non ie
		window.addEventListener("load", sdk_loader, false);
	}
	else
	{// ie
		window.attachEvent("onload", sdk_loader);
	}

	sp.init({'appKey': 'XXXXXXXXXXXXXXXXXX'});


To make [API][API] calls:

	sp.login({'username': "xxxxxx", 'password': "xxxxxx"},
		function( data, status_code, status_message, error_detail )
		{// complete
			if( status_code == 1 )
			{// successfully logged in

			}
			else
			{// any other status_code means an error occurred, display the generic status message

			}
		});

	// Generic API Call:

	sp.api('messaging.messages', 'GET', {}, function()};

Logged in vs Logged out:

	session = sp.getLoginStatus( );
	if( session ){
	  // LOGGED IN
	} else {
	  // LOGGED OUT
	}

[examples]: https://github.com/shiftplanning/javascript-sdk/tree/master/examples/
[API]: http://www.shiftplanning.com/api/


Feedback
--------

We are relying on the [GitHub issues tracker][issues] linked from above for
feedback. File bugs or other issues [here][issues].

[issues]: http://github.com/shiftplanning/javascript-sdk/issues