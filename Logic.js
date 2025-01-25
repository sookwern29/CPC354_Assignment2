/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix = ortho(-3, 3, -2, 2, -10, 10), nMatrix;

// Rotation variables for each object
var teacupTheta = [0, 0, 0], torusTheta = [0, 0, 0], plateTheta = [0, 0, 0];
var animFrame = 0, animFlag = false;

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var lightPos = vec4(1.0, 1.0, 1.0, 0.0); //For Point Light
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var eye = vec3(0.0, 0.0, 4.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec4(0.0, 1.0, 0.0, 1.0);
var theta=0, phi=0, radius=4, fov=11, near=1.6, far=3;

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
var spotlightDirection = vec4(0.0, -1.0, 0.0, 0.0); // Default pointing downward
let spotLightCutoff = 30.0; // 30-degree cutoff angle
var savedLightValues = {
    ambient: 0.5,
    diffuse: 0.5,
    specular: 0.5
};
var activeRotationAxis = 'x'; // Default to X-axis rotation
var selectedObject = 'teacup'; // Default selected object

var backgroundImage = new Image();
var hasBackgroundImage = false;

// Material properties for each object
var materials = {
    teacup: {
        ambient: vec4(0.6, 0.4, 0.2, 1.0),    // Light brown
        diffuse: vec4(1.0, 1.0, 1.0, 1.0),    // White diffuse
        specular: vec4(1.0, 1.0, 1.0, 1.0),   // White specular
        ambientCoef: 1.0,
        diffuseCoef: 1.0,
        specularCoef: 1.0,
        shininess: 51
    },
    torus: {
        ambient: vec4(0.6, 0.6, 1.0, 1.0),    // Light blue
        diffuse: vec4(1.0, 1.0, 1.0, 1.0),    // White diffuse
        specular: vec4(1.0, 1.0, 1.0, 1.0),   // White specular
        ambientCoef: 1.0,
        diffuseCoef: 1.0,
        specularCoef: 1.0,
        shininess: 60
    },
    plate: {
        ambient: vec4(0.9, 0.9, 0.9, 1.0),    // White ambient
        diffuse: vec4(0.9, 0.9, 0.9, 1.0),    // White diffuse
        specular: vec4(1.0, 1.0, 1.0, 1.0),   // White specular
        ambientCoef: 1.0,
        diffuseCoef: 1.0,
        specularCoef: 1.0,
        shininess: 45
    }
};

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init()
{
    // Create the objects
    teacupObj = teacup(36, 20, 0.4, 0.25);
    teacupObj.Scale(0.08, 0.08, 0.08);
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
    updateCamera();
    render();

}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement()
{
    canvas = document.getElementById("gl-canvas");

    //Feature 1: Toggle Light On and Off
    //Light On
    document.getElementById('light-on').addEventListener('click', function() {
        isLightOn = true;
        this.classList.add('active');
        document.getElementById('light-off').classList.remove('active');
        
        // Restore saved light values
        lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
        lightDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
        lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);
        
        recompute();
    });

    //Light Off
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

    //Feature 2: Light Color Picker
    //Ambient Light
    document.getElementById('light-ambient-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightAmbient = vec4(r, g, b, 1.0);
        recompute();
    });

    //Diffuse Light
    document.getElementById('light-diffuse-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightDiffuse = vec4(r, g, b, 1.0);
        recompute();
    });

    //Specular Light
    document.getElementById('light-specular-color').addEventListener('input', function(event) {
        var color = event.target.value;
        var r = parseInt(color.substr(1,2), 16) / 255;
        var g = parseInt(color.substr(3,2), 16) / 255;
        var b = parseInt(color.substr(5,2), 16) / 255;
        lightSpecular = vec4(r, g, b, 1.0);
        recompute();
    });

    //Feature 3: Light Type Toggle
    //Light 1: Point Light
    document.getElementById('point-light').addEventListener('click', function() {
        isPointLight = true;
        document.querySelector('.spotlight-controls').style.display = 'none';
        document.querySelector('.pointlight-controls').style.display = 'block';
        this.classList.add('active');
        document.getElementById('spot-light').classList.remove('active');
        recompute();
    });

    //Light 2:Spot Light
    document.getElementById('spot-light').addEventListener('click', function() {
        isPointLight = false;
        document.querySelector('.spotlight-controls').style.display = 'block';
        document.querySelector('.pointlight-controls').style.display = 'none';
        this.classList.add('active');
        document.getElementById('point-light').classList.remove('active');
        recompute();
    });

    //Feature 4: Point Light Position
    //X
    document.getElementById('slider-light-x').onchange = function(event) 
	{
		lightPos[0] = event.target.value;
		document.getElementById('text-light-x').innerHTML = lightPos[0].toFixed(1);
        recompute();
    };

    //Y
    document.getElementById('slider-light-y').onchange = function(event) 
	{
		lightPos[1] = event.target.value;
		document.getElementById('text-light-y').innerHTML = lightPos[1].toFixed(1);
        recompute();
    };

    //Z
    document.getElementById('slider-light-z').onchange = function(event) 
	{
		lightPos[2] = event.target.value;
		document.getElementById('text-light-z').innerHTML = lightPos[2].toFixed(1);
        recompute();
    };
    
    //Feature 5: Spotlight Position
    //X
    document.getElementById('slider-spotlight-x').onchange = function(event) {
        spotlightPosition[0] = event.target.value;
        document.getElementById('text-spotlight-x').innerHTML = spotlightPosition[0];
        recompute();
    };
    //Y 
    document.getElementById('slider-spotlight-y').onchange = function(event) {
        spotlightPosition[1] = event.target.value;
        document.getElementById('text-spotlight-y').innerHTML = spotlightPosition[1];
        recompute();
    };

    //Z
    document.getElementById('slider-spotlight-z').onchange = function(event) {
        spotlightPosition[2] = event.target.value;
        document.getElementById('text-spotlight-z').innerHTML = spotlightPosition[2];
        recompute();
    };

    //Feature 5: Spotlight Direction
    //X
    document.getElementById('slider-spotlight-dir-x').onchange = function(event) {
        spotlightDirection[0] = event.target.value;
        document.getElementById('text-spotlight-dir-x').innerHTML = spotlightDirection[0].toFixed(1);
        recompute();
    };

    //Y
    document.getElementById('slider-spotlight-dir-y').onchange = function(event) {
        spotlightDirection[1] = event.target.value;
        document.getElementById('text-spotlight-dir-y').innerHTML = spotlightDirection[1].toFixed(1);
        recompute();
    };

    //Z
    document.getElementById('slider-spotlight-dir-z').onchange = function(event) {
        spotlightDirection[2] = event.target.value;
        document.getElementById('text-spotlight-dir-z').innerHTML = spotlightDirection[2].toFixed(1);
        recompute();
    };

    //Feature 6(Additional Feature): Spotlight Cutoff Angle
    document.getElementById('slider-spotlight-cutoff').onchange = function(event) {
        spotLightCutoff = parseFloat(event.target.value);
        document.getElementById('text-spotlight-cutoff').innerHTML = spotLightCutoff.toFixed(2);
        recompute();
    }; 

    //Feature 7: Object Selection
    document.getElementById('teacup-select').addEventListener('click', function() {
        selectObject('teacup');
    });
    document.getElementById('torus-select').addEventListener('click', function() {
        selectObject('torus');
    });
    document.getElementById('plate-select').addEventListener('click', function() {
        selectObject('plate');
    });

    //Material Properties
    //Feature 8: Object Shininess
    document.getElementById('slider-shininess').onchange = function(event) {
        const value = parseFloat(event.target.value);
        materials[selectedObject].shininess = value;  // Update the object's shininess
        document.getElementById('text-shininess').innerHTML = value;
        recompute();
    };

    //Feature 9: Material Color
    //Ambient
    document.getElementById('material-ambient-color').addEventListener('input', function(event) {
        var color = hexToRgb(event.target.value);
        var coef = parseFloat(document.getElementById('slider-ambient-coef').value);
        
        materials[selectedObject].diffuse = vec4(
            color.r * coef,
            color.g * coef,
            color.b * coef,
            1.0
        );
        recompute();
    });

    //Diffuse
    document.getElementById('material-diffuse-color').addEventListener('input', function(event) {
        var color = hexToRgb(event.target.value);
        var coef = parseFloat(document.getElementById('slider-diffuse-coef').value);
        
        materials[selectedObject].diffuse = vec4(
            color.r * coef,
            color.g * coef,
            color.b * coef,
            1.0
        );
        recompute();
    });

    //Specular
    document.getElementById('material-specular-color').addEventListener('input', function(event) {
        var color = hexToRgb(event.target.value);
        var coef = parseFloat(document.getElementById('slider-specular-coef').value);
        
        materials[selectedObject].specular = vec4(
            color.r * coef,
            color.g * coef,
            color.b * coef,
            1.0
        );

        recompute();
    });

    //Feature 10: Material Coefficient
    //Ambient Coefficient
    document.getElementById('slider-ambient-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        var colorHex = document.getElementById('material-ambient-color').value;
        var color = hexToRgb(colorHex);
        
        // Apply coefficient while maintaining color ratios
        materials[selectedObject].ambient = vec4(
            color.r * value,
            color.g * value,
            color.b * value,
            1.0
        );
        document.getElementById('text-ambient-coef').innerHTML = value.toFixed(2);
        recompute();
    };

    //Diffuse Coefficient
    document.getElementById('slider-diffuse-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        var colorHex = document.getElementById('material-diffuse-color').value;
        var color = hexToRgb(colorHex);
        
        // Apply coefficient while maintaining color ratios
        materials[selectedObject].diffuse = vec4(
            color.r * value,
            color.g * value,
            color.b * value,
            1.0
        );
        // materials[selectedObject].diffuse = vec4(value, value, value, 1.0);
        document.getElementById('text-diffuse-coef').innerHTML = value.toFixed(2);
        recompute();
    };

    //Specular Coefficient
    document.getElementById('slider-specular-coef').onchange = function(event) {
        var value = parseFloat(event.target.value);
        var colorHex = document.getElementById('material-specular-color').value;
        var color = hexToRgb(colorHex);
        
        // Apply coefficient while maintaining color ratios
        materials[selectedObject].specular = vec4(
            color.r * value,
            color.g * value,
            color.b * value,
            1.0
        );
        // materials[selectedObject].specular = vec4(value, value, value, 1.0);
        document.getElementById('text-specular-coef').innerHTML = value.toFixed(2);
        recompute();
    };


    //Feature 11: Camera Properties
    //1. Theta 
    document.getElementById("slider-theta").addEventListener("input", function () {
        theta = parseFloat(this.value);
        document.getElementById("text-theta").innerText = theta;
        updateCamera();
    });

    //2. Phi
    document.getElementById("slider-phi").addEventListener("input", function () {
        phi = parseFloat(this.value);
        document.getElementById("text-phi").innerText = phi;
        updateCamera();
    });

    //3. Radius    
    document.getElementById("slider-radius").addEventListener("input", function () {
        radius = parseFloat(this.value);
        document.getElementById("text-radius").innerText = radius;
        updateCamera();
    });

    //4. Field of View
    document.getElementById("slider-fov").addEventListener("input", function () {
        fov = parseFloat(this.value);
        document.getElementById("text-fov").innerText = fov;
        updateCamera();
    });

    //5. Near
    document.getElementById("slider-near").addEventListener("input", function () {
        near = parseFloat(this.value);
        document.getElementById("text-near").innerText = near;
        updateCamera();
    });

    //6. Far
    document.getElementById("slider-far").addEventListener("input", function () {
        far = parseFloat(this.value);
        document.getElementById("text-far").innerText = far;
        updateCamera();
    });

    //Feature 12: Background Customization
    //Toggle color or image background
    //1. Color Background
    document.getElementById('color-bg').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('image-bg').classList.remove('active');
        document.getElementById('color-bg-section').style.display = 'flex';
        document.getElementById('image-bg-section').style.display = 'none';
    });

    //2. Image Background
    document.getElementById('image-bg').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('color-bg').classList.remove('active');
        document.getElementById('color-bg-section').style.display = 'none';
        document.getElementById('image-bg-section').style.display = 'flex';
    });

    //Background Color Picker
    document.getElementById('background-color-picker').addEventListener('input', function(event) {
        var color = hexToRgb(event.target.value);
        gl.clearColor(color.r, color.g, color.b, 1.0);
        render();
    });

    //Background Image Upload
    document.getElementById('background-image-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                backgroundImage.onload = function() {
                    hasBackgroundImage = true;
                    gl.clearColor(0.0, 0.0, 0.0, 0.0); // Make background transparent
                    canvas.style.backgroundImage = `url(${backgroundImage.src})`;
                    canvas.style.backgroundSize = 'cover';
                    canvas.style.backgroundPosition = 'center';
                    render();
                };
                backgroundImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    //Remove Background
    document.getElementById('remove-bkg-btn').addEventListener('click', function() {
        hasBackgroundImage = false;
        canvas.style.backgroundImage = 'none';
        document.getElementById('background-image-upload').value = ''; // Clear the file input
        // Restore the previous background color
        const colorValue = document.getElementById('background-color-picker').value;
        const color = hexToRgb(colorValue);
        gl.clearColor(color.r, color.g, color.b, 1.0);
        render();
    });

    //Feature 13: Shading Type
    //1. Flat Shading
    document.getElementById('flat-shading').addEventListener('click', function() {
        isFlat = true;
        this.classList.add('active');
        document.getElementById('smooth-shading').classList.remove('active');
        console.log("Shading mode:", isFlat); // Debug
        // Recompute normals for flat shading
        recomputeNormals();
    });
    
    //2. Smooth Shading
    document.getElementById('smooth-shading').addEventListener('click', function() {
        isFlat = false;
        this.classList.add('active');
        document.getElementById('flat-shading').classList.remove('active');
        console.log("Shading mode:", isFlat); // Debug
        // Recompute normals for smooth shading
        recomputeNormals();
    });


    //Feature 14: Animation
    //1. Rotation
    document.getElementById('rotate-x').addEventListener('click', function() {
        setActiveRotation('x');
    });

    document.getElementById('rotate-y').addEventListener('click', function() {
        setActiveRotation('y');
    });

    document.getElementById('rotate-z').addEventListener('click', function() {
        setActiveRotation('z');
    });

    //2. Start Animation
    document.getElementById('start-btn').onclick = function()
	{
		animFlag = !animFlag;

        if(animFlag) animUpdate();
        else window.cancelAnimationFrame(animFrame);
	};
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
    if(animFlag) {
        animFlag = false;
        window.cancelAnimationFrame(animFrame);
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set clear color based on whether we have a background image
    if (!hasBackgroundImage) {
        const colorValue = document.getElementById('background-color-picker').value;
        const color = hexToRgb(colorValue);
        gl.clearColor(color.r, color.g, color.b, 1.0);
    }

    // Updated projection matrix with larger viewing volume
   // projectionMatrix = ortho(-3, 3, -2, 2, -10, 10);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set global light properties
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
    gl.uniform1i(gl.getUniformLocation(program, "uIsPointLight"), isPointLight);
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightPosition"), flatten(spotlightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotLightDirection"), flatten(spotlightDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uSpotLightCutoff"), spotLightCutoff);

    // Draw teacup with its material
    materialAmbient = materials.teacup.ambient;
    materialDiffuse = materials.teacup.diffuse;
    materialSpecular = materials.teacup.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.teacup.shininess);
    drawTeacup();

    // Draw torus with its material
    materialAmbient = materials.torus.ambient;
    materialDiffuse = materials.torus.diffuse;
    materialSpecular = materials.torus.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.torus.shininess);
    drawTorus();

    // Draw plate with its material
    materialAmbient = materials.plate.ambient;
    materialDiffuse = materials.plate.diffuse;
    materialSpecular = materials.plate.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.plate.shininess);
    drawPlate();

    if (!isPointLight) {
       drawSpotlightMarker();
    }
}

