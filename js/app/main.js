'use strict';

define([
        'BitcoinRenderer',
        'jquery',
        'framework/utils/FullscreenUtils'
    ],
    function(
        BitcoinRenderer,
        $,
        FullScreenUtils) {

        var bitcoinRenderer;
        var config = {
            'model': '1', // 1, 2, 3
            'normal': '1', // 1, 2, 3
            'spherical': 'gold2', // 'bronze', 'gold2', 'silver'
            'table': 'marble' // 'granite', 'marble', 'wood3'
        };

        /**
         * Initialize renderer with current scene configuration
         */
        function initRenderer() {
            var oldYaw = 0;

            window.gl = null;

            if (bitcoinRenderer) {
                bitcoinRenderer.resetLoaded();
                oldYaw = bitcoinRenderer.angleYaw;
            }

            bitcoinRenderer = new BitcoinRenderer();

            bitcoinRenderer.coinModelType = config['model'];
            bitcoinRenderer.coinNormalType = config['normal'];
            bitcoinRenderer.coinSphericalMap = config['spherical'];
            bitcoinRenderer.tableTextureType = config['table'];

            bitcoinRenderer.init('canvasGL');
            bitcoinRenderer.angleYaw = oldYaw;
        }

        $(function() {
            initRenderer();

            // initialize fullscreen if supported
            if (FullScreenUtils.isFullScreenSupported()) {
                $('#toggleFullscreen').on('click', function(e) {
                    var $body = $('body');

                    if ($body.hasClass('fs')) {
                        FullScreenUtils.exitFullScreen();
                    } else {
                        FullScreenUtils.enterFullScreen();
                    }
                    FullScreenUtils.addFullScreenListener(function() {
                        if (FullScreenUtils.isFullScreen()) {
                            $body.addClass('fs');
                        } else {
                            $body.removeClass('fs');
                        }
                    });
                });
            } else {
                $('#toggleFullscreen').addClass('hidden');
            }

            // toggle settings visibility
            $('#toggleSettings').on('click', function(e) {
                var $this = $(this),
                    $controls = $('#row-settings');

                $this.toggleClass('open');
                $controls.toggle();
            });

            // update scene configuration and re-init renderer
            $('#row-settings .btn').on('click', function() {
                var $this = $(this),
                    option = $this.data('option'),
                    value = $this.data('value');

                $this
                    .siblings()
                    .removeClass('active')
                    .end()
                    .addClass('active');

                config[option] = value;

                initRenderer();
            });
        });
    });
