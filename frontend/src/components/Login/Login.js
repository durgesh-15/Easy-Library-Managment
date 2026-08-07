import React from 'react';
import axios from 'axios';
import './Login.css';

class Login extends React.Component {

    state = {
        username: '',
        password: '',
        error: ''
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        axios.post('/api/auth/login', {
            username: this.state.username,
            password: this.state.password
        })
        .then((res) => {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            this.props.history.push('/dashboard');
        })
        .catch((err) => {
            const message = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Login failed';
            this.setState({ error: message });
        });
    }

    render() {
        return (
            <div id="login">
                <form onSubmit={this.handleSubmit}>
                    <h2>Library Login</h2>
                    {this.state.error && <p className="error">{this.state.error}</p>}
                    <input
                        className="form-control"
                        name="username"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.handleChange}
                        required
                    />
                    <input
                        className="form-control"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        required
                    />
                    <button className="btn btn-primary" type="submit">Login</button>
                    <p className="hint">Default admin: admin / Admin@123</p>
                </form>
            </div>
        );
    }
}

export default Login;
