'use client';

import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@tabler/core/dist/css/tabler.min.css';

export default function LibrarianDashboard() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', quantity: 1 });
  const [editBook, setEditBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 10;
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [issueUserId, setIssueUserId] = useState('');
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch books
  async function fetchBooks(page = 1, query = '') {
    try {
      const res = await fetch(
        `${baseUrl}/api/books?page=${page}&limit=${booksPerPage}&search=${encodeURIComponent(query)}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load books');

      setBooks(data.books);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    }
  }

  // Debounce effect: wait 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    // Cleanup if user types again before 500ms
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch books whenever the debounced term changes
  useEffect(() => {
    fetchBooks(currentPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  async function fetchIssuedBooks() {
    try {
      const res = await fetch('http://localhost:5000/api/books/fetchissued', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load issued books');
      setIssuedBooks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddBook(e) {
    e.preventDefault();
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

  async function handleIssueBook(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/books/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ book_id: selectedBook.id, user_id: issueUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue book');
      setSuccess('Book issued successfully!');
      setShowIssueModal(false);
      setIssueUserId('');
      fetchBooks(currentPage);
      fetchIssuedBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReturnBook(issueId) {
    try {
      const res = await fetch(`${baseUrl}/api/books/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ issue_id: issueId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to return book');
      alert('✅ Book returned successfully!');
      setShowReturnModal(false);
      fetchIssuedBooks();
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => (window.location.href = '/'))
      .catch(() => setError('Logout failed'));
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">📚 Library Book Management</h1>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Book
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Books Table */}
      <div className="card">
        <div className="card-body">
          <table className="table table-striped table-bordered text-center">
            <thead className="table-light">
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
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setSelectedBook(b);
                          setShowIssueModal(true);
                        }}
                      >
                        Issue
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No books found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => fetchBooks(currentPage - 1)}>
              Prev
            </button>
          </li>
          {[...Array(totalPages).keys()].map((i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
            >
              <button className="page-link" onClick={() => fetchBooks(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => fetchBooks(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* Issued Books Table */}
      <div className="card mt-5">
        <div className="card-header">
          <h3 className="card-title">📖 Issued Books</h3>
        </div>
        <div className="card-body">
          <table className="table table-striped table-bordered text-center">
            <thead className="table-light">
              <tr>
                <th>Issue ID</th>
                <th>Book ID</th>
                <th>User ID</th>
                <th>Issued At</th>
                <th>Returned At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.length > 0 ? (
                issuedBooks.map((i) => (
                  <tr key={i.id}>
                    <td>{i.id}</td>
                    <td>{i.book_id}</td>
                    <td>{i.user_id}</td>
                    <td>{new Date(i.issued_at).toLocaleString()}</td>
                    <td>{i.returned_at ? new Date(i.returned_at).toLocaleString() : 'Not returned'}</td>
                    <td>
                      {!i.returned_at ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleReturnBook(i.id)}
                        >
                          Return
                        </button>
                      ) : (
                        <span className="text-muted">Returned</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No issued books found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAddBook}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Book</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="text" className="form-control mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <input type="text" className="form-control mb-2" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
                  <input type="text" className="form-control mb-2" placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
                  <input type="number" className="form-control" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
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

      {/* ✅ Issue Book Modal */}
      {showIssueModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleIssueBook}>
                <div className="modal-header">
                  <h5 className="modal-title">Issue Book</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowIssueModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={issueUserId}
                      onChange={(e) => setIssueUserId(e.target.value)}
                      placeholder="Enter User ID"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowIssueModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Issuing...' : 'Issue Book'}
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
