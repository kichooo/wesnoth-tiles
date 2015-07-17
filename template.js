// Template used for the worker to fit inside as a string (so it can be loaded immediately).

var WesnothTiles;
(function (WesnothTiles) {
    var Internal;
    (function (Internal) {
        'use strict';
        Internal.workerString = `<%= contents %>`;
    })(Internal = WesnothTiles.Internal || (WesnothTiles.Internal = {}));
})(WesnothTiles || (WesnothTiles = {}));




// var WesnothTiles;!function(a){var b;!function(a){"use strict";a.workerString="

// "}(b=a.Internal||(a.Internal={}))}(WesnothTiles||(WesnothTiles={}));