// Draw the teacup
function drawTeacup()
{
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix, translate(1.3, 0.2, -1.0));
    modelViewMatrix = mult(modelViewMatrix, rotateX(12 + teacupTheta[0]));
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
    modelViewMatrix = mult(modelViewMatrix, rotateX(15 + plateTheta[0]));
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
    teacupObj = teacup(36, 20, 0.4, 0.25);
    teacupObj.Scale(0.08, 0.08, 0.08);
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

function animUpdate() {
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

    // Reapply material properties for teacup
    materialAmbient = materials.teacup.ambient;
    materialDiffuse = materials.teacup.diffuse;
    materialSpecular = materials.teacup.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.teacup.shininess);
    drawTeacup();

    // Reapply material properties for torus
    materialAmbient = materials.torus.ambient;
    materialDiffuse = materials.torus.diffuse;
    materialSpecular = materials.torus.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.torus.shininess);
    drawTorus();

    // Reapply material properties for plate
    materialAmbient = materials.plate.ambient;
    materialDiffuse = materials.plate.diffuse;
    materialSpecular = materials.plate.specular;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materials.plate.shininess);
    drawPlate();

    animFrame = window.requestAnimationFrame(animUpdate);
}

function computeFlatNormals(vertices) {
    let normals = [];
    // Process three vertices at a time for each triangle
    for (let i = 0; i < vertices.length; i += 9) {
        let p1 = vec3(vertices[i], vertices[i + 1], vertices[i + 2]);
        let p2 = vec3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
        let p3 = vec3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
        
        // Calculate face normal using cross product
        let v1 = subtract(p2, p1);
        let v2 = subtract(p3, p1);
        let normal = normalize(cross(v1, v2));
        
        // Same normal for all three vertices of the triangle
        for (let j = 0; j < 3; j++) {
            normals.push(normal[0], normal[1], normal[2]);
        }
    }
    return normals;
}

