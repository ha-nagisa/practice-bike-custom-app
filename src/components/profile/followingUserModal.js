import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import backfaceFixed from '../../utils/backfaceFixed';
import { getProfileFollowingUsers } from '../../services/firebase';

export default function FollowingUserModal({ user, setIsOpenFollowingModal }) {
  const history = useHistory();
  const [followingUsers, setFollowingUsers] = useState(null);

  useEffect(() => {
    const getFollowingUsers = async () => {
      const users = await getProfileFollowingUsers(user?.following);
      setFollowingUsers(users);
    };

    if (user?.userId) {
      getFollowingUsers();
    }
  }, [user?.userId, user?.following]);

  const closeModal = () => {
    backfaceFixed(false);
    setIsOpenFollowingModal(false);
  };

  const leadProfile = (username) => {
    history.push(`/p/${username}`);
    closeModal();
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full">
      <button type="button" onClick={() => closeModal()} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-96 w-80 z-10 rounded">
        <div className="bg-white overflow-auto w-full h-full rounded">
          <p className="p-2 text-gray-700 text-center border-b-2 border-gray-400">Your Following People</p>
          {followingUsers && followingUsers.length > 0 ? (
            followingUsers.map((u) => (
              <div key={u.docId} className="border-b border-gray-400 p-2">
                <button type="button" className="w-full text-left" onClick={() => leadProfile(u.username)}>
                  <img
                    className="w-8 h-8 object-cover rounded-full inline-block mr-3"
                    src={!u.bikeImageUrl ? '/images/avatars/default.png' : u.bikeImageUrl}
                    alt="name"
                  />
                  <p className="inline-block">{u.username}</p>
                </button>
              </div>
            ))
          ) : (
            <p className="text-base pt-4 text-center text-gray-400 px-2">フォローしているユーザーはいません。</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => closeModal()}
          className="bg-black-base p-2 rounded-full absolute top-0 right-0  overflow-visible z-20 transform -translate-y-1/2 translate-x-1/2 hover:opacity-80"
        >
          <img width="16px" height="16px" src="/images/closeButton.png" alt="閉じるボタン" />
        </button>
      </div>
    </div>
  );
}

FollowingUserModal.propTypes = {
  user: PropTypes.shape({
    docId: PropTypes.string,
    dateCreated: PropTypes.number,
    emailAddress: PropTypes.string,
    followers: PropTypes.array,
    following: PropTypes.array,
    likes: PropTypes.array,
    carModel: PropTypes.string,
    maker: PropTypes.string,
    userId: PropTypes.string,
    username: PropTypes.string,
  }),
  setIsOpenFollowingModal: PropTypes.func.isRequired,
};
