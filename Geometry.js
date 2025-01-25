/*-----------------------------------------------------------------------------------*/
// Sphere
/*-----------------------------------------------------------------------------------*/

// function sphere(subdivNum)
// {
//     var spherePoints = [], sphereNormals = [], sphereData = {};

// 	var va = vec4(0.0, 0.0, -1.0, 1);
// 	var vb = vec4(0.0, 0.942809, 0.333333, 1);
// 	var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
// 	var vd = vec4(0.816497, -0.471405, 0.333333, 1);

// 	function triangle(a, b, c) 
// 	{
// 		spherePoints.push([a[0],a[1], a[2], 1]);
// 		spherePoints.push([b[0],b[1], b[2], 1]);
// 		spherePoints.push([c[0],c[1], c[2], 1]);

// 		sphereNormals.push([a[0],a[1], a[2]]);
// 		sphereNormals.push([b[0],b[1], b[2]]);
// 		sphereNormals.push([c[0],c[1], c[2]]);
// 	}

// 	function divideTriangle(a, b, c, count)
// 	{
// 		if(count > 0) 
// 		{
// 			var ab = mix(a, b, 0.5);
// 			var ac = mix(a, c, 0.5);
// 			var bc = mix(b, c, 0.5);

// 			ab = normalize(ab, true);
// 			ac = normalize(ac, true);
// 			bc = normalize(bc, true);

// 			divideTriangle(a, ab, ac, count - 1);
// 			divideTriangle(ab, b, bc, count - 1);
// 			divideTriangle(bc, c, ac, count - 1);
// 			divideTriangle(ab, bc, ac, count - 1);
// 		}

// 		else
// 		{
// 			triangle(a, b, c);
// 		}
// 	}

// 	function tetrahedron(a, b, c, d, n)
// 	{
// 		divideTriangle(a, b, c, n);
// 		divideTriangle(d, c, b, n);
// 		divideTriangle(a, d, b, n);
// 		divideTriangle(a, c, d, n);
// 	}

// 	// Primitive (geometric shape) initialization
//     tetrahedron(va, vb, vc, vd, subdivNum);

// 	// Functions for local transformation
// 	function translate(x, y, z)
// 	{
// 		for(var j = 0; j < spherePoints.length; j++) 
// 		{
// 			spherePoints[j][0] += x;
// 			spherePoints[j][1] += y;
// 			spherePoints[j][2] += z;
// 		}
// 	}

// 	function rotate(angle, axis)
// 	{

// 		var d = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
// 		var x = axis[0] / d;
// 		var y = axis[1] / d;
// 		var z = axis[2] / d;
// 		var c = Math.cos(radians(angle));
// 		var s = Math.sin(radians(angle));
// 		var omc = 1.0 - c;
	
// 		var mat =
// 		[
// 			[ x * x * omc + c,   x * y * omc - z * s, x * z * omc + y * s ],
// 			[ x * y * omc + z * s, y * y * omc + c,   y * z * omc - x * s ],
// 			[ x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c ]
// 		];
	
// 		for(var i = 0; i < spherePoints.length; i++)
// 		{
// 			var u = [0, 0, 0];
// 			var v = [0, 0, 0];
// 			for(var j = 0; j < 3; j++)
// 			{
// 				for(var k = 0 ; k < 3; k++)
// 				{
// 					u[j] += mat[j][k] * spherePoints[i][k];
// 					v[j] += mat[j][k] * sphereNormals[i][k];
// 				};
// 			}

// 			for(var j = 0; j < 3; j++)
// 			{
// 				spherePoints[i][j] = u[j];
// 				sphereNormals[i][j] = v[j];
// 			};
// 		};
// 	}

// 	function scale(sx, sy, sz)
// 	{
// 		for(var i = 0; i < spherePoints.length; i++)
// 		{
// 			spherePoints[i][0] *= sx;
// 			spherePoints[i][1] *= sy;
// 			spherePoints[i][2] *= sz;
// 			sphereNormals[i][0] /= sx;
// 			sphereNormals[i][1] /= sy;
// 			sphereNormals[i][2] /= sz;
// 		};
// 	}

//     sphereData.Point = spherePoints;
// 	sphereData.Normal = sphereNormals;
// 	sphereData.Translate = translate;
// 	sphereData.Rotate = rotate;
// 	sphereData.Scale = scale;
// 	return sphereData;
// }

/*-----------------------------------------------------------------------------------*/
// Cylinder
/*-----------------------------------------------------------------------------------*/

