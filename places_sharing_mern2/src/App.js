import React,{ Suspense} from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
// import NewPlace from './places/pages/NewPlace';
// import UpdatePlace from './places/pages/UpdatePlace';
// import UserPlaces from './places/pages/UserPlaces';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
// import Auth from './user/pages/Auth';
//import Users from './user/pages/Users';

const Users = React.lazy(()=>import('./user/pages/Users'))
const NewPlace = React.lazy(()=>import('./places/pages/NewPlace'))
const UpdatePlace = React.lazy(()=>import('./places/pages/UpdatePlace'))
const UserPlaces = React.lazy(()=>import('./places/pages/UserPlaces'))
const Auth = React.lazy(()=>import('./user/pages/Auth'))

const App = () => {
 
  const { token, login, logout, userId} = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path='/' exact>
          <Users />
        </Route>
        <Route path='/:userId/places' exact>
          <UserPlaces />
        </Route>
        <Route path='/places/new' exact>
          <NewPlace />
        </Route>
        <Route path='/places/:placeId'>
          <UpdatePlace />
        </Route>
        <Redirect to='/' />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path='/' exact>
          <Users />
        </Route>
        <Route path='/:userId/places' exact>
          <UserPlaces />
        </Route>
        <Route path='/auth'>
          <Auth />
        </Route>
        <Redirect to='/auth' />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        login: login,
        logout: logout,
        userId: userId,
      }}
    >
      <Router>
        <MainNavigation />
        <main><Suspense fallback={<div className="center">
          <LoadingSpinner/>
        </div>}>{routes}</Suspense></main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
