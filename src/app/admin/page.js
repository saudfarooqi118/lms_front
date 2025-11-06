'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LibrarianDashboard() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', quantity: 1 });
  const [editBook, setEditBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loading_add, setLoadingadd] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [message, setMessage] = useState('');
  const router = useRouter();
  const booksPerPage = 10;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch books
  async function fetchBooks(page = 1) {
    try {
      const res = await fetch(`${baseUrl}/api/books?page=${page}&limit=${booksPerPage}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load books');
      setBooks(data.books);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Add Book
  async function handleAddBook(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add book');
      setSuccess('Book added successfully!');
      setForm({ title: '', author: '', isbn: '', quantity: 1 });
      setShowAddModal(false);
      fetchBooks(currentPage);
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Update Book
  async function handleUpdateBook(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/api/books/${editBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editBook),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update book');
      setSuccess('Book updated successfully!');
      setEditBook(null);
      fetchBooks(currentPage);
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Delete Book
  async function handleDelete(id) {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      fetchBooks(currentPage);
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Add User
  async function handleAddUser(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');
      setMessage('✅ User added successfully!');
      setUserForm({ name: '', email: '', password: '', role: 'customer' });
      setTimeout(() => setShowAddUserModal(false), 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📚 Admin Dashboard</h2>
        <div>
          <button className="btn btn-success me-2" onClick={() => setShowAddUserModal(true)}>
            + Add User
          </button>
          <button className="btn btn-primary me-2" onClick={() => setShowAddModal(true)}>
            + Add Book
          </button>
          <button className="btn btn-danger" onClick={() => (window.location.href = '/')}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ✅ Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Book List</h3>
        </div>
        <div className="table-responsive">
          <table className="table table-vcenter table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.isbn}</td>
                    <td>{b.quantity}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => setEditBook(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(b.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Pagination */}
      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
            <button className="page-link" onClick={() => fetchBooks(currentPage - 1)}>
              Prev
            </button>
          </li>
          {[...Array(totalPages).keys()].map((num) => (
            <li
              key={num + 1}
              className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
            >
              <button className="page-link" onClick={() => fetchBooks(num + 1)}>
                {num + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
            <button className="page-link" onClick={() => fetchBooks(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* ✅ Add Book Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAddBook}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Book</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      className="form-control"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ISBN</label>
                    <input
                      className="form-control"
                      value={form.isbn}
                      onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Book Modal */}
      {editBook && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleUpdateBook}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Book</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditBook(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={editBook.title}
                      onChange={(e) => setEditBook({ ...editBook, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      className="form-control"
                      value={editBook.author}
                      onChange={(e) => setEditBook({ ...editBook, author: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ISBN</label>
                    <input
                      className="form-control"
                      value={editBook.isbn}
                      onChange={(e) => setEditBook({ ...editBook, isbn: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editBook.quantity}
                      onChange={(e) => setEditBook({ ...editBook, quantity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditBook(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add User Modal */}
      {showAddUserModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAddUser}>
                <div className="modal-header">
                  <h5 className="modal-title">Add User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddUserModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="customer">Customer</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {message && (
                    <div
                      className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'
                        }`}
                    >
                      {message}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading_add}>
                    {loading_add ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
