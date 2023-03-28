import tinycolor from 'tinycolor2'

export const indexedColors = [
  '00000000', '00FFFFFF', '00FF0000', '0000FF00', '000000FF', // 0-4
  '00FFFF00', '00FF00FF', '0000FFFF', '00000000', '00FFFFFF', // 5-9
  '00FF0000', '0000FF00', '000000FF', '00FFFF00', '00FF00FF', // 10-14
  '0000FFFF', '00800000', '00008000', '00000080', '00808000', // 15-19
  '00800080', '00008080', '00C0C0C0', '00808080', '009999FF', // 20-24
  '00993366', '00FFFFCC', '00CCFFFF', '00660066', '00FF8080', // 25-29
  '000066CC', '00CCCCFF', '00000080', '00FF00FF', '00FFFF00', // 30-34
  '0000FFFF', '00800080', '00800000', '00008080', '000000FF', // 35-39
  '0000CCFF', '00CCFFFF', '00CCFFCC', '00FFFF99', '0099CCFF', // 40-44
  '00FF99CC', '00CC99FF', '00FFCC99', '003366FF', '0033CCCC', // 45-49
  '0099CC00', '00FFCC00', '00FF9900', '00FF6600', '00666699', // 50-54
  '00969696', '00003366', '00339966', '00003300', '00333300', // 55-59
  '00993300', '00993366', '00333399', '00333333'  // 60-63
]

// '#1F497D' => '#538DD5'  tint 0.39997558519241921

// MS excel's tint function expects that HLS is base 240. see:
// https://social.msdn.microsoft.com/Forums/en-US/e9d8c136-6d62-4098-9b1b-dac786149f43/excel-color-tint-algorithm-incorrect?forum=os_binaryfile#d3c2ac95-52e0-476b-86f1-e2a697f24969
const HLSMAX = 240
const RGBMAX = 0xFF

// rgb转换为hls
function rgb2hls(r: number, g: number, b: number) {
  const maxc = Math.max(r, g, b)
  const minc = Math.min(r, g, b)
  const sumc = (maxc + minc)
  const rangec = (maxc - minc)
  const l = sumc / 2.0
  let h, s
  if (minc == maxc) {
    return [0.0, l, 0.0]
  }
  if (l <= 0.5) {
    s = rangec / sumc
  } else {
    s = rangec / (2.0 - sumc)
  }
  const rc = (maxc - r) / rangec
  const gc = (maxc - g) / rangec
  const bc = (maxc - b) / rangec
  if (r == maxc) {
    h = bc - gc
  } else if (g === maxc) {
    h = 2.0 + rc - bc
  } else {
    h = 4.0 + gc - rc
  }
  h = (h / 6.0) % 1.0
  return [h, l, s]
}

/**
 * rgb转微软hls
 */
function rgb2MsHls(hex: string): number[] {
  if (hex.length > 6) {
    hex = hex.substring(2)
  }
  const red = parseInt(hex.slice(0, 2), 16) / RGBMAX
  const green = parseInt(hex.slice(2, 4), 16) / RGBMAX
  const blue = parseInt(hex.slice(4, 6), 16) / RGBMAX
  const [h, l, s] = rgb2hls(red, green, blue)
  return [Math.round(h * HLSMAX), Math.round(l * HLSMAX), Math.round(s * HLSMAX)]
}

function msHls2Rgb(hue: number, lightness: number, saturation: number): string {
  const color = tinycolor({ h: hue / HLSMAX * 360, s: saturation / HLSMAX, l: lightness / HLSMAX })
  return color.toHex().toUpperCase()
}

function tintLuminance(tint: number, lum: number): number {
  if (tint <= 0) {
    return Math.round(lum * (1.0 + tint))
  } else {
    return Math.round(lum * (1.0 - tint) + (HLSMAX - HLSMAX * (1.0 - tint)))
  }
}

// 计算色度转换后的颜色
export function getTintColor(hex: string, tint: number): string {
  if (!hex) return hex
  const [h, l, s] = rgb2MsHls(hex)
  return `FF${msHls2Rgb(h, tintLuminance(tint, l), s)}`
}
