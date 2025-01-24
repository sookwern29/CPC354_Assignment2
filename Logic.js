/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix, nMatrix;

// Variables referencing HTML elements
var sliderLightX, sliderLightY, sliderLightZ;
var textLightX, textLightY, textLightZ;
var startBtn;

// Rotation variables for each object
var teacupTheta = [0, 0, 0], torusTheta = [0, 0, 0], plateTheta = [0, 0, 0];
var animFrame = 0, animFlag = false;

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var lightPos = vec4(1.0, 1.0, 1.0, 0.0); //For Point Light
var lightAmbient = vec4(139/255, 67/255, 67/255, 1.0);
var lightDiffuse = vec4(184/255, 112/255, 112/255, 1.0);
var lightSpecular = vec4(128/255, 128/255, 0.0, 1.0);

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
var spotlightPosition = vec4(1.0, 7.0, 0.0, 1.0);
var spotLightDirection = vec4(0.0, -1.0, 0.0, 1.0); // Direction for spot light
let spotLightCutoff = 30.0; // 30-degree cutoff angle
var savedLightValues = {
    ambient: 0.5,
    diffuse: 0.5,
    specular: 0.5
};
var activeRotationAxis = 'z'; // Default to Z-axis rotation
var selectedObject = 'teacup'; // Default selected object

