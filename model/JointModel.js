/**
 * Created by jiangwei on 2017/02/09.
 */
//VSHADER
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' + //法向量
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' + //模型矩阵
    'uniform mat4 u_NormalMatrix;\n' + // 用来变换法向量的矩阵
    'varying vec4 v_Color;\n' + //varying变量
    'varying vec3 v_Position;\n' + //varying变量
    'varying vec3 v_Normal;\n' + //varying变量
    'void main() {\n' +
    'gl_Position = u_MvpMatrix * a_Position;\n' +
    'v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    'v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    'v_Color = a_Color;\n' +
    '}\n';
//FSHADER
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec3 u_LightColor;\n' +// 光线颜色
    'uniform vec3 u_LightPosition;\n' +// 光源位置
    'uniform vec3 u_AmbientLight;\n' + //环境光
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_Normal;\n' +
    'void main() {\n'+
    'vec3 normal = normalize(v_Normal);\n' +
    'vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    'float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    'vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n'+
    'vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
    ' gl_FragColor = vec4(diffuse+ ambient, v_Color.a);\n'+ //设置颜色
    '}\n';
function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed gl');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed init');
        return;
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed n');
        return;
    }
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    // var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_MvpMatrix || !u_LightColor || !u_AmbientLight || !u_NormalMatrix) {
        console.log('Failed u_MvpMatrix');
        return;
    }
    //设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 0.0, 0.0);
    gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
    //设置光线方向（世界坐标系下）
    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();//归一化
    // gl.uniform3fv(u_LightDirection, lightDirection.elements);
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
    //设置视点，视线和上方向

    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();
    mvpMatrix.setPerspective(50, canvas.width / canvas.height, 1, 100);
    mvpMatrix.lookAt(20.0, 10.0, 30.0, 0, 0, 0, 0, 1, 0);
    document.onkeydown = function (ev) {
        keydown(ev, gl, n, mvpMatrix, u_MvpMatrix, u_NormalMatrix);
    };
    draw(gl, n, mvpMatrix, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Angle = 90.0;
var g_joint1Angle = 0.0;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    switch (ev.keyCode){
        case 38:
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 40:
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 39:
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37:
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        default: return;
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
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

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    var armlLength = 10.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    g_modelMatrix.translate(0.0, armlLength, 0.0);
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    g_modelMatrix.scale(1.5, 1.0, 1.5);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var g_normalMatrix = new Matrix4();
function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}