import { Link, NavLink } from 'react-router-dom';
 
const tab = ({ isActive }) => (isActive ? 'tab active' : 'tab');
 
export default function Navbar() {
  return (
    <header className="top">
      <Link to="/" className="brand">EmployeeHub</Link>
      <nav className="tabs">
        <NavLink to="/employees" className={tab}>Employees</NavLink>
        <NavLink to="/departments" className={tab}>Departments</NavLink>
      </nav>
    </header>
  );
}