// function cylinder(numSlices, numStacks, caps)
// {
//     var cylinderPoints = [], cylinderNormals = [], cylinderData = {};

// 	var slices = 36;
// 	if(numSlices) slices = numSlices;
	
// 	var stacks = 1;
// 	if(numStacks) stacks = numStacks;
	
// 	var capsFlag = true;
// 	if(caps == false) capsFlag = caps;

// 	var top = 0.5;
// 	var bottom = -0.5;
// 	var radius = 0.5;

// 	// Primitive (geometric shape) initialization
// 	for(var j = 0; j < stacks; j++)
// 	{
// 		var stop = bottom + (j + 1) * (top-bottom) / stacks;
// 		var sbottom = bottom + j * (top-bottom) / stacks;
// 		var topPoints = [];
// 		var bottomPoints = [];

// 		for(var i =0; i < slices; i++)
// 		{
// 			var theta = 2.0 * i * Math.PI / slices;
// 			topPoints.push([radius * Math.sin(theta), stop, radius * Math.cos(theta), 1.0]);
// 			bottomPoints.push([radius * Math.sin(theta), sbottom, radius * Math.cos(theta), 1.0]);
// 		};

// 		topPoints.push([0.0, stop, radius, 1.0]);
// 		bottomPoints.push([0.0,  sbottom, radius, 1.0]);

// 		for(var i = 0; i < slices; i++)
// 		{
// 			var a = topPoints[i];
// 			var d = topPoints[i + 1];
// 			var b = bottomPoints[i];
// 			var c = bottomPoints[i + 1];
// 			var u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
// 			var v = [c[0]-b[0], c[1]-b[1], c[2]-b[2]];

// 			var normal =
// 			[
// 				u[1] * v[2] - u[2] * v[1],
// 				u[2] * v[0] - u[0] * v[2],
// 				u[0] * v[1] - u[1] * v[0]
// 			];

// 			var mag = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2])
// 			normal = [normal[0] / mag, normal[1] / mag, normal[2] / mag];
// 			cylinderPoints.push([a[0], a[1], a[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);

// 			cylinderPoints.push([b[0], b[1], b[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);

// 			cylinderPoints.push([c[0], c[1], c[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);

// 			cylinderPoints.push([a[0], a[1], a[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);

// 			cylinderPoints.push([c[0], c[1], c[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);

// 			cylinderPoints.push([d[0], d[1], d[2], 1.0]);
// 			cylinderNormals.push([normal[0], normal[1], normal[2]]);
// 		};
// 	};

// 	var topPoints = [];
// 	var bottomPoints = [];
// 	for(var i = 0; i < slices; i++)
// 	{
// 		var theta = 2.0 * i * Math.PI / slices;
// 		topPoints.push([radius * Math.sin(theta), top, radius * Math.cos(theta), 1.0]);
// 		bottomPoints.push([radius * Math.sin(theta), bottom, radius * Math.cos(theta), 1.0]);
// 	};

// 	topPoints.push([0.0, top, radius, 1.0]);
// 	bottomPoints.push([0.0,  bottom, radius, 1.0]);

// 	if(capsFlag)
// 	{
// 		// Top surface
// 		for(i = 0; i < slices; i++)
// 		{
// 			normal = [0.0, 1.0, 0.0];
// 			var a = [0.0, top, 0.0, 1.0];
// 			var b = topPoints[i];
// 			var c = topPoints[i + 1];

// 			cylinderPoints.push([a[0], a[1], a[2], 1.0]);
// 			cylinderNormals.push(normal);

// 			cylinderPoints.push([b[0], b[1], b[2], 1.0]);
// 			cylinderNormals.push(normal);

// 			cylinderPoints.push([c[0], c[1], c[2], 1.0]);
// 			cylinderNormals.push(normal);
// 		};

// 		// Bottom surface
// 		for(i = 0; i < slices; i++)
// 		{
// 			normal = [0.0, -1.0, 0.0];
// 			var a = [0.0, bottom, 0.0, 1.0];
// 			var b = bottomPoints[i];
// 			var c = bottomPoints[i+1];

// 			cylinderPoints.push([a[0], a[1], a[2], 1.0]);
// 			cylinderNormals.push(normal);

// 			cylinderPoints.push([b[0], b[1], b[2], 1.0]);
// 			cylinderNormals.push(normal);

// 			cylinderPoints.push([c[0], c[1], c[2], 1.0]);
// 			cylinderNormals.push(normal);
// 		};
// 	};