function computeSmoothNormals(vertices) {
    // Create map to store vertex normals
    let vertexNormals = new Map();
    
    // Process triangles
    for (let i = 0; i < vertices.length; i += 9) {
        let p1 = vec3(vertices[i], vertices[i + 1], vertices[i + 2]);
        let p2 = vec3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
        let p3 = vec3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
        
        // Calculate face normal
        let v1 = subtract(p2, p1);
        let v2 = subtract(p3, p1);
        let faceNormal = normalize(cross(v1, v2));
        
        // Add face normal contribution to each vertex
        for (let j = 0; j < 3; j++) {
            let vertex = vec3(vertices[i + j*3], vertices[i + j*3 + 1], vertices[i + j*3 + 2]);
            let key = `${vertex[0]},${vertex[1]},${vertex[2]}`;
            
            if (!vertexNormals.has(key)) {
                vertexNormals.set(key, vec3(0, 0, 0));
            }
            let currentNormal = vertexNormals.get(key);
            vertexNormals.set(key, add(currentNormal, faceNormal));
        }
    }
    
    // Build final normal array
    let normals = [];
    for (let i = 0; i < vertices.length; i += 3) {
        let vertex = vec3(vertices[i], vertices[i + 1], vertices[i + 2]);
        let key = `${vertex[0]},${vertex[1]},${vertex[2]}`;
        let normal = normalize(vertexNormals.get(key));
        normals.push(normal[0], normal[1], normal[2]);
    }
    
    return normals;
}

