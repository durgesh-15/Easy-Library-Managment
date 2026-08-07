import React from 'react';
import Nav from './components/Nav/Nav';
import Books from './components/Books/Books';
import Issue from './components/Issue/Issue';
import Return from './components/Return/Return';
import Search from './components/search/search';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Users from './components/Users/Users';
import Catalog from './components/Catalog/Catalog';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import './App.css';
import {Route, Redirect, Switch, withRouter} from 'react-router-dom';

class App extends React.Component {

  render(){
    const isLoginPage = this.props.location.pathname === '/login';

    return (
      <div className="App">
        <Nav />
        <div className={isLoginPage ? 'app-content' : 'app-content with-sidebar'}>
          <Switch>
            <Route path='/login' exact strict component={Login}/>
            <PrivateRoute path='/dashboard' exact strict component={Dashboard}/>
            <PrivateRoute path='/users' exact strict component={Users} allowedRoles={['admin']}/>
            <PrivateRoute path='/catalog' exact strict component={Catalog} allowedRoles={['admin', 'librarian']}/>
            <PrivateRoute path='/' exact strict component={Books}/>
            <PrivateRoute path='/issue' exact strict component={Issue}/>
            <PrivateRoute path='/return' exact strict component={Return}/>
            <PrivateRoute path='/search' exact strict component={Search}/>
            <Redirect from='*' to='/'/>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
