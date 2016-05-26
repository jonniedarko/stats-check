// original src: http://mattsnider.com/network-information-api-polyfill/
(function() {
  var oConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var sType;
  var aCallbacks = [];
 
  // Obviously this is not accurate.
  function fnGuessType(iBandwidth) {
    if (iBandwidth > 1) {
      return 'ethernet';
    } else if (iBandwidth > .5) {
      return 'wifi';
    } else if (iBandwidth === 0) {
      return 'none';
    } else {
      return 'cellular';
    }
  }
 
  // Simple function to iterate over the callbacks.
  function fnCallbackIter(fn) {
    for (var i = aCallbacks.length - 1; 0 <= i; i--) {
      fn(aCallbacks[i]);
    }
  }
 
  if (oConnection) {
    // API is available.
    if ('metered' in oConnection) {
      // Legacy API, create obfuscation polyfill.
      sType = fnGuessType(oConnection.bandwidth);
 
      // If the bandwidth changes drastically, execute callbacks.
      oConnection.addEventListener('change', function(event) {
        var sNewType = fnGuessType(oConnection.bandwidth);
        if (sType !== sNewType) {
          sType = sNewType;
          fnCallbackIter(function(fnCallback) {
            fnCallback.call(navigator.connection, event);
          });
        }
      });
 
      navigator.connection = {
        addEventListener: function(sName, fnCallback) {
          var bFoundCallback = false;
          if (sName === 'typechange') {
            // Assert the callback doesn't exist before appending.
            fnCallbackIter(function(fnCallbackInner) {
              if (fnCallback === fnCallbackInner) {
                bFoundCallback = true;
              }
            });
            if (!bFoundCallback) {
              console.log('1');
              aCallbacks.push(fnCallback);
            }
          } else {
            // Some other event... pass through.
            oConnection.addEventListener.apply(this, arguments);
          }
        },
        removeEventListener: function(sName, fnCallback) {
          var aNewCallbacks = [];
          if (sName === 'typechange') {
            if (fnCallback) {
              // Create a new list of callbacks without the provided one.
              aNewCallbacks = [];
              fnCallbackIter(function(fnCallbackInner) {
                if (fnCallback !== fnCallbackInner) {
                  aNewCallbacks.push(fnCallbackInner);
                }
              });
            }
            aCallbacks = aNewCallbacks;
            console.log(aCallbacks);
          } else {
            // Some other event... pass through.
            oConnection.addEventListener.apply(this, arguments);
          }
        },
        type: 'unknown'
      };
    }
 
    // Don’t change the connection object.
  } else {
    // API doesn't exist, create empty polyfill.
    navigator.connection = {
      addEventListener: function() {},
      removeEventListener: function() {},
      type: 'unknown'
    };
  }
}());
