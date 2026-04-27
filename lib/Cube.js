class Cube {
  constructor () {
    this.type = 'cube'
    this.position = [0.0, 0.0, 0.0]
    this.color = [1.0, 1.0, 1.0]

    this.matrix = new Matrix4()
  }

  render(M) {
    var rgba = this.color;

    if (M !== undefined) {
      this.matrix = M
    }

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements)
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5,0-0.5,0.5])
    drawTriangle3D([-0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5])

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
    drawTriangle3D([-0.5,-0.5,0.5, -0.5,-0.5,-0.5, -0.5 ,0.5,-0.5])
    drawTriangle3D([-0.5,-0.5,0.5, -0.5,0.5,0.5, -0.5 ,0.5,-0.5])

    gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
    drawTriangle3D([0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5 ,0.5,-0.5])
    drawTriangle3D([0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5 ,0.5,-0.5])

    gl.uniform4f(u_FragColor, rgba[0] * 0.3, rgba[1] * 0.3, rgba[2 * 0.3], rgba[3]);
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,0-0.5,-0.5])
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5])

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([-0.5,0.5,0.5, -0.5,0.5,-0.5, 0.5,0.5, 0.5])
    drawTriangle3D([-0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5, 0.5])

    gl.uniform4f(u_FragColor, rgba[0] * 0.3, rgba[1] * 0.3, rgba[2 * 0.3], rgba[3]);
    drawTriangle3D([-0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5, 0.5])
    drawTriangle3D([-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5, 0.5])
  }

}