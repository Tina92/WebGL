/**
 * Created by jiangwei on 2016/12/3.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
        'gl_Position = a_Position;\n' +
        'gl_PointSize = a_PointSize;\n' +
    '}\n';
//FSHADER
var FSHADER_SOURCE =
    'void main() {\n'+
        ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+ //设置颜色
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
function initVertexBuffers(gl) {
    // var vertices = new Float32Array([
    //     0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    // ]);
    // var n = 3;
    // var sizes = new Float32Array([
    //     10.0, 20.0, 30.0//点的大小
    // ]);
    // //创建缓冲区对象
    // var vertexBuffer = gl.createBuffer();
    // var sizeBuffer = gl.createBuffer();
    // if(!vertexBuffer && !sizeBuffer){
    //     console.log('Failed buffer');
    //     return;
    // }
    // //将顶点坐标写入缓冲区对象并开始
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER,vertices, gl.STATIC_DRAW);
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (!a_Position){
    //     console.log('Faild a_Position');
    //     return;
    // }
    // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);
    //
    // //将顶点尺寸写入缓冲区对象并开启
    // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    // var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    // if(a_PointSize < 0){
    //     console.log('Failed a_PointSize');
    //     return;
    // }
    // gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_PointSize);

    var verticesSizes = new Float32Array([
        0.0, 0.5, 10.0, //第一个点坐标和尺寸
        -0.5, -0.5, 20.0,
        0.5, -0.5, 30.0
    ]);
    var n = 3;
    var vertexSizeBuffer = gl.createBuffer();
    if(!vertexSizeBuffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if (a_Position<0){
        console.log('Failed a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_Position);
    var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
    if (a_PointSize<0){
        console.log('Failed a_PointSiz');
        return;
    }
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}