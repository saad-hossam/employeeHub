import { useEffect, useState } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getErrorMessage } from '../api';
import DepartmentItem from '../components/DepartmentItem';
 
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]); // [] until the server answers
  const [name, setName] = useState(''); // the "new department" input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  // Load once when the page opens
  useEffect(() => {
    async function load() {
      try {
        setDepartments(await getDepartments());
      } catch (err) {
        setError(getErrorMessage(err)); // e.g. "Network Error" when the API is not running
      } finally {
        setLoading(false); // runs after success OR failure
      }
    }
    load();
  }, []);
 
  // CREATE
  async function handleAdd(e) {
    e.preventDefault(); // stop the browser from reloading the page
    try {
      const created = await createDepartment({ name });
      setDepartments([...departments, created]); // a NEW array (never push)
      setName('');
      setError('');
    } catch (err) {
      setError(getErrorMessage(err)); // 400 empty name, 409 duplicate
    }
  }
 
  // UPDATE: DepartmentItem calls this with the new name
  async function handleRename(id, newName) {
    const updated = await updateDepartment(id, { name: newName });
    // map() returns a NEW array: the changed department is replaced, the others stay
    setDepartments(departments.map((d) => (d._id === id ? updated : d)));
  }
 
  // DELETE
  async function handleDelete(department) {
    if (!window.confirm(`Delete ${department.name}?`)) return;
    try {
      await deleteDepartment(department._id);
      setDepartments(departments.filter((d) => d._id !== department._id));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err)); // 409 "Cannot delete: 2 employee(s) still in this department"
    }
  }
 
  if (loading) return <p className="muted">Loading departments…</p>;
 
  return (
    <section>
      <h2>Departments ({departments.length})</h2>
      {error && <p className="error">{error}</p>}
 
      <form className="row-form" onSubmit={handleAdd}>
        <input placeholder="New department name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Add</button>
      </form>
 
      <ul className="list">
        {departments.map((d) => (
          <DepartmentItem key={d._id} department={d} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </ul>
    </section>
  );
}
