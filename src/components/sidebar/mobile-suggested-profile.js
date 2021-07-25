import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { updateLoggedInUserFollowing, updateFollowedUserFollowers, getUserByUserId } from '../../services/firebase';
import LoggedInUserContext from '../../context/logged-in-user';
import DEFAULT_IMAGE_PATH from '../../constants/paths';

export default function MobileSuggestedProfile({ profileDocId, username, profileId, userId, loggedInUserDocId, profileImageUrl }) {
  const { user: activeUser, setActiveUser } = useContext(LoggedInUserContext);
  const [loaded, setLoaded] = useState(false);
  const isFollowing = activeUser.following.some((userId) => userId === profileId);

  async function handleFollowUser() {
    await updateLoggedInUserFollowing(loggedInUserDocId, profileId, false);
    await updateFollowedUserFollowers(profileDocId, userId, false);
    const [user] = await getUserByUserId(userId);
    setActiveUser(user);
  }
  async function handleUnFollowUser() {
    await updateLoggedInUserFollowing(loggedInUserDocId, profileId, true);
    await updateFollowedUserFollowers(profileDocId, userId, true);
    const [user] = await getUserByUserId(userId);
    setActiveUser(user);
  }

  return (
    <div className="flex items-center justify-center border border-gray-400 rounded p-2 mr-2">
      <div className="mr-2">
        <Link className="w-auto break-all" to={`/p/${username}`}>
          <img
            className="rounded-full w-10 h-10 object-cover flex mr-3"
            // eslint-disable-next-line no-nested-ternary
            src={loaded ? profileImageUrl || DEFAULT_IMAGE_PATH : DEFAULT_IMAGE_PATH}
            alt={`${username} profile`}
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE_PATH;
            }}
            onLoad={() => setLoaded(true)}
          />
        </Link>
      </div>
      <div>
        <Link className="w-auto break-all" to={`/p/${username}`}>
          <p className="font-bold text-sm break-all text-center">{username}</p>
        </Link>
        {!isFollowing ? (
          <button
            className="rounded text-xs font-bold bg-white text-logoColor-base px-2 py-1 border border-logoColor-base hover:bg-logoColor-base hover:text-white"
            type="button"
            onClick={handleFollowUser}
          >
            Follow
          </button>
        ) : (
          <button
            className="rounded text-xs font-bold bg-white text-logoColor-base px-2 py-1 border border-logoColor-base hover:bg-logoColor-base hover:text-white"
            type="button"
            onClick={handleUnFollowUser}
          >
            Unfollow
          </button>
        )}
      </div>
    </div>
  );
}

MobileSuggestedProfile.propTypes = {
  profileDocId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  profileId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  loggedInUserDocId: PropTypes.string.isRequired,
  profileImageUrl: PropTypes.string.isRequired,
};
