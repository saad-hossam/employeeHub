import { useEffect, useState } from 'react';
import { getDepartments, getEmployees, createEmployee, updateEmployee, deleteEmployee, getErrorMessage } from '../api';
import EmployeeRow from '../components/EmployeeRow';
import EmployeeForm from '../components/EmployeeForm';
import useDebounce from '../hooks/useDebounce';
 
const LIMIT = 5; // employees per page
 
export default function EmployeesPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
 
  // What the user chose -> sent to the API as query parameters
  const [department, setDepartment] = useState(''); // '' = all
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
 
  // The request uses the DEBOUNCED text: it changes 400 ms after the last key press
  const debouncedSearch = useDebounce(search);
 
  const [editing, setEditing] = useState(null); // the employee being edited, or null = "add" mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  // Departments: once (for the filter and the form's dropdown)
  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);
 
  // Employees: every time the filter, the search or the page changes
  async function loadEmployees() {
    setLoading(true);
    try {
      const data = await getEmployees({ department, search: debouncedSearch, page, limit: LIMIT });
      setEmployees(data.items);
      setTotal(data.total);
      setPages(data.pages || 1);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
    loadEmployees();
  }, [department, debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps
 
  // CREATE or UPDATE. EmployeeForm calls this; if it throws, the form shows the error.
  async function handleSave(data) {
    if (editing) {
      await updateEmployee(editing._id, data);
      setEditing(null); // back to "add" mode
    } else {
      await createEmployee(data);
    }
    await loadEmployees(); // ask the server again: the list, total and pages stay correct
  }
 
  // DELETE
  async function handleDelete(employee) {
    if (!window.confirm(`Delete ${employee.name}?`)) return;
    try {
      await deleteEmployee(employee._id);
      if (editing?._id === employee._id) setEditing(null);
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
 
  return (
    <section>
      <div className="filters">
        {/* Changing a filter also goes back to page 1 */}
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
 
      <h2>Employees ({total})</h2>
      {error && <p className="error">{error}</p>}
 
      {loading ? (
        <p className="muted">Loading…</p>
      ) : employees.length === 0 ? (
        <p className="muted">No employees match.</p>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Job title</th><th>Department</th><th>Salary</th><th></th></tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <EmployeeRow key={e._id} employee={e} onEdit={setEditing} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
        </div>
      )}
 
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
        <span>Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button>
      </div>
 
      <h2>{editing ? `Edit ${editing.name}` : 'Add employee'}</h2>
      {/* CONCEPT: key resets a component. A new key = React throws the old form away and
          creates a fresh one, so the inputs are filled with the employee we clicked. */}
      <EmployeeForm
        key={editing?._id || 'new'}
        departments={departments}
        initial={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    </section>
  );
}
