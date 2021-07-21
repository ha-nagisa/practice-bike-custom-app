import { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import FirebaseContext from '../context/firebase';
import UserContext from '../context/user';
import * as ROUTES from '../constants/routes';
import DEFAULT_IMAGE_PATH from '../constants/paths';
import LoggedInUserContext from '../context/logged-in-user';

export default function Header() {
  const { user: loggedInUser } = useContext(UserContext);
  const { user: activeUser } = useContext(LoggedInUserContext);
  const { firebase } = useContext(FirebaseContext);
  const history = useHistory();

  return (
    <header className="h-16 bg-white border-b border-gray-primary mb-8">
      <div className="container mx-auto max-w-screen-xl h-full px-5">
        <div className="flex justify-between h-full">
          <div className="text-gray-700 text-center flex items-center align-items cursor-pointer">
            <h1 className="flex justify-center w-full">
              <Link to={ROUTES.DASHBOARD} aria-label="Bun Bun BIKE logo">
                <img src="/images/smLoginLogo.png" alt="bun bun bike" width="200px" className="" />
              </Link>
            </h1>
          </div>
          <div className="text-gray-700 text-center flex items-center align-items">
            {loggedInUser ? (
              <>
                <button
                  type="button"
                  className="focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base"
                  title="Sign Out"
                  onClick={() => {
                    firebase.auth().signOut();
                    history.push(ROUTES.LOGIN);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      firebase.auth().signOut();
                      history.push(ROUTES.LOGIN);
                    }
                  }}
                >
                  <svg
                    className="w-8 mr-6 text-black-light cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
                {activeUser && (
                  <div className="flex items-center cursor-pointer">
                    <Link to={`/p/${activeUser?.username}`}>
                      <img
                        className="object-cover w-8 h-8 rounded-full flex bg-white"
                        src={activeUser.bikeImageUrl ? activeUser.bikeImageUrl : DEFAULT_IMAGE_PATH}
                        alt={`${activeUser?.username} profile`}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE_PATH;
                        }}
                      />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <button
                    type="button"
                    className="bg-logoColor-base font-bold text-sm rounded text-white w-20 h-8 focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base"
                  >
                    Log In
                  </button>
                </Link>
                <Link to={ROUTES.SIGN_UP}>
                  <button
                    type="button"
                    className="font-bold text-sm rounded text-logoColor-base w-20 h-8 focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base"
                  >
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
