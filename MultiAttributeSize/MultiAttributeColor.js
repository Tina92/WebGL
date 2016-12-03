/**
 * Created by jiangwei on 2016/12/3.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' + //varying变量
    'void main() {\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
    'v_Color = a_Color;\n' + //将数据传给片元着色器
    '}\n';
//FSHADER
var FSHADER_SOURCE =
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers() {
    var verticesColors = new Float32Array([
        //顶点坐标和颜色
        0.0, 0.5, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0
    ]);
    var n = 3;
    var vertexSizeBuffer = gl.createBuffer();
    if(!vertexSizeBuffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if (a_Position<0){
        console.log('Failed a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);
    var a_Color = gl.getAttribLocation(gl.program,'a_Color');
    if (a_PointSize<0){
        console.log('Failed a_Color');
        return;
    }
    gl.vertexAttribPointer(a_Color, 1, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    return n;
}