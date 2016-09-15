'use strict';

define(function() {

    function FullScreenUtils() {}

    FullScreenUtils.enterFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
        }
        if (document.documentElement.webkitRequestFullScreen) {
            if (!document.webkitFullscreenElement) {
                document.documentElement.webkitRequestFullscreen();
            }
        }
        if (document.documentElement.mozRequestFullScreen) {
            if (!document.mozFullscreenElement) {
                document.documentElement.mozRequestFullScreen();
            }
        }
    }

    FullScreenUtils.exitFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        if (document.documentElement.webkitRequestFullscreen) {
            if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        if (document.documentElement.mozRequestFullScreen) {
            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }
    }

    FullScreenUtils.addFullScreenListener = function(exitHandler) {
        if (document.documentElement.requestFullscreen) {
            document.addEventListener('fullscreenchange', exitHandler, false);
        }
        if (document.documentElement.webkitRequestFullScreen) {
            document.addEventListener('webkitfullscreenchange', exitHandler, false);
        }
        if (document.documentElement.mozRequestFullScreen) {
            document.addEventListener('mozfullscreenchange', exitHandler, false);
        }
    }

    FullScreenUtils.isFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            return !!document.fullscreenElement;
        }
        if (document.documentElement.webkitRequestFullscreen) {
            return !!document.webkitFullscreenElement;
        }
        if (document.documentElement.mozRequestFullScreen) {
            return !!document.mozFullScreenElement;
        }
    }

    return FullScreenUtils;
});
