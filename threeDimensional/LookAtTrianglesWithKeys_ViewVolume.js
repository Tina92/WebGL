/**
 * Created by jiangwei on 2017/01/01.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'varying vec4 v_Color;\n' + //varying变量
    'void main() {\n' +
    'gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
    'v_Color = a_Color;\n' + //将数据传给片元着色器
    '}\n';
//FSHADER
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n'+
    ' gl_FragColor = v_Color;\n'+ //设置颜色
    '}\n';
function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed gl');
        return;
    }

    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('Failed init');
        return;
    }
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('Failed n');
        return;
    }
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if(!u_ViewMatrix){
        console.log('Failed u_ViewMatrix');
        return;
    }
    //设置视点，视线和上方向
    var viewMatrix = new Matrix4();
    document.onkeydown = function (ev) {
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix);
    };
    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    draw(gl, n, u_ViewMatrix, viewMatrix);
    // viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    // //将视图矩阵传给u_ViewMatrix变量
    // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4, //绿色
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4, //黄色
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0, //蓝色
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ]);
    var n = 9;
    var vertexColorBuffer = gl.createBuffer();
    if(!vertexColorBuffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if (a_Position<0){
        console.log('Failed a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    var a_Color = gl.getAttribLocation(gl.program,'a_Color');
    if (a_Color<0){
        console.log('Failed a_Color');
        return;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;
}

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25;
function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if (ev.keyCode == 65) {
        g_eyeX += 0.01;
    }else if(ev.keyCode == 83) {
        g_eyeX -= 0.01;
    }else {
        return;
    }
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function draw(gl, n, u_ViewMatrix, viewMatrix) {
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}