// Material properties for each object
var materials = {
    teacup: {
        ambient: vec4(0.5, 0.5, 1.0, 1.0),
        diffuse: vec4(0.0, 0.9, 1.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 20
    },
    torus: {
        ambient: vec4(0.3, 0.6, 1.0, 1.0),
        diffuse: vec4(0.3, 0.6, 1.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 20
    },
    plate: {
        ambient: vec4(0.4, 0.7, 1.0, 1.0),
        diffuse: vec4(0.4, 0.7, 1.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 20
    }
};

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

    // Add these event listeners
    document.getElementById('slider-spotlight-cutoff').onchange = function(event) {
        spotLightCutoff = parseFloat(event.target.value);
        document.getElementById('text-spotlight-cutoff').innerHTML = spotLightCutoff.toFixed(2);
        recompute();
    };

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

    //Spotlight Position
    document.getElementById('slider-spotlight-x').onchange = function(event) {
        spotlightPosition[0] = event.target.value;
        document.getElementById('text-spotlight-x').innerHTML = spotlightPosition[0];
        recompute();
    };
    
    document.getElementById('slider-spotlight-y').onchange = function(event) {
        spotlightPosition[1] = event.target.value;
        document.getElementById('text-spotlight-y').innerHTML = spotlightPosition[1];
        recompute();
    };
    
    document.getElementById('slider-spotlight-z').onchange = function(event) {
        spotlightPosition[2] = event.target.value;
        document.getElementById('text-spotlight-z').innerHTML = spotlightPosition[2];
        recompute();
    };

    //Spotlight Direction
    document.getElementById('slider-spotlight-dir-x').onchange = function(event) {
        spotLightDirection[0] = event.target.value;
        document.getElementById('text-spotlight-dir-x').innerHTML = spotLightDirection[0].toFixed(1);
        recompute();
    };
    
    document.getElementById('slider-spotlight-dir-y').onchange = function(event) {
        spotLightDirection[1] = event.target.value;
        document.getElementById('text-spotlight-dir-y').innerHTML = spotLightDirection[1].toFixed(1);
        recompute();
    };
    
    document.getElementById('slider-spotlight-dir-z').onchange = function(event) {
        spotLightDirection[2] = event.target.value;
        document.getElementById('text-spotlight-dir-z').innerHTML = spotLightDirection[2].toFixed(1);
        recompute();
    };

    // Add light type toggle event listeners
    document.getElementById('point-light').addEventListener('click', function() {
        isPointLight = true;
        document.querySelector('.spotlight-controls').style.display = 'none';
        document.querySelector('.pointlight-controls').style.display = 'block';
        this.classList.add('active');
        document.getElementById('spot-light').classList.remove('active');
        recompute();
    });

    document.getElementById('spot-light').addEventListener('click', function() {
        isPointLight = false;
        document.querySelector('.spotlight-controls').style.display = 'block';
        document.querySelector('.pointlight-controls').style.display = 'none';
        this.classList.add('active');
        document.getElementById('point-light').classList.remove('active');
        recompute();
    });

    // Background customization
    document.getElementById('color-bg').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('image-bg').classList.remove('active');
        document.getElementById('color-bg-section').style.display = 'flex';
        document.getElementById('image-bg-section').style.display = 'none';
    });
    
    document.getElementById('image-bg').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('color-bg').classList.remove('active');
        document.getElementById('color-bg-section').style.display = 'none';
        document.getElementById('image-bg-section').style.display = 'flex';
    });

    // Add object selection event listeners
    document.getElementById('teacup-select').addEventListener('click', function() {
        selectObject('teacup');
    });
    document.getElementById('torus-select').addEventListener('click', function() {
        selectObject('torus');
    });
    document.getElementById('plate-select').addEventListener('click', function() {
        selectObject('plate');
    });
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement()
{
    canvas = document.getElementById("gl-canvas");
    sliderLightX = document.getElementById("slider-light-x");
    sliderLightY = document.getElementById("slider-light-y");
    sliderLightZ = document.getElementById("slider-light-z");
    textLightX = document.getElementById("text-light-x");
    textLightY = document.getElementById("text-light-y");
    textLightZ = document.getElementById("text-light-z");
    startBtn = document.getElementById("start-btn");

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
        lightAmbient = vec4(139/255, 67/255, 67/255, 1.0);
        lightDiffuse = vec4(184/255, 112/255, 112/255, 1.0);
        lightSpecular = vec4(128/255, 128/255, 0.0, 1.0);
        
        recompute();
    });

    document.getElementById('light-off').addEventListener('click', function() {
        isLightOn = false;
        this.classList.add('active');
        document.getElementById('light-on').classList.remove('active');
        
        // Set all light values to 0
        lightAmbient = vec4(0, 0, 0, 1.0);
        lightDiffuse = vec4(0, 0, 0, 1.0);
        lightSpecular = vec4(0, 0, 0, 1.0);
        
        recompute();
    });

    // Add material coefficient slider handlers
    document.getElementById('slider-ambient-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        materials[selectedObject].ambient = vec4(value, value, value, 1.0);
        document.getElementById('text-ambient-coef').innerHTML = value.toFixed(2);
        recompute();
    };

    document.getElementById('slider-diffuse-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        materials[selectedObject].diffuse = vec4(value, value, value, 1.0);
        document.getElementById('text-diffuse-coef').innerHTML = value.toFixed(2);
        recompute();
    };

    document.getElementById('slider-specular-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        materials[selectedObject].specular = vec4(value, value, value, 1.0);
        document.getElementById('text-specular-coef').innerHTML = value.toFixed(2);
        recompute();
    };

    document.getElementById('slider-material-shininess').onchange = function(event) {
        var value = parseInt(event.target.value);
        materials[selectedObject].shininess = value;
        document.getElementById('text-material-shininess').innerHTML = value;
        recompute();
    };

    // Add light color picker handlers
    document.getElementById('light-ambient-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightAmbient = vec4(r, g, b, 1.0);
        recompute();
    });

    document.getElementById('light-diffuse-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightDiffuse = vec4(r, g, b, 1.0);
        recompute();
    });

    document.getElementById('light-specular-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightSpecular = vec4(r, g, b, 1.0);
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

    // Set global light properties
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
    gl.uniform1i(gl.getUniformLocation(program, "uIsPointLight"), isPointLight);
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightPosition"), flatten(spotlightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotLightDirection"), flatten(spotLightDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uSpotLightCutoff"), spotLightCutoff);

    // Draw teacup with its material
    materialAmbient = materials.teacup.ambient;
    materialDiffuse = materials.teacup.diffuse;
    materialSpecular = materials.teacup.specular;
    shininess = materials.teacup.shininess;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
    drawTeacup();

    // Draw torus with its material
    materialAmbient = materials.torus.ambient;
    materialDiffuse = materials.torus.diffuse;
    materialSpecular = materials.torus.specular;
    shininess = materials.torus.shininess;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
    drawTorus();

    // Draw plate with its material
    materialAmbient = materials.plate.ambient;
    materialDiffuse = materials.plate.diffuse;
    materialSpecular = materials.plate.specular;
    shininess = materials.plate.shininess;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
    drawPlate();

    if (!isPointLight) {
        drawSpotlightMarker();
     }
}

