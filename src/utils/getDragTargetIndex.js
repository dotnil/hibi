export function getDragTargetIndex({
  currentIndex,
  draggedTop,
  slotOriginTop,
  slotStep,
  itemCount,
}) {
  const draggedCenter = draggedTop + slotStep / 2
  const currentSlotCenter = slotOriginTop + (currentIndex + 0.5) * slotStep
  let targetIndex = currentIndex

  if (draggedCenter > currentSlotCenter) {
    while (targetIndex < itemCount - 1) {
      const nextSlotCenter = slotOriginTop + (targetIndex + 1.5) * slotStep

      if (draggedCenter <= nextSlotCenter) { break }

      targetIndex += 1
    }
  } else if (draggedCenter < currentSlotCenter) {
    while (targetIndex > 0) {
      const previousSlotCenter = slotOriginTop + (targetIndex - 0.5) * slotStep

      if (draggedCenter >= previousSlotCenter) { break }

      targetIndex -= 1
    }
  }

  return targetIndex
}
