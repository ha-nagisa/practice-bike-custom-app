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
import useUser from './hooks/use-user';
import LoggedInUserContext from './context/logged-in-user';

const Login = lazy(() => import('./pages/login'));
const SignUp = lazy(() => import('./pages/sign-up'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Profile = lazy(() => import('./pages/profile'));
const ProfileEdit = lazy(() => import('./pages/profile-edit'));
const Post = lazy(() => import('./pages/post'));
const NotFound = lazy(() => import('./pages/not-found'));

export default function App() {
  const { user } = useAuthListener();
  const [modalInfo, setModalInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedInUserPhotos, setLoggedInUserPhotos] = useState(null);
  const { user: activeUser, setActiveUser } = useUser(user?.uid);
  console.log(activeUser);

  useEffect(async () => {
    async function getUserPhotosAll() {
      const [userPhotos] = await getUserPhotosByUserId(user.uid);
      [userPhotos].sort((a, b) => b.dateCreated - a.dateCreated);
      setLoggedInUserPhotos(userPhotos);
    }

    if (user?.uid) {
      await getUserPhotosAll();
      console.log(loggedInUserPhotos);
    }
  }, [user?.uid]);

  return (
    <UserContext.Provider value={{ user }}>
      <LoggedInUserContext.Provider value={{ user: activeUser, setActiveUser }}>
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
                  <Route path={ROUTES.PROFILE} component={Profile} exact />
                  <Route path={ROUTES.PROFILE_EDIT} component={ProfileEdit} exact />
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
      </LoggedInUserContext.Provider>
    </UserContext.Provider>
  );
}
