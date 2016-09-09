'use strict';

define(function() {

    function UncompressedTextureLoader() {}

    UncompressedTextureLoader.load = function(url, callback) {
            var texture = gl.createTexture();

            texture.image = new Image();
            texture.image.src = url;
            texture.image.onload = function() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.bindTexture(gl.TEXTURE_2D, null);
                if (texture.image && texture.image.src) {
                    console.log('Loaded texture ' + url + ' [' + texture.image.width + 'x' + texture.image.height + ']');
                }
                callback && callback();
            };

            return texture;
        }

    return UncompressedTextureLoader;
});
