if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

function shiftplanning( )
{
/**
 * ShiftPlanning JavaScript SDK v1.0
 * 11/08/2010
 */
}

shiftplanning.prototype.startQueue = 1;
shiftplanning.prototype.queue = [];
shiftplanning.prototype._appKey = null;
shiftplanning.prototype._appToken = null;
shiftplanning.prototype._session = null;
shiftplanning.prototype._sessionIdentifier = '_SP';
shiftplanning.prototype._sessionInfo = shiftplanning.prototype._sessionIdentifier + '_userData';
shiftplanning.prototype._sessionLength = 30;
shiftplanning.prototype._domain = {
		'base': "https://www.shiftplanning.com/api/js-sdk",
		'api_endpoint': "https://www.shiftplanning.com/api/js-sdk/proxy.php"
	};

shiftplanning.prototype.init = function( config )
{// initialize the ShiftPlanning JavaScript SDK
	// check for an active session
	var session_data = shiftplanning.prototype.getSession( );
	if( session_data )
	{// session already established, use appToken to call API
		shiftplanning.prototype._appToken = shiftplanning.prototype.getStoredVal( shiftplanning.prototype._sessionIdentifier );
		shiftplanning.prototype._appKey = null;
	}
	else
	{// session not established, use developer key to access API
		shiftplanning.prototype._appKey = config['appKey'];
	}
}

shiftplanning.prototype.getStoredVal = function( name )
{// get stored values
	var cookie_name = name + "=";
	var vals = document.cookie.split(';');
	for( var i = 0; i < vals.length; i++ )
	{//
		var c = vals[ i ];
		while( c.charAt(0) == ' ' )
		{//
			c = c.substring( 1, c.length );
		}
		if( c.indexOf( cookie_name ) == 0 )
		{//
			return unescape( c.substring( cookie_name.length, c.length ) );
		}
	}
	return null;
}

shiftplanning.prototype.startSession = function( token, response )
{// start the session
	if( token )
	{// success, token passed successfully
		var date = new Date( );
		date.setTime( date.getTime( ) + ( shiftplanning.prototype._sessionLength * 24 * 60 * 60 * 1000 ) );
		document.cookie = shiftplanning.prototype._sessionIdentifier + "=" + token + "; expires=" + date.toGMTString( ) + "; path=/";
		document.cookie = shiftplanning.prototype._sessionInfo + "=" + escape( JSON.stringify( response.data.employee ) ) + "; expires=" + date.toGMTString( ) + "; path=/";
	}
	else
	{//
		alert( response.error );
	}
}

shiftplanning.prototype.getSession = function( )
{// get the current active session
	var session = shiftplanning.prototype.getStoredVal( shiftplanning.prototype._sessionIdentifier );
	if( session && session!="" )
	{// session not empty
		var user_data = eval( '(' + shiftplanning.prototype.getStoredVal( shiftplanning.prototype._sessionInfo ) + ')' );
		if( typeof user_data == 'object' )
		{// user data retrieved successfully
			return user_data;
		}
		else
		{// no user data available, user not logged in
			return false;
		}
	}
	else
	{// session not yet established
		return false;
	}
}

shiftplanning.prototype.endSession = function( )
{// end the session
	var date = new Date( );
	date.setTime( date.getTime( ) + ( 0 * 24 * 60 * 60 * 1000 ) );
	document.cookie = shiftplanning.prototype._sessionIdentifier + "=; expires=" + date.toGMTString( ) + "; path=/";
	document.cookie = shiftplanning.prototype._sessionInfo + "=; expires=" + date.toGMTString( ) + "; path=/";
}

shiftplanning.prototype.getLoginStatus = function( )
{// get login status
	return shiftplanning.prototype.getSession( );
}

shiftplanning.prototype.login = function( user_data, complete, processing, options )
{// login call
	shiftplanning.prototype.api( 'staff.login', 'GET', user_data, complete, processing, options );
	setTimeout(function( ){shiftplanning.prototype._appToken = shiftplanning.prototype.getStoredVal( shiftplanning.prototype._sessionIdentifier );},250);
}

shiftplanning.prototype.logout = function( complete, processing, options )
{// logout call
	shiftplanning.prototype.api( 'staff.logout', 'GET', {}, complete, processing, options );
}

shiftplanning.prototype.api = function( module, method, data, complete, options )
{// perform an API call
	var request = [module, method, data, complete, { '_appKey': shiftplanning.prototype._appKey, '_appToken': shiftplanning.prototype._appToken }];
	shiftplanning.prototype.queue.push( request );
	if( shiftplanning.prototype.startQueue ==  1 )
	{//
		shiftplanning.prototype.startQueue = 0;
		shiftplanning.prototype.processQueue( );
	}
}

shiftplanning.prototype.processQueue = function( )
{// clear out the request queue
	if( shiftplanning.prototype.queue.length > 0 )
	{//
		//alert( shiftplanning.prototype.queue.length );
		for( q in shiftplanning.prototype.queue )
		{//
			new APIRequest( shiftplanning.prototype.queue[ q ][0],
					shiftplanning.prototype.queue[ q ][1],
					shiftplanning.prototype.queue[ q ][2],
					shiftplanning.prototype.queue[ q ][3],
					shiftplanning.prototype.queue[ q ][4]
				)
			shiftplanning.prototype.queue.shift( );
			break;
		}
	}
}

