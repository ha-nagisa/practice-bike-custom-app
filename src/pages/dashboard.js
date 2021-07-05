/* eslint-disable no-nested-ternary */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Header from '../components/header';
import Timeline from '../components/timeline';
import Sidebar from '../components/sidebar';
import useUser from '../hooks/use-user';
import LoggedInUserContext from '../context/logged-in-user';
import PostIcon from '../components/postIcon';
import TimelineAll from '../components/timeLineAll';
import TimelineFavorite from '../components/timeLineFavorite';

export default function Dashboard({ user: loggedInUser }) {
  const [postConditional, setPostConditional] = useState('all');
  const { user, setActiveUser } = useUser(loggedInUser.uid);
  useEffect(() => {
    document.title = 'Instagram';
  }, []);

  return (
    <LoggedInUserContext.Provider value={{ user, setActiveUser }}>
      <div className="bg-gray-background relative">
        <Header />
        <div className="grid grid-cols-5 gap-4 justify-between mx-auto max-w-screen-xl  px-5">
          <div className="container col-span-4 grid-cols-4 grid gap-2">
            <div className="col-span-4 flex items-center mb-3">
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('all')}
                  className={`text-center w-full border-b-2 pb-2 focus:outline-none ${
                    postConditional === 'all' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400 border-gray-400'
                  }`}
                  type="button"
                >
                  みんなの投稿
                </button>
              </div>
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('follow')}
                  className={`text-center w-full border-b-2 pb-2 focus:outline-none ${
                    postConditional === 'follow' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400 border-gray-400'
                  }`}
                  type="button"
                >
                  フォロー中
                </button>
              </div>
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('favorite')}
                  className={`text-center w-full border-b-2 pb-2 focus:outline-none ${
                    postConditional === 'favorite' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400 border-gray-400'
                  }`}
                  type="button"
                >
                  お気に入り
                </button>
              </div>
            </div>
            {postConditional === 'all' ? (
              <TimelineAll />
            ) : postConditional === 'follow' ? (
              <Timeline />
            ) : postConditional === 'favorite' ? (
              <TimelineFavorite />
            ) : null}
          </div>
          <Sidebar />
        </div>
        <PostIcon />
      </div>
    </LoggedInUserContext.Provider>
  );
}

Dashboard.propTypes = {
  user: PropTypes.object.isRequired,
};
