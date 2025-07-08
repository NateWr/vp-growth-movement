import { EventSource } from "./EventSource"

export type Event = {
  id: string,
  date: string,
  area: string[],
  campaign: string[],
  headline: string,
  summary: string,
  city: string,
  country: string[],
  region: string[],
  target: string[],
  sources: EventSource[],
  x: number,
  y: number,
}