// 	// Functions for local transformation
// 	function translate(x, y, z)
// 	{
// 		for(var j = 0; j < cylinderPoints.length; j++) 
// 		{
// 			cylinderPoints[j][0] += x;
// 			cylinderPoints[j][1] += y;
// 			cylinderPoints[j][2] += z;
// 		}
// 	}

// 	function rotate(angle, axis)
// 	{

// 		var d = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
// 		var x = axis[0] / d;
// 		var y = axis[1] / d;
// 		var z = axis[2] / d;
// 		var c = Math.cos(radians(angle));
// 		var s = Math.sin(radians(angle));
// 		var omc = 1.0 - c;
	
// 		var mat =
// 		[
// 			[ x * x * omc + c,   x * y * omc - z * s, x * z * omc + y * s ],
// 			[ x * y * omc + z * s, y * y * omc + c,   y * z * omc - x * s ],
// 			[ x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c ]
// 		];
	
// 		for(var i = 0; i < cylinderPoints.length; i++)
// 		{
// 			var u = [0, 0, 0];
// 			var v = [0, 0, 0];
// 			for(var j = 0; j < 3; j++)
// 			{
// 				for(var k = 0 ; k < 3; k++)
// 				{
// 					u[j] += mat[j][k] * cylinderPoints[i][k];
// 					v[j] += mat[j][k] * cylinderNormals[i][k];
// 				};
// 			}

// 			for(var j = 0; j < 3; j++)
// 			{
// 				cylinderPoints[i][j] = u[j];
// 				cylinderNormals[i][j] = v[j];
// 			};
// 		};
// 	}

// 	function scale(sx, sy, sz)
// 	{
// 		for(var i = 0; i < cylinderPoints.length; i++)
// 		{
// 			cylinderPoints[i][0] *= sx;
// 			cylinderPoints[i][1] *= sy;
// 			cylinderPoints[i][2] *= sz;
// 			cylinderNormals[i][0] /= sx;
// 			cylinderNormals[i][1] /= sy;
// 			cylinderNormals[i][2] /= sz;
// 		};
// 	}

//     cylinderData.Point = cylinderPoints;
// 	cylinderData.Normal = cylinderNormals;
// 	cylinderData.Translate = translate;
// 	cylinderData.Rotate = rotate;
// 	cylinderData.Scale = scale;
// 	return cylinderData;
// }

/*-----------------------------------------------------------------------------------*/
// Cube
/*-----------------------------------------------------------------------------------*/

// function cube()
// {
//     var cubePoints = [], cubeNormals = [], cubeData = {};

//     var cubeVertices = 
// 	[
// 		[-0.5, -0.5,  0.5, 1.0],
// 		[-0.5,  0.5,  0.5, 1.0],
// 		[ 0.5,  0.5,  0.5, 1.0],
// 		[ 0.5, -0.5,  0.5, 1.0],
// 		[-0.5, -0.5, -0.5, 1.0],
// 		[-0.5,  0.5, -0.5, 1.0],
// 		[ 0.5,  0.5, -0.5, 1.0],
// 		[ 0.5, -0.5, -0.5, 1.0]
// 	];

//     var cubeFaceNormals = 
// 	[
// 		[ 0, 0, 1],
// 		[ 1, 0, 0],
// 		[ 0,-1, 0],
// 		[ 0, 1, 0],
// 		[ 0, 0,-1],
// 		[-1, 0, 0]
// 	];

//     var cubeQuadElements =
// 	[
// 		1, 0, 3, 3, 2, 1,
// 		2, 3, 7, 7, 6, 2,
// 		3, 0, 4, 4, 7, 3,
// 		6, 5, 1, 1, 2, 6,
// 		4, 5, 6, 6, 7, 4,
// 		5, 4, 0, 0, 1, 5
// 	];

//     var cubeNormalElements = 
// 	[
// 		0, 0, 0, 0, 0, 0,
// 		1, 1, 1, 1, 1, 1,
// 		2, 2, 2, 2, 2, 2,
// 		3, 3, 3, 3, 3, 3,
// 		4, 4, 4, 4, 4, 4,
// 		5, 5, 5, 5, 5, 5
// 	];

// 	// Primitive (geometric shape) initialization
//     for (var i = 0; i < cubeQuadElements.length; i++) 
//     {
//         cubePoints.push(cubeVertices[cubeQuadElements[i]]);
//         cubeNormals.push(cubeFaceNormals[cubeNormalElements[i]]);
//     }

