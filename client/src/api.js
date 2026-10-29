import axios from 'axios';
 
// import.meta.env = Vite's version of process.env. Only VITE_ variables reach the browser.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
 
// ---------- Departments ----------
export async function getDepartments() {
  const res = await api.get('/departments'); // GET http://localhost:5000/api/departments
  return res.data; // [ { _id, name, ... }, ... ]
}
 
export async function createDepartment(data) {
  const res = await api.post('/departments', data); // body: { name }
  return res.data; // the new department (with its _id)
}
 
export async function updateDepartment(id, data) {
  const res = await api.put(`/departments/${id}`, data);
  return res.data; // the department AFTER the update
}
 
export async function deleteDepartment(id) {
  await api.delete(`/departments/${id}`); // 204: nothing to return
}
 
// ---------- Employees ----------
// params becomes the query string: { department: 'x', search: 'a', page: 1, limit: 5 }
//   -> /employees?department=x&search=a&page=1&limit=5
export async function getEmployees(params) {
  const res = await api.get('/employees', { params });
  return res.data; // { items, total, page, pages }
}
 
export async function createEmployee(data) {
  const res = await api.post('/employees', data);
  return res.data;
}
 
export async function updateEmployee(id, data) {
  const res = await api.put(`/employees/${id}`, data);
  return res.data;
}
 
export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}`);
}
 
// Turns any axios error into one readable sentence for the screen.
//   400 validation -> "Name must be at least 3 characters • Salary must be at least 1000"
//   409 / 404      -> the server's message
//   server down    -> "Network Error"
export function getErrorMessage(err) {
  const data = err.response?.data; // undefined when the server did not answer at all
  if (data?.errors) return data.errors.join(' • ');
  if (data?.message) return data.message;
  if (err.request && !err.response) return 'Cannot reach the server. Is the API running?';
  return err.message;
}
 
// The axios instance itself (for one-off requests, e.g. the lab).
export default api;
