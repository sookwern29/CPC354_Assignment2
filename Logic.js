/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix, nMatrix;

// Variables referencing HTML elements
var sliderAmbient, sliderDiffuse, sliderSpecular, sliderShininess;
var sliderLightX, sliderLightY, sliderLightZ;
var textAmbient, textDiffuse, textSpecular, textShininess;
var textLightX, textLightY, textLightZ;
var startBtn;

// Rotation variables for each object
var teacupTheta = [0, 0, 0], torusTheta = [0, 0, 0], plateTheta = [0, 0, 0];
var animFrame = 0, animFlag = false;

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

var eye = vec3(0.0, 0.0, 4.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// Variables for the objects
var teacupObj, torusObj, plateObj;
var teacupPoints = [], teacupNormals = [];
var torusPoints = [], torusNormals = [];
var platePoints = [], plateNormals = [];
var teacupV, torusV, plateV, totalV;

// Add these variables at the top with other global variables
let isFlat = false; // Track shading type
var isLightOn = true;
var isPointLight = true; // Track light type
var spotLightDirection = vec4(0.0, -1.0, 0.0, 0.0); // Direction for spot light
var spotLightCutoff = Math.cos(radians(30.0)); // 30-degree cutoff angle
var savedLightValues = {
    ambient: 0.5,
    diffuse: 0.5,
    specular: 0.5
};
var activeRotationAxis = 'z'; // Default to Z-axis rotation

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init()
{
    // Create the objects
    teacupObj = teacup(36, 20);
    teacupObj.Scale(0.12, 0.12, 0.12);
    teacupPoints = teacupObj.Point;
    teacupNormals = teacupObj.Normal;
    teacupV = teacupPoints.length;

    torusObj = torus(0.5, 0.2, 32, 24);
    torusObj.Scale(0.08, 0.08, 0.08);
    torusPoints = torusObj.Point;
    torusNormals = torusObj.Normal;
    torusV = torusPoints.length;

    plateObj = plate(1.2, 0.8, 0.5, 36);
    plateObj.Scale(0.2, 0.08, 0.2);
    platePoints = plateObj.Point;
    plateNormals = plateObj.Normal;
    plateV = platePoints.length;

    totalV = teacupV + torusV + plateV;

    // WebGL setups
    getUIElement();
    configWebGL();
    render();

    // Add this in your init() function or where you set up event listeners
    document.getElementById('flat-shading').addEventListener('click', function() {
        isFlat = true;
        this.classList.add('active');
        document.getElementById('smooth-shading').classList.remove('active');
        // Recompute normals for flat shading
        recomputeNormals();
    });

    document.getElementById('smooth-shading').addEventListener('click', function() {
        isFlat = false;
        this.classList.add('active');
        document.getElementById('flat-shading').classList.remove('active');
        // Recompute normals for smooth shading
        recomputeNormals();
    });

    document.getElementById('rotate-x').addEventListener('click', function() {
        setActiveRotation('x');
    });

    document.getElementById('rotate-y').addEventListener('click', function() {
        setActiveRotation('y');
    });

    document.getElementById('rotate-z').addEventListener('click', function() {
        setActiveRotation('z');
    });

    // Add light type toggle event listeners
    document.getElementById('point-light').addEventListener('click', function() {
        isPointLight = true;
        this.classList.add('active');
        document.getElementById('spot-light').classList.remove('active');
        recompute();
    });

    document.getElementById('spot-light').addEventListener('click', function() {
        isPointLight = false;
        this.classList.add('active');
        document.getElementById('point-light').classList.remove('active');
        recompute();
    });
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement()
{
    canvas = document.getElementById("gl-canvas");
    sliderAmbient = document.getElementById("slider-ambient");
    sliderDiffuse = document.getElementById("slider-diffuse");
    sliderSpecular = document.getElementById("slider-specular");
    sliderShininess = document.getElementById("slider-shininess");
    sliderLightX = document.getElementById("slider-light-x");
    sliderLightY = document.getElementById("slider-light-y");
    sliderLightZ = document.getElementById("slider-light-z");
    textAmbient = document.getElementById("text-ambient");
    textDiffuse = document.getElementById("text-diffuse");
    textSpecular = document.getElementById("text-specular");
    textShininess = document.getElementById("text-shininess");
    textLightX = document.getElementById("text-light-x");
    textLightY = document.getElementById("text-light-y");
    textLightZ = document.getElementById("text-light-z");
    startBtn = document.getElementById("start-btn");

    sliderAmbient.onchange = function(event) 
	{
		ambient = event.target.value;
		textAmbient.innerHTML = ambient;
        lightAmbient = vec4(ambient, ambient, ambient, 1.0);
        recompute();
    };

    sliderDiffuse.onchange = function(event) 
	{
		diffuse = event.target.value;
		textDiffuse.innerHTML = diffuse;
        lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
        recompute();
    };

    sliderSpecular.onchange = function(event) 
	{
		specular = event.target.value;
		textSpecular.innerHTML = specular;
        lightSpecular = vec4(specular, specular, specular, 1.0);
        recompute();
    };

    sliderShininess.onchange = function(event) 
	{
		shininess = event.target.value;
		textShininess.innerHTML = shininess;
        recompute();
    };

    sliderLightX.onchange = function(event) 
	{
		lightPos[0] = event.target.value;
		textLightX.innerHTML = lightPos[0].toFixed(1);
        recompute();
    };

    sliderLightY.onchange = function(event) 
	{
		lightPos[1] = event.target.value;
		textLightY.innerHTML = lightPos[1].toFixed(1);
        recompute();
    };

    sliderLightZ.onchange = function(event) 
	{
		lightPos[2] = event.target.value;
		textLightZ.innerHTML = lightPos[2].toFixed(1);
        recompute();
    };

    startBtn.onclick = function()
	{
		animFlag = !animFlag;

        if(animFlag) animUpdate();
        else window.cancelAnimationFrame(animFrame);
	};

    document.getElementById('light-on').addEventListener('click', function() {
        isLightOn = true;
        this.classList.add('active');
        document.getElementById('light-off').classList.remove('active');
        
        // Restore saved light values
        ambient = savedLightValues.ambient;
        diffuse = savedLightValues.diffuse;
        specular = savedLightValues.specular;
        
        // Update UI
        sliderAmbient.value = ambient;
        sliderDiffuse.value = diffuse;
        sliderSpecular.value = specular;
        textAmbient.innerHTML = ambient;
        textDiffuse.innerHTML = diffuse;
        textSpecular.innerHTML = specular;
        
        // Update light values
        lightAmbient = vec4(ambient, ambient, ambient, 1.0);
        lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
        lightSpecular = vec4(specular, specular, specular, 1.0);
        
        recompute();
    });

    document.getElementById('light-off').addEventListener('click', function() {
        isLightOn = false;
        this.classList.add('active');
        document.getElementById('light-on').classList.remove('active');
        
        // Save current light values
        savedLightValues.ambient = ambient;
        savedLightValues.diffuse = diffuse;
        savedLightValues.specular = specular;
        
        // Set all light values to 0
        ambient = 0;
        diffuse = 0;
        specular = 0;
        
        // Update UI
        sliderAmbient.value = 0;
        sliderDiffuse.value = 0;
        sliderSpecular.value = 0;
        textAmbient.innerHTML = "0";
        textDiffuse.innerHTML = "0";
        textSpecular.innerHTML = "0";
        
        // Update light values
        lightAmbient = vec4(0, 0, 0, 1.0);
        lightDiffuse = vec4(0, 0, 0, 1.0);
        lightSpecular = vec4(0, 0, 0, 1.0);
        
        recompute();
    });
}

// Configure WebGL Settings
function configWebGL()
{
    // Initialize the WebGL context
    canvas = document.getElementById("gl-canvas");
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

    // Combine all points and normals
    var points = teacupPoints.concat(torusPoints, platePoints);
    var normals = teacupNormals.concat(torusNormals, plateNormals);

    // Create buffers and link them to the corresponding attribute variables in vertex and fragment shaders
    // Buffer for positions
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Buffer for normals
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Get the location of the uniform variables within a compiled shader program
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    // Add these lines after getting other uniform locations
    gl.uniform1i(gl.getUniformLocation(program, "uIsPointLight"), isPointLight);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotLightDirection"), flatten(spotLightDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uSpotLightCutoff"), spotLightCutoff);
}

