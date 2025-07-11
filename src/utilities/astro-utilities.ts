import { getCollection } from "astro:content"

export const astroGetSortedStories = async () => {
  return (await getCollection('stories'))
	  .sort((a, b) => a.data.order - b.data.order)
}

export const astroGetAdjacentStories = async (storyId: string) => {
  const stories = await astroGetSortedStories()
  const currentIndex = stories.findIndex(s => s.id === storyId)
  const nextStory = currentIndex < stories.length - 1
    ? stories[currentIndex + 1]
    : null
  const lastStory = currentIndex
    ? stories[currentIndex - 1]
    : null
  return { nextStory, lastStory }
}