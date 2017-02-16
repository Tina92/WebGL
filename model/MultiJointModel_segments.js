/**
 * Created by jiangwei on 2017/02/16.
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
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();
    mvpMatrix.setPerspective(50, canvas.width / canvas.height, 1, 100);
    mvpMatrix.lookAt(20.0, 10.0, 30.0, 0, 0, 0, 0, 1, 0);
    document.onkeydown = function (ev) {
        keydown(ev, gl, n, mvpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    };
    draw(gl, n, mvpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Angle = 90.0;
var g_joint1Angle = 45.0;
var g_joint2Angle = 0.0;
var g_joint3Angle = 0.0;

var g_baseBuffer = null; //base缓冲区对象
var g_arm1Buffer = null;
var g_arm2Buffer = null;
var g_palmBuffer = null;
var g_fingerBuffer = null;

function keydown(ev, gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
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
        case 90:
            g_joint2Angle = (g_joint2Angle + ANGLE_STEP ) % 360;
            break;
        case  88:
            g_joint2Angle = (g_joint2Angle - ANGLE_STEP ) % 360;
            break;
        case  86:
            if (g_joint3Angle < 60.0)
                g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
            break;
        case 67:
            if (g_joint3Angle > -60.0)
                g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
            break;
        default: return;
    }
    draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
    var vertices_base = new Float32Array([//顶点坐标
        5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0,
        5.0, 2.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0,
        5.0, 2.0, 5.0, 5.0, 2.0, -5.0, -5.0, 2.0, -5.0,-5.0, 2.0, 5.0,
        -5.0, 0.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, -5.0, 0.0, -5.0,
        -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, -5.0, 0.0, -5.0, -5.0, 2.0, -5.0,
        5.0, 0.0, -5.0, -5.0, 0.0, -5.0, -5.0, 2.0, -5.0, 5.0, 2.0, -5.0
    ]);
    var vertices_arm1 = new Float32Array([//顶点坐标
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
        1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
        1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
        -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, -1.5, 0.0, -1.5,
        -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5,
        1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5
    ]);
    var vertices_arm2 = new Float32Array([//顶点坐标
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
        1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
        1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
        -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, -1.5, 0.0, -1.5,
        -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5,
        1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5
    ]);
    var vertices_palm = new Float32Array([//顶点坐标
        1.0, 2.0, 2.5, -1.0, 2.0, 2.5, -1.0, 0.0, 2.5, 1.0, 0.0, 2.5,
        1.0, 2.0, 2.5, 1.0, 0.0, 2.5, 1.0, 0.0, -2.5, 1.0, 2.0, -2.5,
        1.0, 2.0, 2.5, 1.0, 2.0, -2.5, -1.0, 2.0, -2.5, -1.0, 2.0, 2.5,
        -1.0, 0.0, 2.5, 1.0, 0.0, 2.5, 1.0, 0.0, -2.5, -1.0, 0.0, -2.5,
        -1.0, 2.0, 2.5, -1.0, 0.0, 2.5, -1.0, 0.0, -2.5, -1.0, 2.0, -2.5,
        1.0, 0.0, -2.5, -1.0, 0.0, -2.5, -1.0, 2.0, -2.5, 1.0, 2.0, -2.5
    ]);
    var vertices_finger = new Float32Array([//顶点坐标
        0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
        0.5, 2.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5,
        0.5, 2.0, 0.5, 0.5, 2.0, -0.5, -0.5, 2.0, -0.5, -0.5, 2.0, 0.5,
        -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, -0.5,
        -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 2.0, -0.5,
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 2.0, -0.5, 0.5, 2.0, -0.5
    ]);
    var colors = new Float32Array([//颜色
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0

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
    g_baseBuffer = initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
    g_arm1Buffer = initArrayBufferForLaterUse(gl, vertices_arm1, 3, gl.FLOAT);
    g_arm2Buffer = initArrayBufferForLaterUse(gl, vertices_arm2, 3, gl.FLOAT);
    g_palmBuffer = initArrayBufferForLaterUse(gl, vertices_palm, 3, gl.FLOAT);
    g_fingerBuffer = initArrayBufferForLaterUse(gl, vertices_finger, 3, gl.FLOAT);

    var indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log('Failed buffer');
        return;
    }

    // if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;

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
function initArrayBufferForLaterUse(gl, data, num, type) {
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.num = num;
    buffer.type = type;
    return buffer;
}

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制基座
    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    drawSegment(gl, n, g_baseBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    //arm1
    var armlLength = 10.0;
    g_modelMatrix.translate(0.0, baseHeight, 0.0);
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawSegment(gl, n, g_arm1Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    //arm2
    g_modelMatrix.translate(0.0, armlLength, 0.0);
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    g_modelMatrix.scale(1.3, 1.0, 1.3);
    drawSegment(gl, n, g_arm2Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    //apalm
    var palmLength = 2.0;
    g_modelMatrix.translate(0.0, armlLength, 0,0);
    g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
    drawSegment(gl, n, g_palmBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    //finger1
    g_modelMatrix.translate(0.0, palmLength, 2.0);
    g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
    drawSegment(gl, n, g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    //finger2
    g_modelMatrix.translate(0.0, palmLength, -2.0);
    g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
    drawSegment(gl, n, g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}


var g_normalMatrix = new Matrix4();//变换法线的矩阵

function drawSegment(gl, n, buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    g_mvpMatrix.set(viewProjMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}