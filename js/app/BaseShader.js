'use strict';

define(function() {
    function BaseShader() {
        this.fillCode();
        this.initShader();
    }

    BaseShader.prototype = {
        vertexShaderCode: '',
        fragmentShaderCode: '',
        program: null,

        fillCode: function() {},

        getShader: function(gl, type, code) {
            // shader = gl.createShader(gl.FRAGMENT_SHADER);
            var shader = gl.createShader(type);

            gl.shaderSource(shader, code);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.warn(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        },

        fillUniformsAttributes: function() {

        },

        getUniform: function(uniform) {
            return gl.getUniformLocation(this.program, uniform);
        },

        getAttrib: function(attrib) {
            return gl.getAttribLocation(this.program, attrib);
        },

        initShader: function() {
            var shaderProgram,
                fragmentShader = this.getShader(gl, gl.FRAGMENT_SHADER, this.fragmentShaderCode),
                vertexShader = this.getShader(gl, gl.VERTEX_SHADER, this.vertexShaderCode);

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.warn(this.constructor.name + ': Could not initialise shader');
            } else {
                console.log(this.constructor.name + ': Initialised shader');
            }

            gl.useProgram(shaderProgram);
            this.program = shaderProgram;

            this.fillUniformsAttributes();
        },

        use: function() {
            if (this.program) {
                gl.useProgram(this.program);
            }
        },

        delete: function() {
            gl.deleteProgram(this.program);
        }
    };

    return BaseShader;
});
