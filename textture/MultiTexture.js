/**
 * Created by jiangwei on 2016/12/7.
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   v_TexCoord = a_TexCoord;\n' +
    '}\n';
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
    '   vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
    '   gl_FragColor = color0 * color1;\n' +
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
    //设置顶点信息
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('Failed n');
        return;
    }
    //配置纹理
    if(!initTextures(gl, n)){
        console.log('Failed Textures');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        //顶点坐标，纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0,
    ]);
    var n = 4; //顶点数目
    var vertexTexCoordBuffer = gl.createBuffer();
    if(!vertexTexCoordBuffer){
        console.log('Failed buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if (a_Position<0){
        console.log('Failed a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);
    //将纹理坐标分配给a_TexCoord并开启它
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if(a_TexCoord<0){
        console.log('Failed a_TexCoord');
        return;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}
function initTextures(gl, n) {
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    if(!texture0 || !texture1){
        console.log("Failed texture");
        return;
    }
    var u_Sampler0 = gl.getUniformLocation(gl.program,'u_Sampler0');//获取u_Sampler的存储位置
    var u_Sampler1 = gl.getUniformLocation(gl.program,'u_Sampler1');//获取u_Sampler的存储位置
    if(u_Sampler0 < 0 || u_Sampler1 < 0 ){
        console.log('Failed u_Sampler');
        return;
    }
    var image0 = new Image(); //创建纹理对象
    var image1 = new Image(); //创建纹理对象
    if(!image0 || !image1){
        console.log('Failede image');
        return;
    }
    image0.onload = function () {
        loadTexture(gl, n, texture0, u_Sampler0, image0, 0);
    };//注册图像加载事件的响应函数
    image1.onload = function () {
        loadTexture(gl, n, texture1, u_Sampler1, image1, 1);
    };//注册图像加载事件的响应函数
    //浏览器开始加载图像
    image0.src='screenshot.png';
    image1.src='front.jpg';

    return true;

}
var g_texUnit0 = false; g_texUnit1 = false;

function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //对纹理图像进行Y轴反转
    //开启0号纹理单元
    if (texUnit == 0){
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    }else {
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }
    //向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    //将0号纹理传递给着色器
    gl.uniform1i(u_Sampler, texUnit);
    if(u_Sampler){
        console.log('Failed u_Sampler');
        return;
    }
    //绘制矩形
    if (g_texUnit0 && g_texUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }

}