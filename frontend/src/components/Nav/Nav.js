import React from 'react';
import './Nav.css';
import { Link, withRouter } from 'react-router-dom';

class Nav extends React.Component {

    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.logout = this.logout.bind(this);
    }

    state = {};

    update() {
        this.setState(this.state);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    isActive(path) {
        return this.props.location.pathname === path ? 'active' : '';
    }

    render(){
        if(this.props.location.pathname === '/login')
            return null;

        const token = localStorage.getItem('token');
        if(!token)
            return null;

        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const role = user ? user.role : null;

        return (
            <div id='nav'>
                <span id="brand">EASY LIBRARY MANAGEMENT SYSTEM</span>
                <ul>
                    <li className={this.isActive('/dashboard')}><Link to='/dashboard' onClick={this.update}>Dashboard</Link></li>
                    {role === 'admin' &&
                        <li className={this.isActive('/users')}><Link to='/users' onClick={this.update}>Users / Members</Link></li>
                    }
                    {(role === 'admin' || role === 'librarian') &&
                        <li className={this.isActive('/catalog')}><Link to='/catalog' onClick={this.update}>Book / Catalog Management</Link></li>
                    }
                    <li className={this.isActive('/')}><Link to='/' onClick={this.update}>Available Books</Link></li>
                    <li className={this.isActive('/issue')}><Link to='/issue' onClick={this.update}>Issue Book</Link></li>
                    <li className={this.isActive('/return')}><Link to='/return' onClick={this.update}>Return Book</Link></li>
                    <li className={this.isActive('/search')}><Link to='/search' onClick={this.update}>Search</Link></li>
                </ul>
                <div id="nav-footer">
                    <span id="nav-user">{user ? `${user.name} (${user.role})` : ''}</span>
                    <a href='/login' id="logout" onClick={this.logout}>Logout</a>
                </div>
            </div>
        );
    }
}

export default withRouter(Nav);