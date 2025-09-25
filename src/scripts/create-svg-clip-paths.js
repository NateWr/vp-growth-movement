/**
 * Converts svg paths for use as responsive <clipPath> paths
 *
 * To make the clip path scale with its containing box, the
 * path has to be defined as a range between 0.0 and 1.0 and
 * the resulting path has to set clipPathUnits="objectBoundingBox"
 *
 * Example:
 *
 * <clipPath id="panel-bg-2" clipPathUnits="objectBoundingBox">
 *  <path d="..." />
 * </clipPath>
 *
 * This script will convert an original path's `d` coords to
 * the 0.0-1.0 range, based on the original SVG's width/height.
 *
 * NOTE: not all paths include a M at the start and a Z at the end.
 * Adjust the script below based on that.
 */
const path = "M1300 0H0V330.99L10.0814 328.69H99.2813C109.019 328.69 103.57 333.52 116.027 328.69C128.495 323.86 126.935 324.66 134.723 324.66C142.512 324.66 129.264 328.69 156.148 328.69H373.1C384.787 328.69 369.59 321.44 391.795 328.69C414 335.94 423.738 335.13 431.137 335.13H447.883C462.289 335.13 464.239 341.58 475.536 335.13C486.834 328.69 492.283 332.71 502.8 328.69C513.318 324.66 517.987 324.66 528.505 324.66C539.022 324.66 667.163 328.69 690.928 328.69H725.59C735.718 328.69 851.432 335.13 862.879 335.13C874.327 335.13 873.107 334.27 884.804 331.48C896.502 328.69 903.81 332.72 915.497 328.69C934.983 324.66 1074.34 341.97 1087.57 338.55C1100.82 335.13 1105.43 335.13 1122.69 335.13H1169.2C1173.21 335.13 1175.01 334.8 1187.02 332.01C1199.03 329.22 1206.78 324.66 1223.73 324.66H1300V0Z"
const width = 1300
const height = 339

const round = (number, decimals) => {
  const base = 10 ** decimals
  return Math.round(number * base) / base
}

const convertToPercentFloat = (path, width, height) => {
  return path
    .replace('M', '')
    .replace('Z', '')
    .split('L')
    .map(l => l.split('C')
      .map(l => l.split('H')
        .map(l => l.split('V')
          .map(c => c.split(' ')
            .map((coord, i) => {
              coord = parseFloat(coord)
              if (i % 2) {
                return round(coord / height, 4)
              }
              return round(coord / width, 4)
            })
            .join(' '))
          .join('V'))
        .join('H'))
      .join('C'))
    .join('L')
    .replace(/^/, 'M')
    + 'Z'
}

const newPath = convertToPercentFloat(path, width, height)

console.log(newPath)