// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = ' \
  attribute vec4 a_Position; \
  uniform mat4 u_ModelMatrix; \
  uniform mat4 u_GlobalRotateMatrix; \
  uniform float u_Scale; \
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

const ORANGE = [ 0.6, 0.2, 0, 1]

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
  }*/
  
  let torso = new Cube()
  torso.color = [ 0.6, 0.2, 0, 1]

  let torsoJoint = new Matrix4(torso.matrix)
  let torsoJoint2 = new Matrix4(torso.matrix)
  let torsoJoint3 = new Matrix4(torso.matrix)
  let torsoJoint4 = new Matrix4(torso.matrix)

  torsoJoint.translate(0,0.2,0)
  torso.matrix.scale(0.7,0.3,0.4)

  //thigh bone


  let thigh = new Cube()
  thigh.matrix = torsoJoint
  thigh.color = ORANGE

  torsoJoint.translate(0.3,-.4,-0.15)
  torsoJoint.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint.translate(0,-0.15,0)
  let thighJoint = new Matrix4(thigh.matrix)
  
  torsoJoint.scale(0.1,0.4,0.1)

  //shin bone

  let shin = new Cube()
  shin.matrix = thighJoint
  shin.color = ORANGE


  thighJoint.translate(0,-0.25, 0)
  thighJoint.rotate(g_shinAngle, 0, 0, 1)

  thighJoint.translate(0,-0.15, 0)
  let shinJoint = new Matrix4(shin.matrix)
  thighJoint.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof = new Cube()
  hoof.color = [0.2,0.2,0.2,1]
  hoof.matrix = shinJoint


  shinJoint.translate(0,-0.15, 0)
  shinJoint.rotate(0, 0, 0 ,1)
  shinJoint.scale(0.15,0.15,0.15)


  torso.render()
  thigh.render()
  shin.render()
  hoof.render()

  //leg 2
  
  torsoJoint2.translate(0,0.2,0)

 //thigh bone


  let thigh2 = new Cube()
  thigh2.matrix = torsoJoint2
  thigh2.color = ORANGE

  torsoJoint2.translate(0.3,-.4,0.15)
  torsoJoint2.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint2.translate(0,-0.15,0)
  let thighJoint2 = new Matrix4(thigh2.matrix)
  
  torsoJoint2.scale(0.1,0.4,0.1)

  //shin bone

  let shin2 = new Cube()
  shin2.matrix = thighJoint2
  shin2.color = ORANGE


  thighJoint2.translate(0,-0.25, 0)
  thighJoint2.rotate(g_shinAngle, 0, 0, 1)

  thighJoint2.translate(0,-0.15, 0)
  let shinJoint2 = new Matrix4(shin2.matrix)
  thighJoint2.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof2 = new Cube()
  hoof2.color = [0.2,0.2,0.2,1]
  hoof2.matrix = shinJoint2


  shinJoint2.translate(0,-0.15, 0)
  shinJoint2.rotate(0, 0, 0 ,1)
  shinJoint2.scale(0.15,0.15,0.15)


  thigh2.render()
  shin2.render()
  hoof2.render()

  //leg 3

  torsoJoint3.translate(-0.5,0.2,0)

  //thigh bone


  let thigh3 = new Cube()
  thigh3.matrix = torsoJoint3
  thigh3.color = ORANGE

  torsoJoint3.translate(0.3,-.4,0.15)
  torsoJoint3.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint3.translate(0,-0.15,0)
  let thighJoint3 = new Matrix4(thigh3.matrix)
  
  torsoJoint3.scale(0.1,0.4,0.1)

  //shin bone

  let shin3 = new Cube()
  shin3.matrix = thighJoint3
  shin3.color = ORANGE


  thighJoint3.translate(0,-0.25, 0)
  thighJoint3.rotate(g_shinAngle, 0, 0, 1)

  thighJoint3.translate(0,-0.15, 0)
  let shinJoint3 = new Matrix4(shin3.matrix)
  thighJoint3.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof3 = new Cube()
  hoof3.color = [0.2,0.2,0.2,1]
  hoof3.matrix = shinJoint3


  shinJoint3.translate(0,-0.15, 0)
  shinJoint3.rotate(0, 0, 0 ,1)
  shinJoint3.scale(0.15,0.15,0.15)


  thigh3.render()
  shin3.render()
  hoof3.render()

  torsoJoint3.translate(0,0.2,0)

  // leg 4

  torsoJoint4.translate(-0.5,0.2,-0.2)

  //thigh bone


  let thigh4 = new Cube()
  thigh4.matrix = torsoJoint4
  thigh4.color = ORANGE

  torsoJoint4.translate(0.3,-.4,0.15)
  torsoJoint4.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint4.translate(0,-0.15,0)
  let thighJoint4 = new Matrix4(thigh4.matrix)
  
  torsoJoint4.scale(0.1,0.4,0.1)

  //shin bone

  let shin4 = new Cube()
  shin4.matrix = thighJoint4
  shin4.color = ORANGE


  thighJoint4.translate(0,-0.25, 0)
  thighJoint4.rotate(g_shinAngle, 0, 0, 1)

  thighJoint4.translate(0,-0.15, 0)
  let shinJoint4 = new Matrix4(shin4.matrix)
  thighJoint4.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof4 = new Cube()
  hoof4.color = [0.2,0.2,0.2,1]
  hoof4.matrix = shinJoint4


  shinJoint4.translate(0,-0.15, 0)
  shinJoint4.rotate(0, 0, 0 ,1)
  shinJoint4.scale(0.15,0.15,0.15)


  thigh4.render()
  shin4.render()
  hoof4.render()

 


  let duration = performance.now() - startTime

  sendTextToHTML(' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000/duration) + ' total points: ' + g_shapesList.length, 'debug')
}

function buildCamelLeg() {
  
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

  document.getElementById('zoom').addEventListener('input', function () { g_shinAngle = this.value; renderScene()})

}