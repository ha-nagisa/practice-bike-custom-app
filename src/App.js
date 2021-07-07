import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import * as ROUTES from './constants/routes';
import UserContext from './context/user';
import ModalContext from './context/modal';
import useAuthListener from './hooks/use-auth-listener';

import ProtectedRoute from './helpers/protected-route';
import IsUserLoggedIn from './helpers/is-user-logged-in';
import UserPhotosContext from './context/userPhotos';
import { getUserPhotosByUserId } from './services/firebase';

const Login = lazy(() => import('./pages/login'));
const SignUp = lazy(() => import('./pages/sign-up'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Profile = lazy(() => import('./pages/profile'));
const Post = lazy(() => import('./pages/post'));
const NotFound = lazy(() => import('./pages/not-found'));

export default function App() {
  const { user } = useAuthListener();
  const [modalInfo, setModalInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedInUserPhotos, setLoggedInUserPhotos] = useState(null);

  useEffect(() => {
    async function getUserPhotosAll() {
      const userPhotos = await getUserPhotosByUserId(user.uid);
      // re-arrange array to be newest photos first by dateCreated
      userPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
      setLoggedInUserPhotos(userPhotos);
    }
    if (user?.uid) {
      getUserPhotosAll();
    }
  }, [user?.userId]);

  return (
    <UserContext.Provider value={{ user }}>
      <ModalContext.Provider value={{ modalInfo, setModalInfo, isModalOpen, setIsModalOpen }}>
        <UserPhotosContext.Provider value={{ loggedInUserPhotos, setLoggedInUserPhotos }}>
          <Router>
            <Suspense fallback={<div>...Loading</div>}>
              <Switch>
                <IsUserLoggedIn user={user} loggedInPath={ROUTES.DASHBOARD} path={ROUTES.LOGIN}>
                  <Login />
                </IsUserLoggedIn>
                <IsUserLoggedIn user={user} loggedInPath={ROUTES.DASHBOARD} path={ROUTES.SIGN_UP}>
                  <SignUp />
                </IsUserLoggedIn>
                <Route path={ROUTES.PROFILE} component={Profile} />
                <Route path={ROUTES.POST} component={Post} />
                <ProtectedRoute user={user} path={ROUTES.DASHBOARD} exact>
                  <Dashboard />
                </ProtectedRoute>
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </Router>
        </UserPhotosContext.Provider>
      </ModalContext.Provider>
    </UserContext.Provider>
  );
}
