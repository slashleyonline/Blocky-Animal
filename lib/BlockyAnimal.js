// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = ' \
  attribute vec4 a_Position; \
  uniform mat4 u_ModelMatrix; \
  uniform mat4 u_GlobalRotateMatrix; \
  void main() { \
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; \
  }'

// Fragment shader program
var FSHADER_SOURCE = ' \
  precision mediump float; \
  uniform vec4 u_FragColor; \
  void main() { \
    gl_FragColor = u_FragColor; \
  }';

let canvas
let gl
let a_Position
let u_FragColor

function main() {

  addActionsForHTMLUI()

  setUpWebGL()

  connectVariablesToGLSL()

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(tick)
}

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: true,
    alpha: false
  });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //enable blending for depth
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix')
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)
}

let g_currentColor
let g_globalAngleY = 0
let g_globalAngleX = 0
let g_thighAngle = 0
let g_shinAngle = 0

let g_startTime = performance.now() / 1000
let g_seconds = performance.now() / 1000-g_startTime

function tick() {
  g_seconds = performance.now() / 1000-g_startTime
  renderScene()
  requestAnimationFrame(tick)
}


function click(ev) {
  //needs to be repurposed for rotating the camera
}

function convertCoordinates(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x, y]
}

let g_shapesList = []

function renderScene() {
  
  let startTime = performance.now()

  let globalRotMat = new Matrix4().rotate(g_globalAngleY,0,1,0)
  globalRotMat.rotate(-g_globalAngleX, 1, 0, 0)
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT)

  /*var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render()
  }
  
  let body = new Cube()
  body.color = [1, 0, 0, 1]
  body.matrix.translate(0, -0.5, 0)
  //body.matrix.rotate(0, 0, 0, 1)
  body.matrix.scale(0.3,0.3,0.3)
  body.render()

  let thighBody = new Cube()
  thighBody.color = [1, 0, 0, 1]
    thighBody.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1)
  let jointMat = new Matrix4(thighBody.matrix)
  thighBody.matrix.translate(0,0,0)

  thighBody.matrix.scale(0.2,0.5,0.2)
  thighBody.render()

  let rotateBody = new Cube()
  rotateBody.matrix = jointMat
  rotateBody.color = [1, 0, 0, 1]
  rotateBody.matrix.translate(0,.25,0)
  rotateBody.matrix.rotate(g_shinAngle, 0, 0, 1)
  rotateBody.matrix.scale(0.2,0.5,0.2)
  rotateBody.render()
  */

  let duration = performance.now() - startTime

  //sendTextToHTML('numdot: ' + len + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000/duration) + ' total points: ' + g_shapesList.length, 'debug')
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID)

  if (!htmlElm) {
    console.log('Failed to get ' + htmlID + ' from HTML')
    return
  }
  htmlElm.innerHTML = text
}

function addActionsForHTMLUI() {
  
  document.getElementById('angleSlideY').addEventListener('input', function () { g_globalAngleY = this.value; renderScene()})
  document.getElementById('angleSlideX').addEventListener('input', function () { g_globalAngleX = this.value; renderScene()})
  document.getElementById('thighSlide').addEventListener('input', function () { g_thighAngle = this.value; renderScene()})
  document.getElementById('shinSlide').addEventListener('input', function () { g_shinAngle = this.value; renderScene()})

}