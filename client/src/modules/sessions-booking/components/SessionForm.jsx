export default function SessionForm() {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Create Session</h3>
      <div className="form-grid">
        <input className="input" placeholder="Enter a descriptive session title" />
        <input className="input" type="date" title="Select the session date" placeholder="Select date" />
        <input className="input" type="time" title="Select the session start time" placeholder="Select time" />
        <textarea className="textarea" rows="4" placeholder="Add session notes, key topics, or agenda items (optional)"></textarea>
        <button className="btn btn-primary">Schedule Session</button>
      </div>
    </div>
  );
}