// Draw the teacup
function drawTeacup()
{
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix, translate(1.2, 0.3, -0.5));
    modelViewMatrix = mult(modelViewMatrix, rotateX(10 + teacupTheta[0]));
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
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.2, -0.05, 0.1));

    modelViewMatrix = mult(modelViewMatrix, rotateX(12 + torusTheta[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(-torusTheta[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(torusTheta[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);

    gl.drawArrays(gl.TRIANGLES, teacupV, torusV);
}

// Draw the plate
function drawPlate()
{
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix, translate(-0.2, -0.25, 0));
    modelViewMatrix = mult(modelViewMatrix, rotateX(15 + plateTheta[0]));//15
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
        case 'x': {
            teacupTheta[0] -= 1;
            torusTheta[0] -= 1;
            plateTheta[0] -= 1;
            break;
        }
        case 'y': {
            teacupTheta[1] -= 1;
            torusTheta[1] += 1;
            plateTheta[1] -= 1;
            break;
        }
        case 'z': {
            teacupTheta[2] -= 1;
            torusTheta[2] -= 1;
            plateTheta[2] -= 1;
            break;
        }
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

// Add this function to handle object selection
function selectObject(objectName) {
    selectedObject = objectName;
    
    // Update UI to show active object
    document.getElementById('teacup-select').classList.remove('active');
    document.getElementById('torus-select').classList.remove('active');
    document.getElementById('plate-select').classList.remove('active');
    document.getElementById(objectName + '-select').classList.add('active');

    // Update material sliders to show selected object's values
    updateMaterialUI();
}

// Add this function to update material UI
function updateMaterialUI() {
    var material = materials[selectedObject];
    
    // Update material color circles
    document.querySelector('.material-ambient-circle').style.backgroundColor = 
        `rgb(${material.ambient[0]*255}, ${material.ambient[1]*255}, ${material.ambient[2]*255})`;
    document.querySelector('.material-diffuse-circle').style.backgroundColor = 
        `rgb(${material.diffuse[0]*255}, ${material.diffuse[1]*255}, ${material.diffuse[2]*255})`;
    
    // Update material sliders
    document.getElementById('slider-material-shininess').value = material.shininess;
    document.getElementById('text-material-shininess').innerHTML = material.shininess;
    
    // Update reflection coefficient sliders
    document.getElementById('slider-ambient-coef').value = material.ambient[0];
    document.getElementById('text-ambient-coef').innerHTML = material.ambient[0].toFixed(2);
    
    document.getElementById('slider-diffuse-coef').value = material.diffuse[0];
    document.getElementById('text-diffuse-coef').innerHTML = material.diffuse[0].toFixed(2);
    
    document.getElementById('slider-specular-coef').value = material.specular[0];
    document.getElementById('text-specular-coef').innerHTML = material.specular[0].toFixed(2);
}

// Add a function to draw a small sphere at the spotlight position
function drawSpotlightMarker() {
    // Scene boundaries
    const sceneBounds = 1.5;
    
    // Calculate marker position
    let markerPos = vec3(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2]);
    
    // If spotlight is outside scene bounds, place marker at boundary
    let distance = Math.sqrt(
        markerPos[0] * markerPos[0] + 
        markerPos[1] * markerPos[1] + 
        markerPos[2] * markerPos[2]
    );

    markerPos[0] = (markerPos[0] / distance) * sceneBounds;
    markerPos[1] = (markerPos[1] / distance) * sceneBounds;
    markerPos[2] = (markerPos[2] / distance) * sceneBounds;

    let startPosition = vec4(markerPos[0], markerPos[1], markerPos[2], 1.0);
    let direction = normalize(spotLightDirection); // Ensure the direction is normalized
    let arrowSize = 0.5; // Adjust this to change the length of the arrow

    drawArrow(startPosition, direction, arrowSize);
}

function drawArrow(startPosition, direction, size) {
    // Calculate the end position of the arrow line based on the direction and size
    let endPosition = vec4(
        startPosition[0] + direction[0] * size,
        startPosition[1] + direction[1] * size,
        startPosition[2] + direction[2] * size,
        1.0
    );

    // Create line vertices (start and end points)
    let lineVertices = [startPosition, endPosition];

    // Create and bind buffer for the line
    let lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.STATIC_DRAW);

    // Set up line attributes
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    // Draw the line (representing the main direction)
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINES, 0, 2);

    // Calculate the base of the arrowhead (offset from the end of the line)
    let arrowBase = vec4(
        endPosition[0] - direction[0] * size * 0.1,  // Shrink by a factor to get the base of the arrowhead
        endPosition[1] - direction[1] * size * 0.1,
        endPosition[2] - direction[2] * size * 0.1,
        1.0
    );

    // Create vertices for the triangle (arrowhead)
    let triangleVertices = [
        endPosition,  // Tip of the arrow
        vec4(
            arrowBase[0] + direction[1] * size * 0.1,
            arrowBase[1] - direction[0] * size * 0.1,
            arrowBase[2],
            1.0
        ),  // Left side of the arrowhead
        vec4(
            arrowBase[0] - direction[1] * size * 0.1,
            arrowBase[1] + direction[0] * size * 0.1,
            arrowBase[2],
            1.0
        )   // Right side of the arrowhead
    ];

    // Create and bind buffer for the arrowhead (triangle)
    let triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    // Set up triangle attributes
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    // Draw the triangle (representing the arrowhead)
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw the arrowhead (triangle)
    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}



// function drawArrow(start, end) {
//     // Draw a line from `start` to `end` using LINE_STRIP
//     var vertices = [
//         vec4(start[0], start[1], start[2], 1.0),
//         vec4(end[0], end[1], end[2], 1.0)
//     ];

//     // Send vertices to GPU and render the line
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
//     gl.drawArrays(gl.LINES, 0, 2);

// }

// function drawSphere(scaleFactor) {
//     // Save the current transformation matrix
//     stack.push(modelViewMatrix);

//     // Apply scaling transformation
//     modelViewMatrix = mult(modelViewMatrix, scalem(scaleFactor, scaleFactor, scaleFactor));

//     // Pass the updated modelViewMatrix to the shader
//     gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

//     // Draw the sphere
//     gl.drawArrays(gl.TRIANGLES, sphereStartIndex, sphereVertexCount);

//     // Restore the original transformation matrix
//     modelViewMatrix = stack.pop();
// }

function sphere(subdivisions) {
    var vertices = [];
    var radius = 1.0;
    
    // Generate sphere vertices
    for(var i = 0; i <= subdivisions; i++) {
        var lat = Math.PI * (-0.5 + (i / subdivisions));
        var sinLat = Math.sin(lat);
        var cosLat = Math.cos(lat);

        for(var j = 0; j <= subdivisions; j++) {
            var lon = 2 * Math.PI * (j / subdivisions);
            var sinLon = Math.sin(lon);
            var cosLon = Math.cos(lon);

            var x = cosLon * cosLat;
            var y = sinLat;
            var z = sinLon * cosLat;

            vertices.push(vec4(radius * x, radius * y, radius * z, 1.0));
        }
    }

    // Generate triangles
    var spherePoints = [];
    for(var i = 0; i < subdivisions; i++) {
        for(var j = 0; j < subdivisions; j++) {
            var first = (i * (subdivisions + 1)) + j;
            var second = first + subdivisions + 1;

            // First triangle
            spherePoints.push(vertices[first]);
            spherePoints.push(vertices[first + 1]);
            spherePoints.push(vertices[second]);

            // Second triangle
            spherePoints.push(vertices[second]);
            spherePoints.push(vertices[first + 1]);
            spherePoints.push(vertices[second + 1]);
        }
    }

    return spherePoints;
}


/*-----------------------------------------------------------------------------------*/