// 	// Functions for local transformation
// 	function translate(x, y, z)
// 	{
// 	   for(var j = 0; j < cubeVertices.length; j++) 
// 	   {
// 		 cubeVertices[j][0] += x;
// 		 cubeVertices[j][1] += y;
// 		 cubeVertices[j][2] += z;
// 	   }
// 	}
	
// 	function rotate(angle, axis) 
// 	{
// 		var d = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
// 		var x = axis[0] / d;
// 		var y = axis[1] / d;
// 		var z = axis[2] / d;
// 		var c = Math.cos(radians(angle));
// 		var s = Math.sin(radians(angle));
// 		var omc = 1.0 - c;

// 		var mat = 
// 		[
// 			[ x * x * omc + c,   x * y * omc - z * s, x * z * omc + y * s ],
// 			[ x * y * omc + z * s, y * y * omc + c,   y * z * omc - x * s ],
// 			[ x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c ]
// 		];

// 		for(var i = 0; i < cubeVertices.length; i++) 
// 		{
// 			var t = [0, 0, 0];
// 			for(var j = 0; j < 3; j++)
// 			{
// 				for(var k = 0 ; k < 3; k++)
// 				{
// 					t[j] += mat[j][k] * cubeVertices[i][k];
// 				}
// 			}
			
// 			for(var m = 0; m < 3; m++)
// 			{
// 				cubeVertices[i][m] = t[m];
// 			}
// 		}
// 	}

// 	function scale(sx, sy, sz)
// 	{
// 		for(i = 0; i < cubeVertices.length; i++)
// 		{
// 			cubeVertices[i][0] *= sx;
// 			cubeVertices[i][1] *= sy;
// 			cubeVertices[i][2] *= sz;
// 		};

// 		for(i = 0; i < cubeFaceNormals.length; i++)
// 		{
// 			cubeFaceNormals[i][0] /= sx;
// 			cubeFaceNormals[i][1] /= sy;
// 			cubeFaceNormals[i][2] /= sz;
// 		};
// 	}

//     cubeData.Point = cubePoints;
// 	cubeData.Normal = cubeNormals;
// 	cubeData.Translate = translate;
// 	cubeData.Rotate = rotate;
// 	cubeData.Scale = scale;
// 	return cubeData;
// }

function torus(majorRadius, minorRadius, majorSegments, minorSegments) {
    var torusPoints = [];
    var torusNormals = [];
    var torusData = {};

    // Default values if not specified
    majorRadius = majorRadius || 0.5;    // Distance from center to middle of tube
    minorRadius = minorRadius || 0.2;    // Radius of the tube
    majorSegments = majorSegments || 32;  // Number of segments around the main ring
    minorSegments = minorSegments || 24;  // Number of segments around the tube

    // First, generate unique vertices and normals
    for (var i = 0; i <= majorSegments; i++) {
        var majorAngle = (i * 2.0 * Math.PI) / majorSegments;
        var cosMA = Math.cos(majorAngle);
        var sinMA = Math.sin(majorAngle);

        for (var j = 0; j <= minorSegments; j++) {
            var minorAngle = (j * 2.0 * Math.PI) / minorSegments;
            var cosMI = Math.cos(minorAngle);
            var sinMI = Math.sin(minorAngle);

            // Calculate vertex position
            var x = (majorRadius + minorRadius * cosMI) * cosMA;
            var z = (majorRadius + minorRadius * cosMI) * sinMA;
            var y = minorRadius * sinMI;

            // Calculate normal
            var nx = cosMI * cosMA;
            var nz = cosMI * sinMA;
            var ny = sinMI;
            
            // Normalize the normal vector
            var length = Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx /= length;
            ny /= length;
            nz /= length;

            torusPoints.push(vec4(x, y, z, 1.0));
            torusNormals.push(vec3(nx, ny, nz));
        }
    }

    // Create arrays for the final vertex and normal data
    var finalPoints = [];
    var finalNormals = [];

    // Generate triangle strips
    for (var i = 0; i < majorSegments; i++) {
        for (var j = 0; j < minorSegments; j++) {
            // Calculate indices for the current quad
            var current = i * (minorSegments + 1) + j;
            var next = current + 1;
            var bottom = (i + 1) * (minorSegments + 1) + j;
            var bottomNext = bottom + 1;

            // First triangle of the quad
            finalPoints.push(torusPoints[current]);
            finalPoints.push(torusPoints[next]);
            finalPoints.push(torusPoints[bottom]);
            
            finalNormals.push(torusNormals[current]);
            finalNormals.push(torusNormals[next]);
            finalNormals.push(torusNormals[bottom]);

            // Second triangle of the quad
            finalPoints.push(torusPoints[next]);
            finalPoints.push(torusPoints[bottomNext]);
            finalPoints.push(torusPoints[bottom]);
            
            finalNormals.push(torusNormals[next]);
            finalNormals.push(torusNormals[bottomNext]);
            finalNormals.push(torusNormals[bottom]);
        }
    }

    // Rest of your transformation functions remain the same
    torusData.Point = finalPoints;
    torusData.Normal = finalNormals;
    torusData.Translate = translate;
    torusData.Rotate = rotate;
    torusData.Scale = scale;

    return torusData;
}

