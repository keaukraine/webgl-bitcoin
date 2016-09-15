'use strict';

define([
        'utils/matrixUtils'
    ],
    function(MatrixUtils) {

        function BaseRenderer() {
            this.mMMatrix = MatrixUtils.mat4.create();
            this.mVMatrix = MatrixUtils.mat4.create();
            this.mMVPMatrix = MatrixUtils.mat4.create();
            this.mProjMatrix = MatrixUtils.mat4.create();

            this.matOrtho = MatrixUtils.mat4.create();
            MatrixUtils.mat4.ortho(this.matOrtho, -1, 1, -1, 1, 2.0, 250);

            this.boundTick = this.tick.bind(this);
        }

        BaseRenderer.prototype.logGLError = function() {
            var err = gl.getError();
            if (err !== gl.NO_ERROR) {
                console.warn('WebGL error #' + err);
            }
        }

        BaseRenderer.prototype.setTexture2D = function(textureUnit, textureID, uniformID) {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            gl.uniform1i(uniformID, textureUnit);
        }

        BaseRenderer.prototype.setTextureCubemap = function(textureUnit, textureID, uniformID) {
            gl.ActiveTexture(gl.TEXTURE0 + textureUnit);
            gl.BindTexture(gl.TEXTURE_CUBE_MAP, textureID);
            gl.Uniform1i(uniformID, textureUnit);
        }

        BaseRenderer.prototype.setFOV = function(matrix, fovY, aspect, zNear, zFar) {
            var fW, fH;

            fH = Math.tan(fovY / 360.0 * 3.1415926) * zNear;
            fW = fH * aspect;
            MatrixUtils.mat4.frustum(matrix, -fW, fW, -fH, fH, zNear, zFar);
        }

        BaseRenderer.prototype.calculateMVPMatrix = function(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
            MatrixUtils.mat4.identity(this.mMMatrix);
            MatrixUtils.mat4.rotate(this.mMMatrix, this.mMMatrix, 0, [1, 0, 0]);
            MatrixUtils.mat4.translate(this.mMMatrix, this.mMMatrix, [tx, ty, tz]);
            MatrixUtils.mat4.scale(this.mMMatrix, this.mMMatrix, [sx, sy, sz]);
            MatrixUtils.mat4.rotateX(this.mMMatrix, this.mMMatrix, rx);
            MatrixUtils.mat4.rotateY(this.mMMatrix, this.mMMatrix, ry);
            MatrixUtils.mat4.rotateZ(this.mMMatrix, this.mMMatrix, rz);
            MatrixUtils.mat4.multiply(this.mMVPMatrix, this.mVMatrix, this.mMMatrix);
            MatrixUtils.mat4.multiply(this.mMVPMatrix, this.mProjMatrix, this.mMVPMatrix);
        }

        BaseRenderer.prototype.onBeforeInit = function() {}

        BaseRenderer.prototype.onInitError = function() {}

        BaseRenderer.prototype.initShaders = function() {}

        BaseRenderer.prototype.loadData = function() {}

        BaseRenderer.prototype.drawScene = function() {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        BaseRenderer.prototype.animate = function() {}

        BaseRenderer.prototype.tick = function() {
            requestAnimationFrame(this.boundTick);
            this.resizeCanvas();
            this.drawScene();
            this.animate();
        }

        BaseRenderer.prototype.initGL = function(canvas) {
            var gl = null;

            try {
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;
                this.isETC1Supported = !!gl.getExtension('WEBGL_compressed_texture_etc1');
            } catch (e) {}
            if (!gl) {
                console.warn('Could not initialise WebGL');
            }

            return gl;
        };

        BaseRenderer.prototype.init = function(canvasID) {
            this.onBeforeInit();

            this.canvas = document.getElementById(canvasID);
            window.gl = this.initGL(this.canvas);

            if (window.gl) {
                this.initShaders();
                this.loadData();
                this.boundTick();
            } else {
                this.onInitError();
            }
        }

        BaseRenderer.prototype.resizeCanvas = function() {
            var cssToRealPixels = window.devicePixelRatio || 1,
                displayWidth = Math.floor(this.canvas.clientWidth * cssToRealPixels),
                displayHeight = Math.floor(this.canvas.clientHeight * cssToRealPixels);

            if (this.canvas.width != displayWidth || this.canvas.height != displayHeight) {
                this.canvas.width = displayWidth;
                this.canvas.height = displayHeight;
            }
        }

        return BaseRenderer;
    });