function APIRequest( module, method, data, complete, options )
{//
	APIRequest.prototype._request = {};
	APIRequest.prototype._request.request = {};
	APIRequest.prototype._request.request.module = module;
	APIRequest.prototype._request.request.method = method;
	APIRequest.prototype._initAfter = 0;
	APIRequest.prototype._req = 'sp-api-request-' + Math.floor( Math.random() * 100+1 );
	APIRequest.prototype._xhr = {};
	APIRequest.prototype._destroyAfter = 0;
	APIRequest.prototype._options = options;
	APIRequest.prototype._complete = complete;
	APIRequest.prototype._messages = {
		'-3': "Flagged API Key - Pemanently Banned",
		'-2': "Flagged API Key - Too Many invalid access attempts - contact us",
		'-1': "Flagged API Key - Temporarily Disabled - contact us",
		'1': "Success",
		'2': "Invalid API key - App must be granted a valid key by ShiftPlanning",
		'3': "Invalid token key - Please re-authenticate",
		'4': "Invalid Method - No Method with that name exists in our API",
		'5': "Invalid Module - No Module with that name exists in our API",
		'6': "Invalid Action - No Action with that name exists in our API",
		'7': "Authentication Failed - You do not have permissions to access the service",
		'8': "Missing parameters - Your request is missing a required parameter",
		'9': "Invalid parameters - Your request has an invalid parameter type",
		'10': "Extra parameters - Your request has an extra/unallowed parameter type",
		'12': "Create Failed - Your CREATE request failed",
		'13': "Update Failed - Your UPDATE request failed",
		'14': "Delete Failed - Your DELETE request failed",
		'20': "Incorrect Permissions - You don't have the proper permissions to access this",
		'90': "Suspended API key - Access for your account has been suspended, please contact ShiftPlanning",
		'91': "Throttle exceeded - You have exceeded the max allowed requests. Try again later.",
		'98': "Bad API Paramaters - Invalid POST request. See Manual.",
		'99': "Service Offline - This service is temporarily offline. Try again later."
	};

	var i = document.createElement("script");
	i.type = "text/javascript";
	i.id = APIRequest.prototype._req;

	if( !document.getElementById( APIRequest.prototype._req ) )
	{// element doesn't exist
		document.getElementById("sp-sdk").parentNode.appendChild(i);
	}

	APIRequest.prototype._xhr = document.getElementById( APIRequest.prototype._req );
	if( window.addEventListener )
	{// non ie
		APIRequest.prototype._xhr.addEventListener("load", APIRequest.prototype.complete, false );
	}
	else
	{// ie
		APIRequest.prototype._xhr.attachEvent("onreadystatechange", function(){
				if(APIRequest.prototype._xhr.readyState=='loaded') {
					APIRequest.prototype.complete( );
				}
			});
		APIRequest.prototype._xhr.attachEvent("onload", APIRequest.prototype.complete );
	}
	for( p in data )
	{// add in additional request parameters
		APIRequest.prototype._request.request[ p ] = data[ p ];
	}

	// create the XHR request
	APIRequest.prototype.create( );
}

APIRequest.prototype.getResponseBody = function( )
{//
	return sdk_response[ APIRequest.prototype._req ];
}

APIRequest.prototype.complete = function( )
{// request finished
	APIRequest.prototype._response = APIRequest.prototype.getResponseBody( );

	// remove the request data script
	if( typeof APIRequest.prototype._complete == 'function' )
	{//
		new APIRequest.prototype._complete( APIRequest.prototype._response.data,
			APIRequest.prototype._response.status,
			APIRequest.prototype._messages[ APIRequest.prototype._response.status ], 
			APIRequest.prototype._response.error );
		shiftplanning.prototype.processQueue( );
	}

	if( APIRequest.prototype._initAfter == 1 )
	{// initialize session after this API call
		shiftplanning.prototype.startSession( APIRequest.prototype._response.token, APIRequest.prototype._response );
	}
	else if( APIRequest.prototype._destroyAfter == 1 )
	{// destroy session after this API call
		shiftplanning.prototype.endSession( );
	}
}

APIRequest.prototype.create = function( )
{// create the API Request

	if( APIRequest.prototype._request.request.module == 'staff.login' )
	{// intialize session after this call
		APIRequest.prototype._initAfter = 1;
	}
	else if( APIRequest.prototype._request.request.module == 'staff.logout' )
	{// destroy session after this call
		APIRequest.prototype._destroyAfter = 1;
	}

	if( APIRequest.prototype._options._appToken == null || APIRequest.prototype._options._appToken == false )
	{// use developer key, token not yet established
		APIRequest.prototype._request.key = APIRequest.prototype._options._appKey;
	}
	else
	{// use token, user already authenticated
		APIRequest.prototype._request.token = APIRequest.prototype._options._appToken;
	}

	var my_request = shiftplanning.prototype._domain.api_endpoint + "?req=" + APIRequest.prototype._req + "&data=" + encodeURIComponent( JSON.stringify( APIRequest.prototype._request ) );
	APIRequest.prototype._xhr.src = my_request;
}

var sp = new shiftplanning( );
var sdk_response = [];
var session;

if(sp){spAsyncInit();}
