export type TaskBusEvent = {
  type: 'tasks-changed'
}

const CHANNEL_NAME = 'chask-task-channel'

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null

export function emitTaskChanged() {
  channel?.postMessage({ type: 'tasks-changed' } satisfies TaskBusEvent)
}

export function subscribeToTasks(handler: () => void) {
  if (!channel) return () => {}
  const listener = (event: MessageEvent<TaskBusEvent>) => {
    if (event.data.type === 'tasks-changed') {
      handler()
    }
  }
  channel.addEventListener('message', listener)
  return () => channel.removeEventListener('message', listener)
}
