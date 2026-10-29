import { useState } from 'react';
import { getErrorMessage } from '../api';
 
export default function DepartmentItem({ department, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(department.name);
  const [error, setError] = useState('');
 
  async function handleSave() {
    try {
      await onRename(department._id, name); // the parent calls the API and updates the list
      setEditing(false);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err)); // empty name -> 400, duplicate -> 409
    }
  }
 
  function handleCancel() {
    setName(department.name); // throw away what was typed
    setEditing(false);
    setError('');
  }
 
  // Two different looks for the same item, chosen by state
  if (editing) {
    return (
      <li className="item">
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <button onClick={handleSave}>Save</button>
        <button className="ghost" onClick={handleCancel}>Cancel</button>
        {error && <p className="error">{error}</p>}
      </li>
    );
  }
 
  return (
    <li className="item">
      <strong>{department.name}</strong>
      <button className="ghost" onClick={() => setEditing(true)}>Rename</button>
      {/* An arrow function: onDelete runs on click, not during render */}
      <button className="ghost danger" onClick={() => onDelete(department)}>Delete</button>
    </li>
  );
}
