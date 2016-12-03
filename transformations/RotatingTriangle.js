/**
 * Created by jiangwei on 2016/11/27.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'void main() {\n' +
    'gl_Position = u_ModelMatrix * a_Position;\n' +
    '}\n';
//FSHADER
var FSHADER_SOURCE =
    'void main() {\n' +
    'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
var ANGLE_STEP = 45.0;//旋转速度
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //将模型矩阵传输给顶点着色器
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed u_ModelMatrix');
        return;
    }
    //创建Matrix4对象进行模型转化
    var modelMatrix = new Matrix4();

    //计算模型矩阵
    var currentAngle = 0.0;//当前旋转角度
    var tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
        requestAnimationFrame(tick);//请求浏览器调用tick
    }
    tick();

    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.3, -0.3, -0.3, 0.3, -0.3
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
function draw(gl, n, currentAngle, modelMatrix, u_MOdelMatrix) {
    //设置旋转矩阵
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    modelMatrix.translate(0.35, 0, 0);
    gl.uniformMatrix4fv( u_MOdelMatrix, false, modelMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
var g_last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed)/1000.0;
    return newAngle %= 360;
}