function recomputeNormals() {
    // Recreate objects with current parameters
    teacupObj = teacup(36, 20, 0.4, 0.25);
    teacupObj.Scale(0.8, 0.8, 0.8);
    teacupPoints = teacupObj.Point;
    
    torusObj = torus(0.5, 0.2, 32, 24);
    torusObj.Scale(0.08, 0.08, 0.08);
    torusPoints = torusObj.Point;
    
    plateObj = plate(1.2, 0.8, 0.5, 36);
    plateObj.Scale(0.2, 0.08, 0.2);
    platePoints = plateObj.Point;

    if (!isFlat) {
        teacupNormals = computeSmoothNormals(teacupPoints, teacupObj.Indices);
        torusNormals = computeSmoothNormals(torusPoints, torusObj.Indices);
        plateNormals = computeSmoothNormals(platePoints, plateObj.Indices);
    } else {
        teacupNormals = computeFlatNormals(teacupPoints);
        torusNormals = computeFlatNormals(torusPoints);
        plateNormals = computeFlatNormals(platePoints);
    }    
    
    // Combine all points
    let allPoints = teacupPoints.concat(torusPoints, platePoints);
    
    // Extract vertex positions for normal calculation
    let vertices = [];
    for (let i = 0; i < allPoints.length; i++) {
        vertices.push(allPoints[i][0], allPoints[i][1], allPoints[i][2]);
    }
    
    // Compute normals based on shading type
    let normals = isFlat ? 
        computeFlatNormals(vertices) : 
        computeSmoothNormals(vertices);
    
    // Update buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(allPoints), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Convert normals to vec3 array
    let normalVecs = [];
    for (let i = 0; i < normals.length; i += 3) {
        normalVecs.push(vec3(normals[i], normals[i+1], normals[i+2]));
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalVecs), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    render();
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

function updateMaterialUI() {
    var material = materials[selectedObject];

    // Update color pickers
    document.getElementById('material-ambient-color').value = rgbToHex(
        Math.round(material.ambient[0] * 255),
        Math.round(material.ambient[1] * 255),
        Math.round(material.ambient[2] * 255)
    );
    
    document.getElementById('material-diffuse-color').value = rgbToHex(
        Math.round(material.diffuse[0] * 255),
        Math.round(material.diffuse[1] * 255),
        Math.round(material.diffuse[2] * 255)
    );
    
    document.getElementById('material-specular-color').value = rgbToHex(
        Math.round(material.specular[0] * 255),
        Math.round(material.specular[1] * 255),
        Math.round(material.specular[2] * 255)
    );

    // Update coefficient sliders
    document.getElementById('slider-ambient-coef').value = material.ambientCoef;
    document.getElementById('text-ambient-coef').innerHTML = material.ambientCoef.toFixed(2);

    document.getElementById('slider-diffuse-coef').value = material.diffuseCoef;
    document.getElementById('text-diffuse-coef').innerHTML = material.diffuseCoef.toFixed(2);

    document.getElementById('slider-specular-coef').value = material.specularCoef;
    document.getElementById('text-specular-coef').innerHTML = material.specularCoef.toFixed(2);

    // Update shininess
    document.getElementById('slider-shininess').value = material.shininess;
    document.getElementById('text-shininess').innerHTML = material.shininess;

    recompute();
}


// Add a function to draw a small sphere at the spotlight position
function drawSpotlightMarker() {
    // Save current modelView matrix
    var savedModelView = modelViewMatrix;
    
    // Move to spotlight position
    modelViewMatrix = mult(modelViewMatrix, translate(
        spotlightPosition[0], 
        spotlightPosition[1], 
        spotlightPosition[2]
    ));
    
    // Create rotation matrix to point in spotlight direction
    var direction = normalize(vec3(
        spotlightDirection[0],
        spotlightDirection[1],
        spotlightDirection[2]
    ));
    
    // Calculate rotation angles
    var phi = Math.acos(direction[1]);
    var theta = Math.atan2(direction[0], direction[2]);
    
    // Apply rotations
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta * 180 / Math.PI));
    modelViewMatrix = mult(modelViewMatrix, rotateX(phi * 180 / Math.PI));
    
    // Create and draw arrow
    var arrow = createArrow(0.5, 0.02);
    
    // Draw the arrow
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(arrow.Point), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(arrow.Normal), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, arrow.Point.length);
    
    // Restore modelView matrix
    modelViewMatrix = savedModelView;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function perspective(fov, aspect, near, far) {
    let f = 1.0 / Math.tan(radians(fov) / 2);
    return mat4(
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
        0, 0, -1, 0
    );
}

