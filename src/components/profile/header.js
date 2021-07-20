/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { isUserFollowingProfile, toggleFollow } from '../../services/firebase';
import { backfaceFixed } from '../../utils/backfaceFixed';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Header({
  photosCount,
  followerCount,
  setFollowerCount,
  setIsOpenFollowingModal,
  setIsOpenFollowedModal,
  profile: {
    docId: profileDocId,
    userId: profileUserId,
    bikeImageUrl: profileBikeImageUrl,
    carModel,
    maker,
    followers,
    following,
    username: profileUsername,
  },
}) {
  const { user: activeUser, setActiveUser } = useContext(LoggedInUserContext);
  const [isFollowingProfile, setIsFollowingProfile] = useState(null);
  const activeBtnFollow = activeUser?.username && activeUser?.username !== profileUsername;

  useEffect(() => {
    const isLoggedInUserFollowingProfile = async () => {
      const isFollowing = await isUserFollowingProfile(activeUser.username, profileUserId);
      setIsFollowingProfile(!!isFollowing);
    };

    if (activeUser?.username && profileUserId) {
      isLoggedInUserFollowingProfile();
    }
  }, [activeUser?.username, profileUserId, profileUsername]);

  const handleToggleFollow = async () => {
    setIsFollowingProfile((isFollowingProfile) => !isFollowingProfile);
    setFollowerCount({
      followerCount: isFollowingProfile ? followerCount - 1 : followerCount + 1,
    });
    await toggleFollow(isFollowingProfile, activeUser.docId, profileDocId, profileUserId, activeUser.userId);
    setActiveUser((user) => ({
      ...user,
      following: isFollowingProfile ? user.following.filter((uid) => uid !== profileUserId) : [...user.following, profileUserId],
    }));
  };

  const openFollowedModal = () => {
    backfaceFixed(true);
    setIsOpenFollowedModal(true);
  };
  const openFollowingModal = () => {
    backfaceFixed(true);
    setIsOpenFollowingModal(true);
  };

  return (
    <div className="block sm:flex sm:justify-center mx-auto max-w-screen-lg">
      <div className="flex justify-center items-center sm:pr-20">
        <div className="text-center">
          <img
            className="inline object-cover w-40 h-40 mr-2 rounded-full"
            alt={`${carModel} profile picture`}
            src={!profileBikeImageUrl ? `/images/avatars/default.png` : profileBikeImageUrl}
            onError={(e) => {
              e.target.src = `/images/avatars/default.png`;
            }}
          />
          <div className="container mt-3">
            <p className="text-xl font-medium text-center">
              {activeBtnFollow && isFollowingProfile === null ? (
                <Skeleton count={1} width={100} height={32} />
              ) : activeBtnFollow ? (
                <button
                  className="border border-logoColor-base bg-logoColor-base font-bold text-sm rounded text-white w-full h-8 mb-2 hover:bg-white hover:text-logoColor-base focus:outline-none"
                  type="button"
                  onClick={handleToggleFollow}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleToggleFollow();
                    }
                  }}
                >
                  {isFollowingProfile ? 'Unfollow' : 'Follow'}
                </button>
              ) : (
                <Link
                  to={`/p/${profileUsername}/edit`}
                  className="block border border-gray-500 bg-white font-bold text-sm rounded text-gray-500 w-full px-2 py-1 sm:mb-2 mb-0 hover:opacity-70 focus:outline-none"
                >
                  プロフィールの編集
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col text-center mt-2 sm:mt-0 sm:text-left">
        <div className="container">
          <p className="text-2xl mr-4 leading-none">
            <span className="text-xs leading-none block">ユーザーネーム</span>
            {!profileUsername ? <Skeleton count={1} height={24} width={100} /> : profileUsername}
          </p>
          <p className="text-2xl mr-4 leading-none mt-3">
            <span className="text-xs leading-none block mb-1">バイク</span>
            {!maker ? <Skeleton count={1} height={24} width={100} /> : maker}
            {'　'}
            {!carModel ? <Skeleton count={1} height={24} width={100} /> : carModel}
          </p>
        </div>
        <div className="container flex mt-6 justify-center sm:justify-start">
          {!followers || !following ? (
            <Skeleton count={1} width={300} height={24} />
          ) : (
            <>
              <p className="mr-10">
                <span className="font-bold text-lg">{photosCount}</span> posts
              </p>
              <button onClick={openFollowedModal} type="button" className="mr-10 block focus:outline-none">
                <span className="font-bold text-lg">{followerCount}</span>
                {` `}
                {followerCount === 1 ? `follower` : `followers`}
              </button>
              <button onClick={openFollowingModal} type="button" className="block focus:outline-none">
                <span className="font-bold text-lg">{following?.length}</span> following
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  photosCount: PropTypes.number.isRequired,
  followerCount: PropTypes.number.isRequired,
  setFollowerCount: PropTypes.func.isRequired,
  setIsOpenFollowingModal: PropTypes.func.isRequired,
  setIsOpenFollowedModal: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    docId: PropTypes.string,
    userId: PropTypes.string,
    bikeImageUrl: PropTypes.string,
    carModel: PropTypes.string,
    maker: PropTypes.string,
    username: PropTypes.string,
    followers: PropTypes.array,
    following: PropTypes.array,
  }).isRequired,
};
