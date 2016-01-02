window.fbAsyncInit = function() {
    FB.init({
        appId      : '1671770239773354',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use version 2.5
    });
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response, success, error) {
    FB_ACCESS_TOKEN = response.authResponse.accessToken;
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        if (typeof(success) == 'function')
            success(response);
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        if (typeof(error) == 'function')
            error(response);
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        if (typeof(error) == 'function')
            error(response);
    }
}

function checkLoginState(success, error) {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response, success, error);
    });
}

var conversions = {
  stringToBinaryArray: function(string) {
    return Array.prototype.map.call(string, function(c) {
      return c.charCodeAt(0) & 0xff;
    });
  },
  base64ToString: function(b64String) {
    return atob(b64String);
  }
};

var DEFAULT_CALL_OPTS = {
  url: 'https://graph.facebook.com/me/photos',
  type: 'POST',
  cache: false,
  success: function(response) {
    console.log(response);
  },
  error: function() {
    console.error(arguments);
  },
  // we compose the data manually, thus
  processData: false,
  /**
   *  Override the default send method to send the data in binary form
   */
  xhr: function() {
    var xhr = $.ajaxSettings.xhr();
    xhr.send = function(string) {
      var bytes = conversions.stringToBinaryArray(string);
      XMLHttpRequest.prototype.send.call(this, new Uint8Array(bytes).buffer);
    };
    return xhr;
  }
};
/**
 * It composes the multipart POST data, according to HTTP standards
 */
var composeMultipartData = function(fields, boundary) {
  var data = '';
  $.each(fields, function(key, value) {
    data += '--' + boundary + '\r\n';

    if (value.dataString) { // file upload
      data += 'Content-Disposition: form-data; name=\'' + key + '\'; ' +
        'filename=\'' + value.name + '\'\r\n';
      data += 'Content-Type: ' + value.type + '\r\n\r\n';
      data += value.dataString + '\r\n';
    } else {
      data += 'Content-Disposition: form-data; name=\'' + key + '\';' +
        '\r\n\r\n';
      data += value + '\r\n';
    }
  });
  data += '--' + boundary + '--';
  return data;
};

/**
 * It sets the multipart form data & contentType
 */
var setupData = function(callObj, opts) {
  // custom separator for the data
  var boundary = 'Awesome field separator ' + Math.random();

  // set the data
  callObj.data = composeMultipartData(opts.fb, boundary);

  // .. and content type
  callObj.contentType = 'multipart/form-data; boundary=' + boundary;
};

// the "public" method to be used
var postImage = function(opts) {

  // create the callObject by combining the defaults with the received ones
  var callObj = $.extend({}, DEFAULT_CALL_OPTS, opts.call);

  // append the access token to the url
  callObj.url += '?access_token=' + opts.fb.accessToken;

  // set the data to be sent in the post (callObj.data = *Magic*)
  setupData(callObj, opts);

  // POST the whole thing to the defined FB url
  $.ajax(callObj);
};
 