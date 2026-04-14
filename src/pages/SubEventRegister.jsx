import { Navigate, useParams } from 'react-router-dom'
import { getSubEvent } from '../config/subEvents'

function SubEventRegister() {
  const { eventId } = useParams()
  const subEvent = getSubEvent(eventId)

  if (!subEvent) {
    return <Navigate to="/register" replace />
  }

  return <Navigate to={`/register?event=${subEvent.id}`} replace />
}

export default SubEventRegister
