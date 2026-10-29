export default function EmployeeRow({ employee, onEdit, onDelete }) {
  return (
    <tr>
      <td>{employee.name}</td>
      <td>{employee.jobTitle}</td>
      {/* department is an object because the API uses populate('department', 'name') */}
      <td><span className="badge">{employee.department?.name}</span></td>
      {/* toLocaleString adds thousands separators: 25000 -> 25,000 */}
      <td>{employee.salary.toLocaleString()} EGP</td>
      <td>
        <div className="actions">
          <button className="ghost" onClick={() => onEdit(employee)}>Edit</button>
          <button className="ghost danger" onClick={() => onDelete(employee)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}
