/**
 * Created by jiangwei on 2016/12/7.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 v_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   v_TexCoord = a_TexCoord;\n' +
    '}\n';
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sample2D u_Sampler;\n' +
    'void main() {\n' +
    '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '}\n';