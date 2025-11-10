'use client';

import { useEffect, useState } from 'react';

export default function CustomerPage() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch('https://lms-back-rendor.onrender.com/auth/me', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Please log in first.');
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // ✅ Fetch issued books
  const fetchBooks = async (userId) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/books/issuedbooks/${userId}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to load borrowed books.');
      const data = await res.json();
      console.log('Fetched books:', data);
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setBooks([]);
    }
  };

  // ✅ Load on page start
  useEffect(() => {
    const loadData = async () => {
      const currentUser = await fetchUser();
      if (currentUser) await fetchBooks(currentUser.id);
      setLoading(false);
    };
    loadData();
  }, []);

  // ✅ Redirect if not logged in
  if (error) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ✅ Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedBooks = books.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  // ✅ Logout
  function handleLogout() {
    fetch('https://lms-back-rendor.onrender.com/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => (window.location.href = '/'))
      .catch(() => setError('Logout failed'));
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          Welcome, {user?.name || 'User'}
        </h2>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">Your Borrowed Books</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Book ID</th>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Issued Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.book_id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{new Date(book.issued_at).toLocaleDateString()}</td>
                    <td>
                      {book.returned_at ? (
                        <span className="badge text-white bg-success">Returned</span>
                      ) : (
                        <span className="badge bg-danger">Borrowed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No borrowed books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {books.length > itemsPerPage && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn btn-outline-secondary me-2"
          >
            Prev
          </button>
          <span className="mx-2">
            Page <strong>{page}</strong> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn btn-outline-secondary ms-2"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
