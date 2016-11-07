/**
 * Created by jiangwei on 2016/11/6.
 */
//顶点着色器程序
var VSHADER_SOURCE =
    'attribute vec4 a_Position; \n'+
    'void main() {\n'+
    'gl_Position = a_Position;\n'+ //设置坐标
    'gl_PointSize = 10.0;\n' +  //设置尺寸
    '}\n';

//片元着色器
var FSHADER_SOURCE =
    'void main() {\n'+
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+ //设置颜色
    '}\n';

function main() {
//    获取<canvas>元素
    var canvas =document.getElementById('webgl');
//    获取WEBGL绘图上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WEBGL');
        return;
    }
    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }
//获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
//    注册鼠标点击事件响应函数
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position);
    };

//设置<canvas>的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

//清空<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = []; //鼠标点击位置数组
function click( ev, gl, canvas, a_Position ) {
    var x = ev.clientX; //鼠标点击处的x坐标
    var y = ev.clientY; //鼠标点击处的y坐标
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y -rect.top))/(canvas.width/2);
//    将坐标储存到g_points数组中
//     g_points.push(x); g_points.push(y);
    g_points.push([x, y]);
//    清除<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_points.length;
    for (var i = 0; i < len; i++) {
        var xy = g_points[i];
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);
        //    绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }

}