function updateCamera() {
    if (!gl || !projectionMatrixLoc || !modelViewMatrixLoc) {
        console.error("WebGL is not initialized! updateCamera() aborted.");
        return;
    }
    let thetaRad = (theta * Math.PI) / 180; // Convert degrees to radians
    let phiRad = (phi * Math.PI) / 180;

    // Convert spherical coordinates to Cartesian coordinates
    eye = vec3(
        radius * Math.cos(phiRad) * Math.sin(thetaRad),
        radius * Math.sin(phiRad),
        radius * Math.cos(phiRad) * Math.cos(thetaRad)
    );

    if (phi > 90 || phi < -90) {
        up = vec3(0.0, -1.0, 0.0); // Flip the up vector when looking upside-down
    } else {
        up = vec3(0.0, 1.0, 0.0); // Keep normal up vector
    }

    // Ensure camera is looking at the scene
    modelViewMatrix = lookAt(eye, at, up);
    
    // Update WebGL uniform matrix
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Update perspective projection based on FOV
    let aspectRatio = canvas.width / canvas.height; // Maintain aspect ratio
    projectionMatrix = perspective(fov, aspectRatio, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Re-render the scene
    render();
}



function interpolateMaterial(value) {
    const t = value / 100;
    
    return {
        ambient: vec4(
            0.1 + (0.2 * t),  // 0.1 to 0.3
            0.1 + (0.2 * t),
            0.1 + (0.2 * t),
            1.0
        ),
        diffuse: vec4(
            0.2 + (0.5 * t),  // 0.2 to 0.7
            0.2 + (0.5 * t),
            0.2 + (0.5 * t),
            1.0
        ),
        specular: vec4(
            0.1 + (0.9 * t),  // 0.1 to 1.0 (high specular for metallic)
            0.1 + (0.9 * t),
            0.1 + (0.9 * t),
            1.0
        ),
        shininess: 1 + (299 * t)  // 1 to 300 (much higher shininess range)
    };
}

/*-----------------------------------------------------------------------------------*/