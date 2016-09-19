'use strict';

define(function() {

    class BaseShader {
        constructor() {
            this.vertexShaderCode =  '';
            this.fragmentShaderCode = '';
            this.program = null;

            this.fillCode();
            this.initShader();
        }

        fillCode() {}

        getShader(gl, type, code) {
            var shader = gl.createShader(type);

            gl.shaderSource(shader, code);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.warn(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }

        fillUniformsAttributes() {}

        getUniform(uniform) {
            return gl.getUniformLocation(this.program, uniform);
        }

        getAttrib(attrib) {
            return gl.getAttribLocation(this.program, attrib);
        }

        initShader() {
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
        }

        use() {
            if (this.program) {
                gl.useProgram(this.program);
            }
        }

        deleteProgram() {
            gl.deleteProgram(this.program);
        }
    };

    return BaseShader;
});
