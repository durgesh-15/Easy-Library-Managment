import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function PrivateRoute({ component: Component, allowedRoles, ...rest }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    return (
        <Route
            {...rest}
            render={(props) => {
                if(!token)
                    return <Redirect to="/login" />;

                if(allowedRoles && (!user || !allowedRoles.includes(user.role)))
                    return <Redirect to="/dashboard" />;

                return <Component {...props} />;
            }}
        />
    );
}

export default PrivateRoute;
