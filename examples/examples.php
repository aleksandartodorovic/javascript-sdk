<html>
<head>
	<title>SP JS SDK</title>
</head>

<body>

<!--ShiftPlanning JS SDK-->
<div id="sp-root"></div>
<script type="text/javascript" id="sp-sdk">
<!--
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

	spAsyncInit = (function(){// ShiftPlanning SDK calls are ready for processing

		var sp_root = document.getElementById("sp-root");

		// initialize SP SDK with developer key
		sp.init({'appKey': 'xxxxxx'});
		// get the user's login status
		session = sp.getLoginStatus( );
		if( !session )
		{// user is not yet logged in
			// log user in
			sp.login({'username': "xxxxxx", 'password': "xxxxxx"},
				function( data, status_code, status_message, error_detail )
				{// complete
					if( status_code == 1 )
					{// successfully logged in
						sp_root.innerHTML = "Hello, " + data.employee.name + "! (<a href=\"examples.php\">Download Messages<\/a>)";
					}
					else
					{// any other status_code means an error occurred, display the generic status message
						sp_root.innerHTML = "Login Status.." + status_message;
						if( error_detail )
						{// detailed error message (useful for debugging API calls)
							sp_root.innerHTML += " (Detailed Error: " + error_detail + ")";
						}
					}
				});
		}
		else
		{// user is logged in
			sp_root.innerHTML = "Hello, " + session.name + "!<br\/>";
			// create a new message
			sp.api('messaging.message', 'CREATE',
				{// parameters required for this API call
					'to': session.id,
					'subject': "This is a test message",
					'message': "My message contents"
				},
				function( data, status_code, status_message, error_detail )
				{// complete
					if( status_code == 1 )
					{//
						sp_root.innerHTML += "Sending Message..SENT!<br\/>";
					}
					else
					{//
						sp_root.innerHTML += "Sending Message..ERROR: " + status_message + "<br\/>";
					}
				});

			// retrieve user messages
			sp.api('messaging.messages', 'GET', {},
				function( data, status_code, status_message, error_detail )
				{// complete
					if( status_code == 1 )
					{// success
						if( data.length == 0 )
						{// no messages
							sp_root.innerHTML += "No messages found!<br\/>";
						}
						for( var i = 0; i < data.length; i++ )
						{// loop through each message
							var message = data[ i ];
							sp_root.innerHTML += "Message (" + ( i + 1 ) + "), ID: " + message.id + "; From: " + message.from.name + "<br\/>";
							// delete a specific message
							sp.api('messaging.message', 'DELETE', {'id': message.id},
								function( data, status_code, status_message )
								{// complete
									if( status_code == 1 )
									{// success on deleting message
										sp_root.innerHTML += "Message ID: " + message.id + "..DELETED<br\/>";
									}
									else
									{//
										sp_root.innerHTML += "Message ID: " + message.id + "..Error Deleting: " + status_message + "<br\/>";
									}
								});
						}
					}
					else
					{//
						sp_root.innerHTML += "Error Retrieving Messages: " + status_message + "<br\/>";
					}
				});



			/*sp.logout(function( data, status_code, status_message, error_detail ){// complete
				sp_root.innerHTML += "Logout Status.." + status_message + "<br\/>";
			});*/
		}
	});

//-->
</script>

</body>
</html>