// Render the graphics for viewing
function render()
{
    // Cancel the animation frame before performing any graphic rendering
    if(animFlag)
    {
        animFlag = false;
        window.cancelAnimationFrame(animFrame);
    }
    
    // Clear the color buffer and the depth buffer before rendering a new frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Updated projection matrix with larger viewing volume
    projectionMatrix = ortho(-3, 3, -2, 2, -10, 10);
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

    // Add these lines before drawing
    gl.uniform1i(gl.getUniformLocation(program, "uIsPointLight"), isPointLight);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotLightDirection"), flatten(spotLightDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uSpotLightCutoff"), spotLightCutoff);

    drawTeacup();
    drawTorus();
    drawPlate();
}

// Draw the teacup
function drawTeacup()
{
    modelViewMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(modelViewMatrix, translate(1.2, 0.3, -0.5));
    modelViewMatrix = mult(modelViewMatrix, rotateX(10+teacupTheta[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(teacupTheta[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(teacupTheta[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, teacupV);
}

// Draw the torus
function drawTorus()
{
    modelViewMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.2, -0.05, 0.1));
    modelViewMatrix = mult(modelViewMatrix, rotateX(105 + torusTheta[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(torusTheta[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(torusTheta[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    gl.drawArrays(gl.TRIANGLES, teacupV, torusV);
}

// Draw the plate
function drawPlate()
{
    modelViewMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.2, -0.25, 0));
    modelViewMatrix = mult(modelViewMatrix, rotateX(15 +plateTheta[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(plateTheta[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(plateTheta[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    gl.drawArrays(gl.TRIANGLES, teacupV + torusV, plateV);
}

// Recompute points and colors, followed by reconfiguring WebGL for rendering
function recompute()
{
    // Create the objects
    teacupObj = teacup(36, 20);
    teacupObj.Scale(0.12, 0.12, 0.12);
    teacupPoints = teacupObj.Point;
    teacupNormals = teacupObj.Normal;
    teacupV = teacupPoints.length;

    torusObj = torus(0.5, 0.2, 32, 24);
    torusObj.Scale(0.08, 0.08, 0.08);
    torusPoints = torusObj.Point;
    torusNormals = torusObj.Normal;
    torusV = torusPoints.length;

    plateObj = plate(1.2, 0.8, 0.5, 36);
    plateObj.Scale(0.2, 0.08, 0.2);
    platePoints = plateObj.Point;
    plateNormals = plateObj.Normal;
    plateV = platePoints.length;

    totalV = teacupV + torusV + plateV;

    // Combine all points and normals
    var points = teacupPoints.concat(torusPoints, platePoints);
    var normals = teacupNormals.concat(torusNormals, plateNormals);

    // Update buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    render();
}

// Update the animation frame
function animUpdate()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update rotation based on active axis
    switch(activeRotationAxis) {
        case 'x':
            teacupTheta[0] -= 1;
            torusTheta[0] -= 1;
            plateTheta[0] -= 1;
            break;
        case 'y':
            teacupTheta[1] -= 1;
            torusTheta[1] -= 1;
            plateTheta[1] -= 1;
            break;
        case 'z':
            teacupTheta[2] -= 1;
            torusTheta[2] -= 1;
            plateTheta[2] -= 1;
            break;
    }

    drawTeacup();
    drawTorus();
    drawPlate();

    animFrame = window.requestAnimationFrame(animUpdate);
}

// Add this function to compute flat shading normals
function computeFlatNormals(points) {
    let normals = [];
    // Process triangles (every 3 points)
    for(let i = 0; i < points.length; i += 9) {
        // Get three points of the triangle
        let p1 = vec3(points[i], points[i+1], points[i+2]);
        let p2 = vec3(points[i+3], points[i+4], points[i+5]);
        let p3 = vec3(points[i+6], points[i+7], points[i+8]);
        
        // Compute the normal for this triangle
        let v1 = subtract(p2, p1);
        let v2 = subtract(p3, p1);
        let normal = normalize(cross(v1, v2));
        
        // Use the same normal for all three vertices
        for(let j = 0; j < 3; j++) {
            normals.push(normal[0], normal[1], normal[2]);
        }
    }
    return normals;
}

// Modify your recomputeNormals function to handle both shading types
function recomputeNormals() {
    // Clear existing points and normals
    points = [];
    normals = [];
    
    // Get points from your geometry functions
    let teacupPoints = teacup();
    let torusPoints = torus();
    let platePoints = plate();
    
    // Combine all points
    points = points.concat(teacupPoints, torusPoints, platePoints);
    
    if(isFlat) {
        // Compute flat shading normals
        normals = computeFlatNormals(points);
    } else {
        // Your existing smooth shading normal computation
        // This should be your current normal calculation code
        for(let i = 0; i < points.length; i += 3) {
            let p = vec3(points[i], points[i+1], points[i+2]);
            let n = normalize(p);
            normals.push(n[0], n[1], n[2]);
        }
    }
    
    // Update the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

// Add this function to handle rotation axis changes
function setActiveRotation(axis) {
    activeRotationAxis = axis;
    
    // Remove active class from all circles
    document.getElementById('rotate-x').classList.remove('active');
    document.getElementById('rotate-y').classList.remove('active');
    document.getElementById('rotate-z').classList.remove('active');
    
    // Add active class to selected circle
    document.getElementById('rotate-' + axis).classList.add('active');
}

/*-----------------------------------------------------------------------------------*/