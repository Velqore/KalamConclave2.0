function AttendeeTable({ attendees, onTogglePayment, onToggleAttendance }) {
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
            <th className="px-3 py-3">UTR ID</th>
            <th className="px-3 py-3">Payment</th>
            <th className="px-3 py-3">Attendance</th>
            <th className="px-3 py-3">Registered At</th>
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
              <td className="px-3 py-3">{attendee.utr_id}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendeeTable
