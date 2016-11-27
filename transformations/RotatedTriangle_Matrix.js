/**
 * Created by jiangwei on 2016/11/26.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_xformMatrix;\n' +
    'void main() {\n' +
        'gl_Position = u_xformMatrix * a_Position;\n' +
    '}\n';
//FSHADER
var FSHADER_SOURCE =
    'void main() {\n' +
        'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
//rotate
var ANGLE = 90.0;
function main() {
    var canvas = document.getElementById("example");
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed gl');
        return;
    }
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed init');
        return;
    }
    //设置顶点位置
    var n = initVertexBuffers(gl);
    if(n < 0){
        console.log('Failed n');
        return;
    }

    //创建旋转矩阵
    // var radian = Math.PI * ANGLE / 180.0; //角度值转弧度制
    // var cosB = Math.cos(radian), sinB = Math.sin(radian);
    // var Tx = 0.5, Ty = 0.5, Tz = 0.0;
    var Sx = 1.0, Sy = 1.5, Sz = 1.0;
    //注意WebGL中矩阵是列主序的（旋转矩阵）
    // var xformMatrix = new Float32Array([
    //     cosB, sinB, 0.0, 0.0,
    //     -sinB, cosB, 0.0, 0.0,
    //     0.0, 0.0, 1.0, 0.0,
    //     0.0, 0.0, 0.0, 1.0
    // ]);
    //平移矩阵
    // var xformMatrix = new Float32Array([
    //     1.0, 0.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0, 0.0,
    //     0.0, 0.0, 1.0, 0.0,
    //     Tx, Ty, Tz, 1.0
    // ]);
    //缩放矩阵
    // var xformMatrix = new Float32Array([
    //     Sx, 0.0, 0.0, 0.0,
    //     0.0, Sy, 0.0, 0.0,
    //     0.0, 0.0, Sz, 0.0,
    //     0.0, 0.0, 0.0, 1.0
    // ]);
    //使用矩阵变换库
    var xformMatrix = new Matrix4();
    xformMatrix.setRotate(ANGLE, 0, 0, 1);

    //将旋转矩阵传输给顶点着色器
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if(!u_xformMatrix){
        console.log('Failed u_xformMatrix');
        return;
    }
    // gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3;//顶点的数量
    //创建缓冲区
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}