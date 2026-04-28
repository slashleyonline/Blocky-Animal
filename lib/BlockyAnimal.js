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
  canvas.onmousedown = click
  canvas.onmousemove = click

  connectVariablesToGLSL()

  // Specify the color for clearing <canvas>
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

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
let g_zoom = 0.5

const ORANGE = [ 0.7, 0.3, 0, 1]

let g_startTime = performance.now() / 1000
let g_seconds = performance.now() / 1000-g_startTime

function tick() {
  g_seconds = performance.now() / 1000-g_startTime
  renderScene()
  requestAnimationFrame(tick)
}

let prevX = 0
let prevY = 0

function click(ev) {
  //needs to be repurposed for rotating the camera
  let [x,y] = convertCoordinates(ev)
  if (ev.buttons != 1) {
    return
  }
  g_globalAngleY += (ev.movementX * 0.5)
  g_globalAngleX += (ev.movementY * 0.2)

}

function convertCoordinates(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x, y]
}

let g_walkingThighs = true
let g_walkingShins = true
let g_torsoSway = true
let g_tailSway = true
let g_neckSway = true
let g_jawSway = true
let g_lick = false

let g_torsoAnim = 0

let g_thighAnim1 = 0
let g_thighAnim2 = 0
let g_thighAnim3 = 0
let g_thighAnim4 = 0

let g_shinAnim1 = 0
let g_shinAnim2 = 0
let g_shinAnim3 = 0
let g_shinAnim4 = 0

let g_neckLickOffset = 0
let g_neck2LickOffset = 0
let g_headLickOffset = 0
let g_tongueScale = 0

let g_tailAnim = 0
let g_neckAnim = 0
let g_tongueAnim = 0
let g_jawAnim = 0

let g_neckAngle = 0

function updateAnims() {
  const thighAnimOffset1 = 0
  const thighAnimOffset2 = 9
  const thighAnimOffset3 = 24
  const thighAnimOffset4 = 34

  const shinAnimOffset1 = 0
  const shinAnimOffset2 = 30
  const shinAnimOffset3 = 10
  const shinAnimOffset4 = 15

  let neckIntensity = 1
  let jawIntensity = 1
  let tongueIntensity = 1

  const THIGH_AMP = 14
  const SHIN_AMP = 12
  const THIGH_OFFSET = 10

  if (g_walkingThighs) {
    g_thighAnim1 = (Math.sin(g_seconds + thighAnimOffset1) * THIGH_AMP + THIGH_OFFSET)
    g_thighAnim2 = (Math.sin(g_seconds + thighAnimOffset2) * THIGH_AMP + THIGH_OFFSET)
    g_thighAnim3 = (Math.sin(g_seconds + thighAnimOffset3) * THIGH_AMP + THIGH_OFFSET)
    g_thighAnim4 = (Math.sin(g_seconds + thighAnimOffset4) * THIGH_AMP + THIGH_OFFSET)
  }
  else {
    g_thighAnim1 = 0
    g_thighAnim2 = 0
    g_thighAnim3 = 0
    g_thighAnim4 = 0
  }
  if (g_lick) {
    neckIntensity = 3
    tongueIntensity = 2
    g_neckLickOffset = 1
    g_neck2LickOffset = 1
    g_headLickOffset = 1
    g_tongueScale = 1

  }

  if (g_walkingShins) {
    g_shinAnim1 = Math.cos(g_seconds + shinAnimOffset1) * SHIN_AMP - THIGH_OFFSET
    g_shinAnim2 = Math.cos(g_seconds + shinAnimOffset2) * SHIN_AMP - THIGH_OFFSET
    g_shinAnim3 = Math.cos(g_seconds + shinAnimOffset3) * SHIN_AMP - THIGH_OFFSET
    g_shinAnim4 = Math.cos(g_seconds + shinAnimOffset4) * SHIN_AMP - THIGH_OFFSET
  }
  else {
    g_shinAnim1 = 0
    g_shinAnim2 = 0
    g_shinAnim3 = 0
    g_shinAnim4 = 0
  }
  if (g_torsoSway) {
    g_torsoAnim = Math.sin(g_seconds) * 0.025
  }
  else {
    g_torsoAnim = 0
  }
  if (g_tailSway) {
    g_tailAnim = Math.sin(g_seconds) * 10
  }
  else {
    g_tailAnim = 0
  }
  if (g_neckSway) {
    g_neckAnim = Math.sin(g_seconds) * 2 * neckIntensity -50
  }
  else {
    g_neckAnim = -50
  }
  if (g_jawSway) {
    g_jawAnim = Math.sin(g_seconds) * 10 * jawIntensity
    g_tongueAnim = Math.sin(g_seconds) * 10 * tongueIntensity
  }
  else {
    g_tongueAnim = 0
    g_jawAnim = 0
  }
  /*
  else {

  }*/

}



