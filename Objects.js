/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix, nMatrix;

// Variables referencing HTML elements
// theta = [x, y, z]
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
var teacupX, teacupY, teacupZ, teacupAxis = X_AXIS, teacupBtn;
var torusX, torusY, torusZ, torusAxis = X_AXIS, torusBtn;
var plateX, plateY, plateZ, plateAxis = X_AXIS, plateBtn;
var teacupObj, torusObj, plateObj, teacupFlag = false, torusFlag = false, plateFlag = false;
var teacupTheta = [0,0,0], torusTheta = [0, 0, 0], plateTheta = [0, 0, 0], animFrame = 0;
var pointsArray = [], normalsArray = [], teacupV, torusV, plateV, totalV;

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var ambient = 0.5, diffuse = 0.5, specular = 0.5, shininess = 60;
var lightPos = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(ambient, ambient, ambient, 1.0);
var lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
var lightSpecular = vec4(specular, specular, specular, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init()
{
    // Primitive (geometric shape) initialization
    // Shape 1 = Cylinder, Shape 2 = Torus
    teacupObj = teacup(36, 20);
    teacupObj.Rotate(45, [1, 1, 0]);
    teacupObj.Scale(1.2, 1.2, 1.2);
    concatData(teacupObj.Point, teacupObj.Normal);

    torusObj = torus(0.5, 0.2, 32, 24);
    torusObj.Rotate(45, [1, 1, 0]);
    torusObj.Scale(1, 1, 1);
    concatData(torusObj.Point, torusObj.Normal);

    plateObj = plate(1.2, 0.8, 0.5, 36);
    plateObj.Scale(1.5, 1.0, 1.5);  // Make it slightly oval
    plateObj.Translate(0, -1.0, 0);  // Move it down slightly
    concatData(plateObj.Point, plateObj.Normal);
    
    teacupV = teacupObj.Point.length;
    torusV = torusObj.Point.length;
    plateV = plateObj.Point.length;
	totalV = teacupV + torusV + plateV;

    // WebGL setups
    getUIElement();
    configWebGL();
    render();
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement()
{
    canvas = document.getElementById("gl-canvas");

    teacupX = document.getElementById("teacup-x");
    teacupY = document.getElementById("teacup-y");
    teacupZ = document.getElementById("teacup-z");
    teacupBtn = document.getElementById("teacup-btn");

    torusX = document.getElementById("torus-x");
    torusY = document.getElementById("torus-y");
    torusZ = document.getElementById("torus-z");
    torusBtn = document.getElementById("torus-btn");

    plateX = document.getElementById("plate-x");
    plateY = document.getElementById("plate-y");
    plateZ = document.getElementById("plate-z");
    plateBtn = document.getElementById("plate-btn");

    teacupX.onchange = function() 
	{
		if(teacupX.checked) teacupAxis = X_AXIS;
    };

    teacupY.onchange = function() 
	{
		if(teacupY.checked) teacupAxis = Y_AXIS;
    };

    teacupZ.onchange = function() 
	{
		if(teacupZ.checked) teacupAxis = Z_AXIS;
    };

    teacupBtn.onclick = function()
	{
		teacupFlag = !teacupFlag;
	};

    torusX.onchange = function() 
	{
		if(torusX.checked) torusAxis = X_AXIS;
    };

    torusY.onchange = function() 
	{
		if(torusY.checked) torusAxis = Y_AXIS;
    };

    torusZ.onchange = function() 
	{
		if(torusZ.checked) torusAxis = Z_AXIS;
    };

    torusBtn.onclick = function()
	{
		torusFlag = !torusFlag;
	    };

    plateX.onchange = function() 
	{
		if(plateX.checked) plateAxis = X_AXIS;
    };

    plateY.onchange = function() 
	{
		if(plateY.checked) plateAxis = Y_AXIS;
    };

    plateZ.onchange = function() 
	{
		if(plateZ.checked) plateAxis = Z_AXIS;
    };  

    plateBtn.onclick = function()
	{
		plateFlag = !plateFlag;
	};  
}

// Configure WebGL Settings
function configWebGL()
{
    // Initialize the WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    
    if(!gl)
    {
        alert("WebGL isn't available");
    }

    // Set the viewport and clear the color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    // Compile the vertex and fragment shaders and link to WebGL
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create buffers and link them to the corresponding attribute variables in vertex and fragment shaders
    // Buffer for positions
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Buffer for normals
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Get the location of the uniform variables within a compiled shader program
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
}

// Render the graphics for viewing
function render()
{
    // Cancel the animation frame before performing any graphic rendering
    if(teacupFlag || torusFlag || plateFlag)
    {
        teacupFlag = false;
        torusFlag = false;
        plateFlag = false;
        window.cancelAnimationFrame(animFrame);
    }

    // Clear the color buffer and the depth buffer before rendering a new frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass the projection matrix from JavaScript to the GPU for use in shader
    // ortho(left, right, bottom, top, near, far)
    projectionMatrix = ortho(-4, 4, -2.25, 2.25, -5, 5);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Compute the ambient, diffuse, and specular values
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);

    animUpdate();
}

// Update the animation frame
function animUpdate()
{
    // Clear the color buffer and the depth buffer before rendering a new frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawTeacup();
    drawTorus();
    drawPlate();

    // Schedule the next frame for a looped animation (60fps)
    animFrame = window.requestAnimationFrame(animUpdate);
}

// Draw the first shape (cylinder)
function drawTeacup()
{
    // Increment the rotation value if the animation is enabled
    if(teacupFlag)
    {
        teacupTheta[teacupAxis] += 1;
    }

    // Pass the model view matrix from JavaScript to the GPU for use in shader
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(-1.5, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(teacupTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(teacupTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(teacupTheta[Z_AXIS], [0, 0, 1]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Pass the normal matrix from JavaScript to the GPU for use in shader
    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    // Draw the primitive from index 0 to the last index of shape 1
    gl.drawArrays(gl.TRIANGLES, 0, teacupV);
}

// Draw the second shape (torus)
function drawTorus()
{
    if(torusFlag)
    {
        torusTheta[torusAxis] += 1;
    }

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(torusTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(torusTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(torusTheta[Z_AXIS], [0, 0, 1]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    gl.drawArrays(gl.TRIANGLES, teacupV, torusV);
}

// Concatenate the corresponding shape's values
function concatData(point, normal) {
    for(var i = 0; i < point.length; i++) {
        pointsArray.push(point[i]);
        normalsArray.push(normal[i]);
    }
}

// Draw the third shape (plate)
function drawPlate() {
    // Increment the rotation value if the animation is enabled
    if(plateFlag) {
        plateTheta[plateAxis] += 1;
    }

    // Pass the model view matrix from JavaScript to the GPU for use in shader
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(2.5, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(plateTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(plateTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(plateTheta[Z_AXIS], [0, 0, 1]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Pass the normal matrix from JavaScript to the GPU for use in shader
    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    // Draw the primitive from the last vertex of shape 2 to the last vertex
    gl.drawArrays(gl.TRIANGLES, teacupV + torusV, plateV);
}


/*-----------------------------------------------------------------------------------*/