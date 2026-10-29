import { useState } from 'react';
import { getErrorMessage } from '../api';
 
const empty = { name: '', jobTitle: '', salary: '', department: '' };
 
// The API returns department as an object { _id, name }; the <select> needs only the _id.
function toForm(employee) {
  if (!employee) return empty;
  return {
    name: employee.name,
    jobTitle: employee.jobTitle,
    salary: String(employee.salary),
    department: employee.department?._id || '',
  };
}
 
export default function EmployeeForm({ departments, initial, onSave, onCancel }) {
  const [form, setForm] = useState(toForm(initial));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
 
  // One handler for every input, thanks to the name attribute:
  // the input with name="salary" updates form.salary
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
 
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Inputs always give strings. Empty values -> undefined, so the server says "... is required"
      // ('' is not a valid ObjectId: Mongoose would answer "Cast to ObjectId failed" instead).
      await onSave({
        ...form,
        salary: form.salary === '' ? undefined : Number(form.salary),
        department: form.department || undefined,
      });
      if (!initial) setForm(empty); // after adding, clear the form
      setError('');
    } catch (err) {
      // The SERVER validates (Mongoose schema) and we just show its messages:
      // "Job title is required • Name must be at least 3 characters • Salary must be at least 1000"
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }
 
  return (
    <form className="form" onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="jobTitle" placeholder="Job title" value={form.jobTitle} onChange={handleChange} />
      <input name="salary" type="number" placeholder="Salary" value={form.salary} onChange={handleChange} />
      <select name="department" value={form.department} onChange={handleChange}>
        <option value="">Department…</option>
        {departments.map((d) => (
          <option key={d._id} value={d._id}>{d.name}</option>
        ))}
      </select>
      <div className="form-actions">
        <button type="submit" disabled={saving}>{initial ? 'Save changes' : 'Add'}</button>
        {initial && <button type="button" className="ghost" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
