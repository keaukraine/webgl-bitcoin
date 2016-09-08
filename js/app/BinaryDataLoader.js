'use strict';

function BinaryDataLoader() {
}

BinaryDataLoader.prototype = {
    load: function(url, callback) {
        var root = this,
            xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            callback && callback(this.response);
        };
        xhr.send(null);
    }
}