function teacup(numSlices, numStacks, topRadius, bottomRadius) {
    var teacupPoints = [], teacupNormals = [], teacupData = {};
    var finalPoints = [], finalNormals = [];
    
    var slices = numSlices || 36;
    var stacks = numStacks || 20;
    
    var height = 0.5;

    // Generate vertices first
    for (var i = 0; i <= stacks; i++) {
        var t = i / stacks;
        var y = height * (t - 0.5);
        
        var currentRadius;
        if (i < stacks * 0.2) {
            currentRadius = bottomRadius + (t / 0.2) * (bottomRadius * 0.2);
        } else {
            var curve = Math.pow((t - 0.2) / 0.8, 0.5);
            currentRadius = bottomRadius * 1.2 + (topRadius - bottomRadius * 1.2) * curve;
        }

        for (var j = 0; j <= slices; j++) {
            var theta = (j * 2.0 * Math.PI) / slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            teacupPoints.push(vec4(currentRadius * cosTheta, y, currentRadius * sinTheta, 1.0));
            var nx = cosTheta;
            var ny = (i < stacks * 0.2) ? 0.1 : 0.2;
            var nz = sinTheta;
            var len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            teacupNormals.push(vec3(nx/len, ny/len, nz/len));
        }
    }

    // Create connected triangles
    for (var i = 0; i < stacks; i++) {
        for (var j = 0; j < slices; j++) {
            var first = i * (slices + 1) + j;
            var second = first + slices + 1;
            
            // First triangle
            finalPoints.push(teacupPoints[first]);
            finalPoints.push(teacupPoints[second]);
            finalPoints.push(teacupPoints[first + 1]);
            
            finalNormals.push(teacupNormals[first]);
            finalNormals.push(teacupNormals[second]);
            finalNormals.push(teacupNormals[first + 1]);

            // Second triangle
            finalPoints.push(teacupPoints[second]);
            finalPoints.push(teacupPoints[second + 1]);
            finalPoints.push(teacupPoints[first + 1]);
            
            finalNormals.push(teacupNormals[second]);
            finalNormals.push(teacupNormals[second + 1]);
            finalNormals.push(teacupNormals[first + 1]);
        }
    }

    // Add bottom surface
    var bottomY = -height/2;
    var centerPoint = vec4(0, bottomY, 0, 1.0);
    var bottomNormal = vec3(0, -1, 0);

    for (var i = 0; i < slices; i++) {
        var theta = (i * 2.0 * Math.PI) / slices;
        var nextTheta = ((i + 1) * 2.0 * Math.PI) / slices;
        
        var x1 = bottomRadius * Math.cos(theta);
        var z1 = bottomRadius * Math.sin(theta);
        var x2 = bottomRadius * Math.cos(nextTheta);
        var z2 = bottomRadius * Math.sin(nextTheta);

        finalPoints.push(centerPoint);
        finalPoints.push(vec4(x1, bottomY, z1, 1.0));
        finalPoints.push(vec4(x2, bottomY, z2, 1.0));
        
        finalNormals.push(bottomNormal);
        finalNormals.push(bottomNormal);
        finalNormals.push(bottomNormal);
    }

    teacupData.Point = finalPoints;
    teacupData.Normal = finalNormals;
    teacupData.Translate = translate;
    teacupData.Rotate = rotate;
    teacupData.Scale = scale;
    return teacupData;
}

/*-----------------------------------------------------------------------------------*/

