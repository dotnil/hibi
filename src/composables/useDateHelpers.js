// Возвращает дату для позиции дня в неделе
// index=0 -> понедельник, index=6 -> сегодня
export function getDateForIndex(index) {
  const today = new Date()
  const day = new Date(today)
  day.setDate(today.getDate() - (6 - index))
  return day.toISOString().split('T')[0]
}
