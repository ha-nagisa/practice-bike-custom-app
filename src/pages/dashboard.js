/* eslint-disable no-nested-ternary */
import { useContext, useEffect, useState } from 'react';

import Header from '../components/header';
import Timeline from '../components/timeline';
import Sidebar from '../components/sidebar';
import LoggedInUserContext from '../context/logged-in-user';
import PostIcon from '../components/postIcon';
import TimelineAll from '../components/timeLineAll';
import TimelineFavorite from '../components/timeLineFavorite';
import ModalContext from '../context/modal';
import PostEditModal from '../components/postEditModal';
import PostDetailModal from '../components/postDetailModal';
import PostErrorModal from '../components/postErrorModal';
import MobileSidebar from '../components/sidebar/mobile-sidebar';
import { getSuggestedProfiles } from '../services/firebase';
import SuggestionsProfilesContext from '../context/suggestions-profiles';

export default function Dashboard() {
  const [postConditional, setPostConditional] = useState('all');
  const { user: activeUser } = useContext(LoggedInUserContext);
  const { modalInfo, isModalOpen, setIsModalOpen } = useContext(ModalContext);
  const isPostUser = modalInfo?.username === activeUser?.username;
  const [profiles, setProfiles] = useState(null);

  useEffect(() => {
    document.title = 'Bun Bun Bike';
  }, []);

  useEffect(() => {
    async function suggestedProfiles() {
      const response = await getSuggestedProfiles(activeUser.userId, activeUser.following, activeUser.maker);
      setProfiles(response);
    }

    if (activeUser?.userId) {
      suggestedProfiles();
    }
  }, [activeUser?.userId, activeUser?.following, activeUser?.maker]);

  return (
    <SuggestionsProfilesContext.Provider value={{ profiles, setProfiles }}>
      <div className="bg-gray-background  relative">
        <Header />
        <div className="grid lg:grid-cols-5 grid-cols-4 gap-4 justify-between items-start mx-auto max-w-screen-xl grid-rows-280px px-5">
          <div className="col-span-4 grid-cols-4 grid gap-2">
            <div className="col-span-4 flex items-center mb-3">
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('all')}
                  className={`text-center w-full border-b pb-2 focus:outline-none  shadow-borderBottom ${
                    postConditional === 'all' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400'
                  }`}
                  type="button"
                >
                  みんなの投稿
                </button>
              </div>
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('follow')}
                  className={`text-center w-full border-b pb-2 focus:outline-none shadow-borderBottom ${
                    postConditional === 'follow' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400'
                  }`}
                  type="button"
                >
                  フォロー中
                </button>
              </div>
              <div className="w-1/3">
                <button
                  onClick={() => setPostConditional('favorite')}
                  className={`text-center w-full border-b pb-2 focus:outline-none shadow-borderBottom ${
                    postConditional === 'favorite' ? 'text-logoColor-base border-logoColor-base' : 'text-gray-400'
                  }`}
                  type="button"
                >
                  お気に入り
                </button>
              </div>
            </div>
            <MobileSidebar />
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
        {isModalOpen ? (
          modalInfo ? (
            isPostUser ? (
              <PostEditModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            ) : (
              <PostDetailModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            )
          ) : (
            <PostErrorModal />
          )
        ) : null}
      </div>
    </SuggestionsProfilesContext.Provider>
  );
}