function plate(outerRadius, innerRadius, height, numSegments) {
    var platePoints = [], plateNormals = [], plateData = {};
    var finalPoints = [], finalNormals = [];
    
    // Default values
    outerRadius = outerRadius || 0.8;
    innerRadius = innerRadius || 0.6;
    height = height || 0.1;
    numSegments = numSegments || 36;
    
    var rimHeight = height * 0.3;
    var centerDepth = -height * 0.2;
    var rimThickness = 0.05;

    // Generate the main plate surface with depression
    for (var i = 0; i <= numSegments; i++) {
        for (var j = 0; j <= 10; j++) {  // Radial segments
            var theta = (i * 2.0 * Math.PI) / numSegments;
            var r = (j / 10.0);  // Normalized radius from 0 to 1
            
            // Calculate position
            var x = r * outerRadius * Math.cos(theta);
            var z = r * outerRadius * Math.sin(theta);
            
            // Create depression curve
            var y;
            if (r < 0.8) {  // Inner area
                y = centerDepth * Math.pow(1 - r/0.8, 2);  // Quadratic curve for smooth depression
            } else {  // Rim area
                var t = (r - 0.8) / 0.2;  // Normalize t for rim
                y = centerDepth * Math.pow(1 - t, 2) + rimHeight * t;
            }

            // Calculate normal
            var nx = Math.cos(theta);
            var ny = 1.0;
            var nz = Math.sin(theta);
            if (r < 0.8) {
                ny = 4 * centerDepth * (1 - r/0.8) / (0.8 * outerRadius);
            }
            var len = Math.sqrt(nx*nx + ny*ny + nz*nz);

            platePoints.push(vec4(x, y, z, 1.0));
            plateNormals.push(vec3(nx/len, ny/len, nz/len));
        }
    }

    // Create triangles
    for (var i = 0; i < numSegments; i++) {
        for (var j = 0; j < 10; j++) {
            var first = i * 11 + j;
            var second = first + 11;
            
            // First triangle
            finalPoints.push(platePoints[first]);
            finalPoints.push(platePoints[second]);
            finalPoints.push(platePoints[first + 1]);
            
            finalNormals.push(plateNormals[first]);
            finalNormals.push(plateNormals[second]);
            finalNormals.push(plateNormals[first + 1]);

            // Second triangle
            finalPoints.push(platePoints[second]);
            finalPoints.push(platePoints[second + 1]);
            finalPoints.push(platePoints[first + 1]);
            
            finalNormals.push(plateNormals[second]);
            finalNormals.push(plateNormals[second + 1]);
            finalNormals.push(plateNormals[first + 1]);
        }
    }

    plateData.Point = finalPoints;
    plateData.Normal = finalNormals;
    plateData.Translate = translate;
    plateData.Rotate = rotate;
    plateData.Scale = scale;
    return plateData;
}

function createArrow(length, thickness) {
    var arrowPoints = [], arrowNormals = [], arrowData = {};
    
    // Default values
    length = length || 0.5;
    thickness = thickness || 0.02;
    
    // Create arrow shaft
    var shaftLength = length * 0.7;
    var headLength = length * 0.3;
    var headThickness = thickness * 3;
    
    // Arrow shaft vertices (as a thin box)
    var shaftVertices = [
        // Front face
        vec4(-thickness, -thickness, 0, 1.0),
        vec4(thickness, -thickness, 0, 1.0),
        vec4(thickness, thickness, 0, 1.0),
        vec4(-thickness, thickness, 0, 1.0),
        
        // Back face
        vec4(-thickness, -thickness, shaftLength, 1.0),
        vec4(thickness, -thickness, shaftLength, 1.0),
        vec4(thickness, thickness, shaftLength, 1.0),
        vec4(-thickness, thickness, shaftLength, 1.0),
    ];
    
    // Arrow head vertices (as a pyramid)
    var headVertices = [
        // Base
        vec4(-headThickness, -headThickness, shaftLength, 1.0),
        vec4(headThickness, -headThickness, shaftLength, 1.0),
        vec4(headThickness, headThickness, shaftLength, 1.0),
        vec4(-headThickness, headThickness, shaftLength, 1.0),
        // Tip
        vec4(0, 0, length, 1.0)
    ];
    
    // Add shaft faces
    for (var i = 0; i < shaftVertices.length; i++) {
        arrowPoints.push(shaftVertices[i]);
        arrowNormals.push(vec3(0, 0, 1));
    }
    
    // Add head faces
    for (var i = 0; i < headVertices.length; i++) {
        arrowPoints.push(headVertices[i]);
        arrowNormals.push(vec3(0, 0, 1));
    }
    
    arrowData.Point = arrowPoints;
    arrowData.Normal = arrowNormals;
    arrowData.Translate = translate;
    arrowData.Rotate = rotate;
    arrowData.Scale = scale;
    
    return arrowData;
}