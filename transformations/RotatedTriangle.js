/**
 * Created by jiangwei on 2016/11/20.
 */
//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform float u_CosB, u_SinB;\n' +
    'void main() {\n'+
    'gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n'+
    'gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n'+
    'gl_Position.z = a_Position.z;\n'+
    'gl_Position.w = 1.0;\n' +
    '}\n';
//片元着色器
var FSHADER_SOURCE =
    'void main() {\n' +
    'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
//旋转角度
var ANGLE = 90.0;

function main() {
    var canvas = document.getElementById('example');//获取canvas元素
    var gl = getWebGLContext(canvas);//获取WebGL上下文
    if (!gl){
        console.log('Failed');
        return;
    }
    //初始化着色器
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed');
        return;
    }
    //设置点的位置
    var n = initVertexBuffers(gl);
    if( n < 0 ) {
        console.log('Failed');
        return;
    }
    //将旋转徒刑所需的数据传输给顶点着色器
    var radian = Math.PI * ANGLE / 180.0; //转化为弧度制
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
    var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
    gl.uniform1f(u_SinB, sinB);
    gl.uniform1f(u_CosB, cosB);
    //设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //绘制三角形
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