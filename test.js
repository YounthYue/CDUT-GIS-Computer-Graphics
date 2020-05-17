"use strict";

var canvas;
var gl;

var imageUrl = "miao1.gif";

var NumVertices = 36;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var normalsArray = [];

var texture;

var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta2 = vec3(0, 0, 0);
var theta3 = vec3(0, 0, 0);

const initSpeed = 2.0;
const ds = 1.0;
var speed = initSpeed;

var near = 0.1;
var far = 7.0;
var radius = 4;
var theta = 0.0;
var phi = 0.0;
var d = 30;
var dr = d * Math.PI / 180.0;
var n = 180 / d * 1000;

var fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
var aspect; // Viewport aspect ratio

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var mvMatrix, pMatrix;
var modelView, projection;
var nMatrix, nMatrixLoc;
var thetaLoc;
var rotationMatrixLoc;
var rotationMatrix;

var lRotationMatrixLoc;
var lRotationMatrix;

// 正方体旋转矩阵是否生成标识
var rflag = false;
// 光照旋转矩阵是否生成标识
var lrflag = false;
// 光照light是否旋转标识
var lflag = false;
// 正方体cube旋转标识
var cflag = false;

// 光照模块
var lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
var lightAmbient = vec4(0.9, 0.8, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var vertices = [
    // vec4(-0.5, -0.5,  1.5, 1.0),
    // vec4(-0.5,  0.5,  1.5, 1.0),
    // vec4(0.5,  0.5,  1.5, 1.0),
    // vec4(0.5, -0.5,  1.5, 1.0),

    // vec4(-0.5, -0.5, 0.5, 1.0),
    // vec4(-0.5,  0.5, 0.5, 1.0),
    // vec4(0.5,  0.5, 0.5, 1.0),
    // vec4( 0.5, -0.5, 0.5, 1.0)

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),

    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var vertexColors = [
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0), // white
];

var texCoord = [
    vec2(0, 1),
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 1)
];


function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);


    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);

    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[1]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);

    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);

    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[3]);
    normalsArray.push(normal);
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(0, 4, 7, 3);
    quad(5, 1, 2, 6);
    quad(6, 7, 4, 5);
    quad(5, 4, 0, 1);
}

function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    var image = new Image();
    image.crossOrigin = '';
    // 图片大小有要求，512*512,256*256
    image.src = imageUrl;
    image.onload = function() {
        configureTexture(image);
    }

    // buttons for viewing parameters

    document.getElementById("ButtonFar").onclick = function() {
        if (radius * 1.3 <= 7) {
            radius *= 1.3;
        } else {
            radius = 7;
        }
    };
    document.getElementById("ButtonNear").onclick = function() {
        if (radius * 0.66 >= 1.75) {
            radius *= 0.66;
        } else {
            radius = 1.75;
        }
    };
    document.getElementById("ButtonRightView").onclick = function() { theta += dr;
        n++; };
    document.getElementById("ButtonLeftView").onclick = function() { theta -= dr;
        n--; };
    document.getElementById("ButtonUpView").onclick = function() { phi += dr; };
    document.getElementById("ButtonDownView").onclick = function() { phi -= dr; };
    document.getElementById("ButtonResetView").onclick = function() {
        theta = 0.0;
        phi = 0.0;
        n = 180 / d * 1000;
    };
    document.getElementById("ButtonTurnPic").onclick = function() {
        if (imageUrl == "miao2.gif") {
            image.src = "miao1.gif";
            imageUrl = "miao1.gif";
        } else {
            image.src = "miao2.gif";
            imageUrl = "miao2.gif";
        }
    };
    document.getElementById("ButtonNotTurn").onclick = function() {};
    // 旋转控制
    document.getElementById("ButtonX").onclick = function() {
        axis = xAxis;
        rflag = true;
        cflag = true;
        gl.uniform1f(gl.getUniformLocation(program, "cflag"), cflag);
    };
    document.getElementById("ButtonY").onclick = function() {
        axis = yAxis;
        rflag = true;
        cflag = true;
        gl.uniform1f(gl.getUniformLocation(program, "cflag"), cflag);
    };
    document.getElementById("ButtonZ").onclick = function() {
        axis = zAxis;
        rflag = true;
        cflag = true;
        gl.uniform1f(gl.getUniformLocation(program, "cflag"), cflag);
    };
    document.getElementById("ButtonQuickRotate").onclick = function() {
        if (speed + ds <= initSpeed + 3 * ds) {
            speed += ds;
        }
    };
    document.getElementById("ButtonSlowRotate").onclick = function() {
        if (speed - ds >= initSpeed - 3 * ds && speed - ds > 0) {
            speed -= ds;
        }
    };
    document.getElementById("ButtonResetSpeed").onclick = function() {
        speed = initSpeed;
    };

    document.getElementById("ButtonStopRotateCube").onclick = function() {
        rflag = false;
    };
    document.getElementById("ButtonResetCube").onclick = function() {
        theta2 = vec3(0, 0, 0);
    };

    document.getElementById("ButtonOnLight").onclick = function() {
        lightPosition = vec4(-1.0, -1.0, -1.0, 0.0);
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    };
    document.getElementById("ButtonOffLight").onclick = function() {
        lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    };

    document.getElementById("ButtonOnRotateLight").onclick = function() {
        lrflag = true;
        lflag = true;
        gl.uniform1f(gl.getUniformLocation(program, "lFlag"), lflag);
    };
    document.getElementById("ButtonOffRotateLight").onclick = function() {
        lrflag = true;
        lflag = false;
        gl.uniform1f(gl.getUniformLocation(program, "lFlag"), lflag);
    };

    modelView = gl.getUniformLocation(program, "modelView");
    projection = gl.getUniformLocation(program, "projection");
    rotationMatrixLoc = gl.getUniformLocation(program, "rotationMatrix")
    lRotationMatrixLoc = gl.getUniformLocation(program, "lRotationMatrix");

    // 光照模块
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    render();
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (rflag) theta2[axis] += speed;
    if (lrflag) theta3[0] += 2.0;

    rotationMatrix = mat4();
    rotationMatrix = mult(rotationMatrix, rotate(theta2[xAxis], vec3(1, 0, 0)));
    rotationMatrix = mult(rotationMatrix, rotate(theta2[yAxis], vec3(0, 1, 0)));
    rotationMatrix = mult(rotationMatrix, rotate(theta2[zAxis], vec3(0, 0, 1)));

    lRotationMatrix = mat4();
    lRotationMatrix = mult(lRotationMatrix, rotate(theta3[xAxis], vec3(1, 0, 0)));
    lRotationMatrix = mult(lRotationMatrix, rotate(theta3[yAxis], vec3(0, 1, 0)));
    lRotationMatrix = mult(lRotationMatrix, rotate(theta3[zAxis], vec3(0, 0, 1)));

    if (n % (180 / d) != 0) {
        eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta));
    } else {
        eye = vec3(0, radius * Math.sin(phi), radius * Math.cos(phi));
    }
    // 视点
    mvMatrix = lookAt(eye, at, up);
    // 视见体
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelView, false, mvMatrix);
    gl.uniformMatrix4fv(projection, false, pMatrix);
    gl.uniformMatrix4fv(rotationMatrixLoc, false, rotationMatrix);
    gl.uniformMatrix4fv(lRotationMatrixLoc, false, lRotationMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    window.requestAnimFrame(render);
}