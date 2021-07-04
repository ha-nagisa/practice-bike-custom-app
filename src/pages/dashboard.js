import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../components/header';
import Timeline from '../components/timeline';
import Sidebar from '../components/sidebar';
import useUser from '../hooks/use-user';
import LoggedInUserContext from '../context/logged-in-user';

export default function Dashboard({ user: loggedInUser }) {
  const [isPostAll, setIsPostAll] = useState(true);
  const { user, setActiveUser } = useUser(loggedInUser.uid);
  useEffect(() => {
    document.title = 'Instagram';
  }, []);

  return (
    <LoggedInUserContext.Provider value={{ user, setActiveUser }}>
      <div className="bg-gray-background">
        <Header />
        <div className="grid grid-cols-5 gap-4 justify-between mx-auto max-w-screen-xl  px-5">
          <div className="container col-span-4 grid-cols-4 grid gap-2">
            <div className="col-span-4 flex items-center mb-3">
              <div className="w-1/2">
                <button
                  onClick={() => setIsPostAll(!isPostAll)}
                  className={`text-center w-full border-b-2 pb-2 focus:outline-none ${
                    isPostAll ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400 border-gray-400'
                  }`}
                  type="button"
                >
                  みんなの投稿
                </button>
              </div>
              <div className="w-1/2">
                <button
                  onClick={() => setIsPostAll(!isPostAll)}
                  className={`text-center w-full border-b-2 pb-2 focus:outline-none ${
                    isPostAll ? 'text-gray-400 border-gray-400' : 'text-logoColor-base border-logoColor-base'
                  }`}
                  type="button"
                >
                  フォロー中
                </button>
              </div>
            </div>
            <Timeline />
          </div>
          <Sidebar />
        </div>
      </div>
    </LoggedInUserContext.Provider>
  );
}

Dashboard.propTypes = {
  user: PropTypes.object.isRequired,
};
