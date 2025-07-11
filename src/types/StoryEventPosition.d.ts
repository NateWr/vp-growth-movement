export enum StoryEventPositionOrigin {
  left,
  center,
  right,
}

export type StoryEventPosition = {
  origin: StoryEventPositionOrigin,
  offset: number,
}