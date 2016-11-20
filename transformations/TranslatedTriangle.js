/**
 * Created by jiangwei on 2016/11/20.
 */
//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform vec4 u_Translation;\n' +
    'void main() {\n'+
    'gl_Position = a_Position + u_Translation;\n'+
    '}\n';
//片元着色器
var FSHADER_SOURCE =
    'void main() {\n' +
        'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
//在x, y, z方向上平移的距离
var Tx = 0.5, Ty = 0.5, Tz = 0.0;

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
    //将平移距离传输给顶点着色器
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
    if (!u_Translation){
        console.log('Failed');
        return;
    }
    gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

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