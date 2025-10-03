import * as React from 'react'

export function useBottomAnchor<T extends HTMLElement>() {
  const containerRef = React.useRef<T | null>(null)
  const anchorRef = React.useRef<HTMLDivElement | null>(null)

  const isNearBottom = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return true
    const threshold = 120
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      anchorRef.current?.scrollIntoView({ behavior, block: 'end' })
    },
    [],
  )

  return { containerRef, anchorRef, isNearBottom, scrollToBottom }
}
