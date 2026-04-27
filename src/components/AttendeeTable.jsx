import { SUB_EVENTS } from '../config/subEvents'

function AttendeeTable({ attendees, onTogglePayment, onToggleAttendance, onEdit, onDelete, onViewPass }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-blue-900">
      <table className="min-w-full divide-y divide-blue-900 text-left text-sm">
        <thead className="bg-blue-950/70 text-slate-300">
          <tr>
            <th className="px-3 py-3">Reg ID</th>
            <th className="px-3 py-3">Name</th>
            <th className="px-3 py-3">Email</th>
            <th className="px-3 py-3">Phone</th>
            <th className="px-3 py-3">College</th>
            <th className="px-3 py-3">City</th>
            <th className="px-3 py-3">Events</th>
            <th className="px-3 py-3">Role</th>
            <th className="px-3 py-3">UTR ID</th>
            <th className="px-3 py-3">Screenshot</th>
            <th className="px-3 py-3">Payment</th>
            <th className="px-3 py-3">Attendance</th>
            <th className="px-3 py-3">Registered At</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-950 bg-navyLight/40">
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td className="px-3 py-3">{attendee.reg_id}</td>
              <td className="px-3 py-3">{attendee.full_name}</td>
              <td className="px-3 py-3">{attendee.email}</td>
              <td className="px-3 py-3">{attendee.phone}</td>
              <td className="px-3 py-3">{attendee.college}</td>
              <td className="px-3 py-3">{attendee.city}</td>
              <td className="px-3 py-3">
                {Array.isArray(attendee.selected_events) && attendee.selected_events.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {attendee.selected_events.map((evId) => {
                      const ev = SUB_EVENTS.find((e) => e.id === evId)
                      return ev ? (
                        <span
                          key={evId}
                          className="rounded px-1.5 py-0.5 text-[0.6rem] font-semibold text-white"
                          style={{ background: ev.gradientFrom }}
                        >
                          {ev.icon} {ev.name}
                        </span>
                      ) : null
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                {attendee.debate_topic
                  ? <span className="rounded bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-300">{attendee.debate_topic}</span>
                  : <span className="text-slate-500">—</span>}
              </td>
              <td className="px-3 py-3">{attendee.utr_id}</td>
              <td className="px-3 py-3">
                {attendee.payment_screenshot_url ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-emerald-300">Uploaded</span>
                    <a
                      className="text-xs text-electricBlue underline"
                      href={attendee.payment_screenshot_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-rose-300">Not uploaded</span>
                )}
              </td>
              <td className="px-3 py-3">
                <button
                  className={`rounded px-3 py-1 text-xs font-semibold ${
                    attendee.payment_status === 'verified'
                      ? 'bg-emerald-600/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                  onClick={() => onTogglePayment(attendee)}
                  type="button"
                >
                  {attendee.payment_status}
                </button>
              </td>
              <td className="px-3 py-3">
                <button
                  className={`rounded px-3 py-1 text-xs font-semibold ${
                    attendee.attendance
                      ? 'bg-emerald-600/20 text-emerald-300'
                      : 'bg-slate-500/20 text-slate-200'
                  }`}
                  onClick={() => onToggleAttendance(attendee)}
                  type="button"
                >
                  {attendee.attendance ? 'Present' : 'Absent'}
                </button>
              </td>
              <td className="px-3 py-3">
                {new Date(attendee.created_at).toLocaleString()}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-300"
                    onClick={() => onViewPass(attendee)}
                    type="button"
                  >
                    Pass
                  </button>
                  <button
                    className="rounded bg-electricBlue/20 px-3 py-1 text-xs font-semibold text-electricBlue"
                    onClick={() => onEdit(attendee)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded bg-rose-600/20 px-3 py-1 text-xs font-semibold text-rose-300"
                    onClick={() => onDelete(attendee)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendeeTable
