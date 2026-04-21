export default function SessionForm() {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Create Session</h3>
      <div className="form-grid">
        <input className="input" placeholder="Session title" />
        <input className="input" type="date" />
        <input className="input" type="time" />
        <textarea className="textarea" rows="4" placeholder="Session note or agenda"></textarea>
        <button className="btn btn-primary">Schedule Session</button>
      </div>
    </div>
  );
}
