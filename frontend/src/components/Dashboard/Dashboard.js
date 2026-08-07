import React from 'react';
import axios from 'axios';
import './Dashboard.css';

class Dashboard extends React.Component {

    state = {
        stats: null,
        error: ''
    };

    componentDidMount() {
        axios.get('/api/dashboard/stats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then((res) => this.setState({ stats: res.data }))
        .catch(() => this.setState({ error: 'Could not load dashboard stats' }));
    }

    render() {
        const { stats, error } = this.state;

        return (
            <div id="dashboard">
                <span id="heading">DASHBOARD</span>
                {error && <p className="error">{error}</p>}
                {stats &&
                    <div className="stat-cards">
                        <div className="stat-card">
                            <span>{stats.totalBooks}</span>
                            <p>Total Books</p>
                        </div>
                        <div className="stat-card">
                            <span>{stats.totalMembers}</span>
                            <p>Total Members</p>
                        </div>
                        <div className="stat-card">
                            <span>{stats.totalIssued}</span>
                            <p>Books Issued</p>
                        </div>
                        <div className="stat-card">
                            <span>{stats.overdue}</span>
                            <p>Overdue</p>
                        </div>
                        <div className="stat-card">
                            <span>{stats.totalFine}</span>
                            <p>Total Fine Pending</p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Dashboard;
