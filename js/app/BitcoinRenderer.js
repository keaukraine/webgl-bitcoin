'use strict';

define([
        'BaseRenderer',
        'jquery',
        'DiffuseShader',
        'SphericalMapLMShader',
        'LMTableShader',
        'utils/MatrixUtils',
        'FullModel',
        'UncompressedTextureLoader',
        'CompressedTextureLoader'
    ],
    function(
        BaseRenderer,
        $,
        DiffuseShader,
        SphericalMapLMShader,
        LMTableShader,
        MatrixUtils,
        FullModel,
        UncompressedTextureLoader,
        CompressedTextureLoader) {

        class BitcoinRenderer extends BaseRenderer {
            constructor() {
                super();

                this.loadedItemsCount = 0; // couter of loaded OpenGL buffers+textures
                this.loaded = false; // won't draw until this is true

                this.angleYaw = 0; // camera rotation angle
                this.lastTime = 0; // used for animating camera

                this.coinModelType = '1'; // coin mesh: 1, 2, 3
                this.coinNormalType = '1'; // coin normal texture: 1, 2, 3
                this.coinSphericalMap = 'gold2'; // coin spherical map texture: 'bronze', 'gold2', 'silver'
                this.tableTextureType = 'marble'; // floor texture: 'granite', 'marble', 'wood3'

                this.ITEMS_TO_LOAD = 7; // total number of OpenGL buffers+textures to load
                this.FLOAT_SIZE_BYTES = 4; // float size, used to calculate stride sizes
                this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * this.FLOAT_SIZE_BYTES;
                this.TRIANGLE_VERTICES_DATA_POS_OFFSET = 0;
                this.TRIANGLE_VERTICES_DATA_UV_OFFSET = 3;
                this.FOV_LANDSCAPE = 25.0; // FOV for landscape
                this.FOV_PORTRAIT = 40.0; // FOV for portrait
                this.YAW_COEFF_NORMAL = 150.0; // camera rotation speed
            }

            /**
             * Resets loaded state for renderer
             */
            resetLoaded() {
                this.loaded = false;
                this.loadedItemsCount = 0;
            }

            onBeforeInit() {
                super.onBeforeInit();

                $('#canvasGL').show();
            }

            onInitError() {
                super.onInitError();

                $(canvas).hide();
                $('#alertError').show();
            }

            initShaders() {
                this.shaderSphericalMapLM = new SphericalMapLMShader();
                this.shaderLMTable = new LMTableShader();
            }

            /**
             * Callback for all loading function. Updates loading progress and allows rendering after loading all stuff
             */
            updateLoadedObjectsCount() {
                var percent,
                    $progress = $('#progressLoading');

                this.loadedItemsCount++; // increase loaded objects counter

                percent = Math.floor(this.loadedItemsCount * 100 / this.ITEMS_TO_LOAD) + '%';
                $progress
                    .css('width', percent)
                    .html(percent); // update loading progress

                if (this.loadedItemsCount >= this.ITEMS_TO_LOAD) {
                    this.loaded = true; // allow rendering
                    console.log('Loaded all assets');
                    $('#row-progress').hide();
                    $('.control-icon').show();
                }
            }

            /**
             * loads all WebGL buffers and textures. Uses updateLoadedObjectsCount() callback to indicate that data is loaded to GPU
             */
            loadData() {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                this.textureCoinsNormalMap = UncompressedTextureLoader.load('data/textures/faces/coin' + this.coinNormalType + '_normal.png', boundUpdateCallback);
                this.textureSphericalMap = UncompressedTextureLoader.load('data/textures/spheres/sphere_' + this.coinSphericalMap + '.png', boundUpdateCallback);
                this.textureCoinsLightMap = this.loadETC1WithFallback('data/textures/coin' + this.coinModelType + '_lm');
                this.textureTable = this.loadETC1WithFallback('data/textures/table/' + this.tableTextureType);
                this.textureTableLM = this.loadETC1WithFallback('data/textures/table/table_lm_coin' + this.coinModelType);

                this.modelTable = new FullModel();
                this.modelTable.load('data/models/table', boundUpdateCallback);
                this.modelCoins = new FullModel();
                this.modelCoins.load('data/models/coins' + this.coinModelType, boundUpdateCallback);
            }

            /**
             * Loads either ETC1 from PKM or falls back to loading PNG
             * @param {string} url - URL to texture without extension
             */
            loadETC1WithFallback(url) {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                if (this.isETC1Supported) {
                    return CompressedTextureLoader.loadETC1(url + '.pkm', boundUpdateCallback);
                } else {
                    return UncompressedTextureLoader.load(url + '.png', boundUpdateCallback);
                }
            }

            /**
             * Calculates camera matrix
             * @param {unmber} a - position in [0...1] range
             */
            positionCamera(a) {
                var x, y, z,
                    sina, cosa;

                x = 0;
                y = 0;
                z = (Math.sin(a * 6.2831852) * 100.0) + 200.0;
                sina = Math.sin(this.angleYaw / 360.0 * 6.2831852);
                cosa = Math.cos(this.angleYaw / 360.0 * 6.2831852);
                x = sina * 180.0;
                y = cosa * 180.0;

                MatrixUtils.mat4.identity(this.mVMatrix);
                MatrixUtils.mat4.lookAt(this.mVMatrix, [x, y, z], [0, 0, 0], [0, 0, 1]);
            }

            /**
             * Calculates projection matrix
             */
            setCameraFOV(multiplier) {
                var ratio;

                if (gl.canvas.height > 0) {
                    ratio = gl.canvas.width / gl.canvas.height;
                } else {
                    ratio = 1.0;
                }

                if (gl.canvas.width >= gl.canvas.height) {
                    this.setFOV(this.mProjMatrix, this.FOV_LANDSCAPE * multiplier, ratio, 20.0, 1000.0);
                } else {
                    this.setFOV(this.mProjMatrix, this.FOV_PORTRAIT * multiplier, ratio, 20.0, 1000.0);
                }
            }

            /**
             * Issues actual draw calls
             */
            drawScene() {
                if (!this.loaded) {
                    return;
                }

                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);

                this.positionCamera(0.0);
                this.setCameraFOV(1.0);

                this.drawCoins();
                this.drawTable();
            }

            drawTable() {
                this.shaderLMTable.use();

                this.setTexture2D(0, this.textureTable, this.shaderLMTable.sTexture);
                this.setTexture2D(1, this.textureTableLM, this.shaderLMTable.sLM);
                gl.uniform1f(this.shaderLMTable.diffuseScale, 8.0);
                this.drawLMVBOTranslatedRotatedScaled(this.shaderLMTable, this.modelTable, 0, 0, 0, 0, 0, 0, 1, 1, 1);
            }

            drawCoins() {
                this.shaderSphericalMapLM.use();

                this.setTexture2D(0, this.textureCoinsNormalMap, this.shaderSphericalMapLM.normalMap);
                this.setTexture2D(1, this.textureSphericalMap, this.shaderSphericalMapLM.sphereMap);
                this.setTexture2D(2, this.textureCoinsLightMap, this.shaderSphericalMapLM.aoMap);
                this.drawCoinVBOTranslatedRotatedScaled(this.shaderSphericalMapLM, this.modelCoins, 0, 0, 0, 0, 0, 0, 1, 1, 1);
            }

            drawCoinVBOTranslatedRotatedScaled(shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);
                gl.enableVertexAttribArray(shader.rm_TexCoord1);
                gl.enableVertexAttribArray(shader.rm_Normal);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 2 + 3), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 2 + 3), 4 * (3));
                gl.vertexAttribPointer(shader.rm_TexCoord1, 2, gl.FLOAT, false, 4 * (3 + 2 + 2 + 3), 4 * (3 + 2));
                gl.vertexAttribPointer(shader.rm_Normal, 3, gl.FLOAT, false, 4 * (3 + 2 + 2 + 3), 4 * (3 + 2 + 2));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_matrix, false, this.mVMatrix);
                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);
            }

            drawLMVBOTranslatedRotatedScaled(shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);
                gl.enableVertexAttribArray(shader.rm_TexCoord1);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 2), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 2), 4 * (3));
                gl.vertexAttribPointer(shader.rm_TexCoord1, 2, gl.FLOAT, false, 4 * (3 + 2 + 2), 4 * (3 + 2));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);
            }

            /**
             * Updates camera rotation
             */
            animate() {
                var timeNow = new Date().getTime(),
                    elapsed;

                if (this.lastTime != 0) {
                    elapsed = timeNow - this.lastTime;

                    this.angleYaw += elapsed / this.YAW_COEFF_NORMAL;
                    this.angleYaw %= 360.0;
                }

                this.lastTime = timeNow;
            }
        }

        return BitcoinRenderer;
    });
