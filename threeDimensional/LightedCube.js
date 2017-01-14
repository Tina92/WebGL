/**
 * Created by jiangwei on 2017/01/04.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' + //法向量
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +// 光线颜色
    'uniform vec3 u_LightDirection;\n' +// 归一化的世界坐标
    'varying vec4 v_Color;\n' + //varying变量
    'void main() {\n' +
    'gl_Position = u_MvpMatrix * a_Position;\n' +
        //对法向量进行归一化
    'vec3 normal = normalize(vec3(a_Normal));\n' +
        //计算光线方向和法向量的点积
    'float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
        //计算漫反射光的颜色
    'vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n'+
    'v_Color = vec4(diffuse, a_Color.a);\n' + //将数据传给片元着色器
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
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    if(!u_MvpMatrix || !u_LightDirection || !u_LightColor){
        console.log('Failed u_MvpMatrix');
        return;
    }
    //设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    //设置光线方向（世界坐标系下）
    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();//归一化
    gl.uniform3fv(u_LightDirection, lightDirection.elements);
    //设置视点，视线和上方向

    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, n);//绘制左一侧的
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([//顶点坐标
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0,1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);
    var colors = new Float32Array([//颜色
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0

    ]);
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);

    var indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log('Failed buffer');
        return;
    }

    if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;

    if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;

    if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if(a_attribute < 0){
        console.log('Failed attribute');
        return;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    return true;
}