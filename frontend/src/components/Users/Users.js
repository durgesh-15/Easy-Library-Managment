import React from 'react';
import axios from 'axios';
import './Users.css';

const EMPTY_FORM = { id: null, name: '', email: '', username: '', password: '', role: 'member' };

class Users extends React.Component {

    state = {
        users: [],
        form: EMPTY_FORM,
        editing: false,
        error: '',
        message: ''
    };

    authHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    componentDidMount() {
        this.loadUsers();
    }

    loadUsers = () => {
        axios.get('/api/users', this.authHeaders())
            .then((res) => this.setState({ users: res.data }))
            .catch(() => this.setState({ error: 'Could not load users' }));
    }

    handleChange = (e) => {
        this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, editing } = this.state;

        const request = editing
            ? axios.put(`/api/users/${form.id}`, { name: form.name, email: form.email, role: form.role }, this.authHeaders())
            : axios.post('/api/users', form, this.authHeaders());

        request
            .then((res) => {
                this.setState({ form: EMPTY_FORM, editing: false, error: '', message: res.data.message });
                this.loadUsers();
            })
            .catch((err) => {
                const message = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Something went wrong';
                this.setState({ error: message, message: '' });
            });
    }

    editUser = (user) => {
        this.setState({ form: { ...EMPTY_FORM, ...user, password: '' }, editing: true, error: '', message: '' });
    }

    cancelEdit = () => {
        this.setState({ form: EMPTY_FORM, editing: false });
    }

    deleteUser = (id) => {
        if(!window.confirm('Delete this user?'))
            return;

        axios.delete(`/api/users/${id}`, this.authHeaders())
            .then((res) => {
                this.setState({ message: res.data.message, error: '' });
                this.loadUsers();
            })
            .catch((err) => {
                const message = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Could not delete user';
                this.setState({ error: message, message: '' });
            });
    }

    render() {
        const { users, form, editing, error, message } = this.state;

        return (
            <div id="users">
                <span id="heading">USERS / MEMBERS</span>

                <form className="form-row" onSubmit={this.handleSubmit}>
                    <input className="form-control" name="name" placeholder="Name" value={form.name} onChange={this.handleChange} required />
                    <input className="form-control" name="email" type="email" placeholder="Email" value={form.email || ''} onChange={this.handleChange} />
                    {!editing &&
                        <input className="form-control" name="username" placeholder="Username" value={form.username} onChange={this.handleChange} required />
                    }
                    {!editing &&
                        <input className="form-control" name="password" type="password" placeholder="Password" value={form.password} onChange={this.handleChange} required />
                    }
                    <select className="form-control" name="role" value={form.role} onChange={this.handleChange}>
                        <option value="member">Member</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button className="btn btn-success" type="submit">{editing ? 'Update User' : 'Add User'}</button>
                    {editing && <button className="btn btn-secondary" type="button" onClick={this.cancelEdit}>Cancel</button>}
                </form>

                {error && <p className="error">{error}</p>}
                {message && <p className="message">{message}</p>}

                <table id="results" className="table table-hover">
                    <thead id="header">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Username</th>
                            <th scope="col">Role</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.username}</td>
                                <td>{u.role}</td>
                                <td>
                                    <button className="btn btn-primary" onClick={() => this.editUser(u)}>Edit</button>{' '}
                                    <button className="btn btn-danger" onClick={() => this.deleteUser(u.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Users;
