import React from 'react';
import axios from 'axios';
import './Catalog.css';

const EMPTY_FORM = { id: null, name: '', author: '', semester: '', count: '' };

class Catalog extends React.Component {

    state = {
        books: [],
        form: EMPTY_FORM,
        editing: false,
        error: '',
        message: ''
    };

    authHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    componentDidMount() {
        this.loadBooks();
    }

    loadBooks = () => {
        axios.get('/api/getBooks')
            .then((res) => this.setState({ books: res.data }))
            .catch(() => this.setState({ error: 'Could not load books' }));
    }

    handleChange = (e) => {
        this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, editing } = this.state;
        const payload = { name: form.name, author: form.author, semester: form.semester, count: form.count };

        const request = editing
            ? axios.put(`/api/books/${form.id}`, payload, this.authHeaders())
            : axios.post('/api/books', payload, this.authHeaders());

        request
            .then((res) => {
                this.setState({ form: EMPTY_FORM, editing: false, error: '', message: res.data.message });
                this.loadBooks();
            })
            .catch((err) => {
                const message = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Something went wrong';
                this.setState({ error: message, message: '' });
            });
    }

    editBook = (book) => {
        this.setState({ form: { ...book }, editing: true, error: '', message: '' });
    }

    cancelEdit = () => {
        this.setState({ form: EMPTY_FORM, editing: false });
    }

    deleteBook = (id) => {
        if(!window.confirm('Delete this book?'))
            return;

        axios.delete(`/api/books/${id}`, this.authHeaders())
            .then((res) => {
                this.setState({ message: res.data.message, error: '' });
                this.loadBooks();
            })
            .catch((err) => {
                const message = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Could not delete book';
                this.setState({ error: message, message: '' });
            });
    }

    render() {
        const { books, form, editing, error, message } = this.state;

        return (
            <div id="catalog">
                <span id="heading">BOOK / CATALOG MANAGEMENT</span>

                <form className="form-row" onSubmit={this.handleSubmit}>
                    <input className="form-control" name="name" placeholder="Book Name" value={form.name} onChange={this.handleChange} required />
                    <input className="form-control" name="author" placeholder="Author" value={form.author} onChange={this.handleChange} required />
                    <input className="form-control" name="semester" type="number" min="1" max="8" placeholder="Semester" value={form.semester} onChange={this.handleChange} required />
                    <input className="form-control" name="count" type="number" min="0" placeholder="Copies" value={form.count} onChange={this.handleChange} required />
                    <button className="btn btn-success" type="submit">{editing ? 'Update Book' : 'Add Book'}</button>
                    {editing && <button className="btn btn-secondary" type="button" onClick={this.cancelEdit}>Cancel</button>}
                </form>

                {error && <p className="error">{error}</p>}
                {message && <p className="message">{message}</p>}

                <table id="results" className="table table-hover">
                    <thead id="header">
                        <tr>
                            <th scope="col">Book Name</th>
                            <th scope="col">Author</th>
                            <th scope="col">Semester No</th>
                            <th scope="col">Total Count</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((b) => (
                            <tr key={b.id}>
                                <td>{b.name.toUpperCase()}</td>
                                <td>{b.author}</td>
                                <td>{b.semester}</td>
                                <td>{b.count}</td>
                                <td>
                                    <button className="btn btn-primary" onClick={() => this.editBook(b)}>Edit</button>{' '}
                                    <button className="btn btn-danger" onClick={() => this.deleteBook(b.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Catalog;
