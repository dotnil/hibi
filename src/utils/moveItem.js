export function moveItem(items, fromIndex, toIndex) {
  const reorderedItems = [...items]
  const [item] = reorderedItems.splice(fromIndex, 1)

  reorderedItems.splice(toIndex, 0, item)

  return reorderedItems
}
