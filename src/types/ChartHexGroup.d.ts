import type { ChartHex } from "./ChartHex";

export type ChartHexGroup = {
  id: string,
  hexes: ChartHex[],
  style?: object,
}