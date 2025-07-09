/**
 * Base configuration of the hex polygons
 * and grid layout for the chart
 */

// Draw points for the polygon
const points = [
  [3.5, 0],
  [7, 2],
  [7, 6],
  [3.5, 8],
  [0, 6],
  [0, 2],
]

// [width, height] of the polygon
const size = [
  points.map(([x, y]) => x).sort().reverse()[0],
  points.map(([x, y]) => y).sort().reverse()[0],
]

// [width, height] of the layout grid
// (ie - total size of space alotted to each hex
// in the grid)
const gridSize = [
  size[0] + 2,
  size[1]
]

export default {
  points,
  size,
  gridSize,
}