import type { StoryEventPosition } from "./StoryEventPosition";

export type StoryEvent = {
  id: string,
  date: string,
  title?: string,
  headline: string,
  summary: string,
  x: number,
  y: number,
  position: StoryEventPosition,
}