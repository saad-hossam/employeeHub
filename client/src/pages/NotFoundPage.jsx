import { Link } from 'react-router-dom';
 
// Shown for any URL that matches no route (path="*" in App.jsx).
export default function NotFoundPage() {
  return (
    <section className="center">
      <h2>404 • Page not found</h2>
      <Link to="/employees">Back to employees</Link>
    </section>
  );
}
