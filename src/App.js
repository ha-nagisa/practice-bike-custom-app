import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import * as ROUTES from './constants/routes';
import UserContext from './context/user';
import ModalContext from './context/modal';
import useAuthListener from './hooks/use-auth-listener';

import ProtectedRoute from './helpers/protected-route';
import IsUserLoggedIn from './helpers/is-user-logged-in';
import UserPhotosContext from './context/userPhotos';
import useUser from './hooks/use-user';
import LoggedInUserContext from './context/logged-in-user';
import useActiveUserPhotos from './hooks/use-photos-activeUser';
import AccountDeleteToastContext from './context/accountDeleteToast';

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
  const { loggedInUserPhotos, setLoggedInUserPhotos } = useActiveUserPhotos(user?.uid);
  const { user: activeUser, setActiveUser } = useUser(user?.uid);

  const successDeleteToast = () =>
    toast.success('正常にアカウントが削除されました。', {
      style: {
        border: '1px solid #ffffff',
        padding: '16px',
        color: 'rgb(55, 65, 81)',
        background: '#ffffff',
      },
      iconTheme: {
        primary: '#ff9800',
        secondary: '#ffffff',
      },
    });

  return (
    <UserContext.Provider value={{ user }}>
      <LoggedInUserContext.Provider value={{ user: activeUser, setActiveUser }}>
        <ModalContext.Provider value={{ modalInfo, setModalInfo, isModalOpen, setIsModalOpen }}>
          <UserPhotosContext.Provider value={{ loggedInUserPhotos, setLoggedInUserPhotos }}>
            <AccountDeleteToastContext.Provider value={{ successDeleteToast }}>
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
              <Toaster
                position="bottom-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 8000,
                  // Default options for specific types
                  success: {
                    duration: 5000,
                  },
                }}
              />
            </AccountDeleteToastContext.Provider>
          </UserPhotosContext.Provider>
        </ModalContext.Provider>
      </LoggedInUserContext.Provider>
    </UserContext.Provider>
  );
}
