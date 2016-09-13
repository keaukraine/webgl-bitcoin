'use strict';

define(['binaryDataLoader'], function(BinaryDataLoader) {

    function FullModel() {
        this.bufferIndices = null;
        this.bufferStrides = null;
        this.numIndices = 0;
    }

    FullModel.prototype = {
        load: function(url, callback) {
            var root = this;

            function loadBuffer(buffer, target, arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
                gl.bindBuffer(target, buffer);
                gl.bufferData(target, byteArray, gl.STATIC_DRAW);
            }

            BinaryDataLoader.load(url + '-indices.bin',
                function(data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + '-indices.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferIndices, gl.ELEMENT_ARRAY_BUFFER, data);
                    root.numIndices = data.byteLength / 2 / 3;
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
            BinaryDataLoader.load(url + '-strides.bin',
                function(data) {
                    root.bufferStrides = gl.createBuffer();
                    console.log('Loaded ' + url + '-strides.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferStrides, gl.ARRAY_BUFFER, data);
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
        },

        bindBuffers: function() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferStrides);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
        },

        getNumIndices: function() {
            return this.numIndices;
        }
    }

    return FullModel;
});