function renderScene() {  
  let startTime = performance.now()

  updateAnims()

  let globalRotMat = new Matrix4().rotate(g_globalAngleY,0,1,0)
  globalRotMat.rotate(-g_globalAngleX, 1, 0, 0)
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT)
  
  let torso = new Cube()
  torso.color = ORANGE
  torso.matrix.rotate(g_torsoSway, 1, 0, 0)
  torso.matrix.scale(g_zoom,g_zoom,g_zoom)
  torso.matrix.translate(0.5, 0, 0)
  torso.matrix.translate(0, g_torsoAnim,0)


  let torsoJoint = new Matrix4(torso.matrix)
  let torsoJoint2 = new Matrix4(torso.matrix)
  let torsoJoint3 = new Matrix4(torso.matrix)
  let torsoJoint4 = new Matrix4(torso.matrix)

  let neckJoint = new Matrix4(torso.matrix)

  let humpJoint = new Matrix4(torso.matrix)

  let tailJoint = new Matrix4(torso.matrix)
  torsoJoint.translate(0,0.2,0)
  torso.matrix.scale(0.7,0.3,0.4)

  //thigh bone

  let thigh = new Cube()
  thigh.matrix = torsoJoint
  thigh.color = ORANGE

  torsoJoint.translate(0.3,-.4,-0.15)
  torsoJoint.rotate(g_thighAnim1, 0, 0, 1)
  torsoJoint.rotate(g_thighAngle, 0, 0, 1)

  torsoJoint.translate(0,-0.15,0)
  let thighJoint = new Matrix4(thigh.matrix)
  
  torsoJoint.scale(0.1,0.4,0.1)

  //shin bone

  let shin = new Cube()
  shin.matrix = thighJoint
  shin.color = ORANGE


  thighJoint.translate(0,-0.25, 0)
  thighJoint.rotate(g_shinAnim1, 0, 0, 1)
  thighJoint.rotate(g_shinAngle, 0, 0, 1)

  thighJoint.translate(0,-0.15, 0)
  let shinJoint = new Matrix4(shin.matrix)
  thighJoint.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof = new Cube()
  hoof.color = ORANGE
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
  torsoJoint2.rotate(g_thighAnim2, 0, 0, 1)
  torsoJoint2.rotate(g_thighAngle, 0, 0, 1)

  torsoJoint2.translate(0,-0.15,0)
  let thighJoint2 = new Matrix4(thigh2.matrix)
  
  torsoJoint2.scale(0.1,0.4,0.1)

  //shin bone

  let shin2 = new Cube()
  shin2.matrix = thighJoint2
  shin2.color = ORANGE


  thighJoint2.translate(0,-0.25, 0)
  thighJoint2.rotate(g_shinAnim2, 0, 0, 1)
  thighJoint2.rotate(g_shinAngle, 0, 0, 1)

  thighJoint2.translate(0,-0.15, 0)
  let shinJoint2 = new Matrix4(shin2.matrix)
  thighJoint2.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof2 = new Cube()
  hoof2.color = ORANGE
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
  torsoJoint3.rotate(g_thighAnim3 + g_thighAngle, 0, 0, 1)
  torsoJoint3.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint3.translate(0,-0.15,0)
  let thighJoint3 = new Matrix4(thigh3.matrix)
  
  torsoJoint3.scale(0.1,0.4,0.1)

  //shin bone

  let shin3 = new Cube()
  shin3.matrix = thighJoint3
  shin3.color = ORANGE


  thighJoint3.translate(0,-0.25, 0)
  thighJoint3.rotate(g_shinAnim3, 0, 0, 1)
  thighJoint3.rotate(g_shinAngle, 0, 0, 1)

  thighJoint3.translate(0,-0.15, 0)
  let shinJoint3 = new Matrix4(shin3.matrix)
  thighJoint3.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof3 = new Cube()
  hoof3.color = ORANGE
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

  torsoJoint4.translate(0.3,-.4,0.05)
  torsoJoint4.rotate(g_thighAnim4, 0, 0, 1)
  torsoJoint4.rotate(g_thighAngle, 0, 0, 1)
  torsoJoint4.translate(0,-0.15,0)
  let thighJoint4 = new Matrix4(thigh4.matrix)
  
  torsoJoint4.scale(0.1,0.4,0.1)

  //shin bone
  let shin4 = new Cube()
  shin4.matrix = thighJoint4
  shin4.color = ORANGE


  thighJoint4.translate(0,-0.25, 0)
  thighJoint4.rotate(g_shinAnim4, 0, 0, 1)
  thighJoint4.rotate(g_shinAngle, 0, 0, 1)

  thighJoint4.translate(0,-0.15, 0)
  let shinJoint4 = new Matrix4(shin4.matrix)
  thighJoint4.scale(0.1,0.4,0.1)

  //hoof bone

  let hoof4 = new Cube()
  hoof4.color = ORANGE
  hoof4.matrix = shinJoint4


  shinJoint4.translate(0,-0.15, 0)
  shinJoint4.rotate(0, 0, 0 ,1)
  shinJoint4.scale(0.15,0.15,0.15)


  thigh4.render()
  shin4.render()
  hoof4.render()

  //neck
  let neck = new Cube()
  neck.color = ORANGE
  neck.matrix = neckJoint


  neckJoint.translate(-.4,-0.05,0)
  neckJoint.rotate(300 + g_neckAngle, 0, 0, 1)
  let neckJoint2 = new Matrix4(neckJoint)
  neckJoint.scale(0.15, 0.4, 0.15)

  let neck2 = new Cube()
  neck2.color = ORANGE

  neck2.matrix = neckJoint2
  neckJoint2.translate(0.25 * g_neck2LickOffset,-0.25 * g_neck2LickOffset,0)

  neckJoint2.translate(-0.27, -0.125, 0)
  neckJoint2.rotate(90,0,0,1)
  neck2.matrix.rotate(((85 * g_neck2LickOffset)), 0, 0, 1)
  let headJoint = new Matrix4(neckJoint2)

  neckJoint2.scale(0.15,0.4,0.15)
  
  neck.render()
  neck2.render()

  //head
  let head = new Cube()
  head.color = ORANGE
  head.matrix = headJoint

  headJoint.translate(-0.05,0.25,0)
  headJoint.rotate(-30 - (50 * g_headLickOffset), 0, 0, 1)
  snoutJoint = new Matrix4(headJoint)
  headJoint.scale(0.3, 0.25, 0.3)

  head.render()

  //snout top
  let snoutTop = new Cube()
  snoutTop.color = ORANGE
  snoutTop.matrix = snoutJoint

  //snout bottom
  let snoutBottom = new Cube()
  snoutBottom.color = ORANGE
  snoutBottom.matrix = snoutJoint

  snoutJoint.translate(-0.2, -0.05, 0)
  snoutJoint.rotate(10, 0, 0, 1)
  
  let snoutJoint2 = new Matrix4(snoutJoint)
  let tongueJoint = new Matrix4(snoutJoint2)
  snoutJoint2.translate(0.03,-0.1, 0)

  snoutJoint2.rotate(g_jawAnim + 45,0,0,1)

  snoutJoint.scale(0.25,0.1,0.3)
  snoutJoint2.scale(0.25,0.1,0.3)

  snoutBottom.matrix = snoutJoint2

  snoutTop.render()
  snoutBottom.render()
  //tongue

  let tongue = new Cube()
  tongue.matrix = tongueJoint
  tongue.color = [5, .3, .55, 1]

  let eyeJoint = new Matrix4(tongueJoint)

  tongueJoint.rotate(g_tongueAnim + 35, 0, 0, 1)
  tongueJoint.scale(0.3 + (0.1 * g_tongueScale), 0.05, 0.2)

  tongueJoint.translate(0,-1,0)

  tongue.render()

  //eyes

  let eye1 = new Cube()
  let eye2 = new Cube()

  eye1.color = [0,0,0]
  eye2.color = [0,0,0]
  
  eye1.matrix = eyeJoint

  eyeJoint.scale(0.1,0.05,0.1)
  let eyeJoint2 = new Matrix4(eyeJoint)
  eye2.matrix = eyeJoint2

  eyeJoint.translate(1,2,1.2)
  eyeJoint2.translate(1,2,-1.2)
  eye1.render()
  eye2.render()

  // hump

  let hump = new Pyramid()
  hump.color = ORANGE
  hump.matrix = humpJoint

  let humpJoint2 = new Matrix4(humpJoint)
  
  humpJoint.scale(0.3,0.4,0.4)
  humpJoint.translate(-0.65,0.8,0)
  hump.render()

  let hump2 = new Pyramid()
  hump2.color = ORANGE
  hump2.matrix = humpJoint2

  humpJoint2.scale(0.45,0.6,0.4)
  humpJoint2.translate(.25,0.7,0)

  hump2.render()
  //tail

  let tail1 = new Cube()
  tail1.color = ORANGE
  tail1.matrix = tailJoint
  tailJoint.rotate(-60,0,0,1)
  tailJoint.rotate(g_tailAnim, 0, 1, 0)
  tailJoint.scale(0.6, 0.1, 0.1)
  tailJoint.translate(0.6,3,0)

  tail1.render()

  let duration = performance.now() - startTime

  sendTextToHTML(' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(1000/duration), 'debug')
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
  
  document.getElementById('thighSlide').addEventListener('input', function () { g_thighAngle = this.value; renderScene()})
  document.getElementById('shinSlide').addEventListener('input', function () { g_shinAngle = this.value; renderScene()})
  document.getElementById('neckSlide').addEventListener('input', function () { g_neckAngle = this.value; renderScene()})


  document.getElementById('zoom').addEventListener('input', function () { g_zoom = this.value / 100; renderScene()})

  document.getElementById('animWalk').addEventListener('mousedown', function () { g_walkingThighs = true; g_walkingShins = true;})
  document.getElementById('animWalkOff').addEventListener('mousedown', function () { g_walkingThighs = false; g_walkingShins = false;})

  document.getElementById('animBreathe').addEventListener('mousedown', function () { g_neckSway = true; g_jawSway = true;})
  document.getElementById('animBreatheOff').addEventListener('mousedown', function () { g_neckSway = false; g_jawSway = false;})


  document.getElementById('animSway').addEventListener('mousedown', function () { g_torsoSway = true; g_tailSway = true;})
  document.getElementById('animSwayOff').addEventListener('mousedown', function () {g_torsoSway = false; g_tailSway = false})


}