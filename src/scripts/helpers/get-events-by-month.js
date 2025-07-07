/**
 * Get an array of months with all events
 * in that month
 */
export const getEventsByMonth = (events, dateStart, dateEnd) => {
  let i = 0
  let iDate = new Date(dateStart)
  const months = []

  while (iDate <= dateEnd) {
    months.push({
      x: i,
      month: new Date(iDate),
      events: events
        .filter(event => {
          return event.date.getFullYear() === iDate.getFullYear()
            && event.date.getMonth() === iDate.getMonth()
        }),
    })
    if (iDate.getMonth() === 11) {
      iDate.setFullYear(iDate.getFullYear() + 1)
      iDate.setMonth(0)
    } else {
      iDate.setMonth(iDate.getMonth() + 1)
    }
    i++
  }

  return months
}