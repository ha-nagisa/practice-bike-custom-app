import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { updateLoggedInUserFollowing, updateFollowedUserFollowers, getUserByUserId } from '../../services/firebase';
import LoggedInUserContext from '../../context/logged-in-user';

export default function MobileSuggestedProfile({ profileDocId, username, profileId, userId, loggedInUserDocId, profileImageUrl }) {
  const [followed, setFollowed] = useState(false);
  const { setActiveUser } = useContext(LoggedInUserContext);

  async function handleFollowUser() {
    setFollowed(true);
    await updateLoggedInUserFollowing(loggedInUserDocId, profileId, false);
    await updateFollowedUserFollowers(profileDocId, userId, false);
    const [user] = await getUserByUserId(userId);
    setActiveUser(user);
  }
  return !followed ? (
    <div className="flex items-center border border-gray-400 rounded p-2 mr-2">
      <div className="mr-2">
        <Link className="w-auto break-all" to={`/p/${username}`}>
          <img
            className="rounded-full w-10 h-10 object-cover flex mr-3"
            src={!profileImageUrl ? `/images/avatars/${username}.jpg` : profileImageUrl}
            alt=""
            onError={(e) => {
              e.target.src = `/images/avatars/default.png`;
            }}
          />
        </Link>
      </div>
      <div>
        <Link className="w-auto break-all" to={`/p/${username}`}>
          <p className="font-bold text-sm break-all text-center">{username}</p>
        </Link>
        <button
          className="rounded text-xs font-bold bg-white text-logoColor-base px-2 py-1 border border-logoColor-base hover:bg-logoColor-base hover:text-white"
          type="button"
          onClick={handleFollowUser}
        >
          Follow
        </button>
      </div>
    </div>
  ) : null;
}

MobileSuggestedProfile.propTypes = {
  profileDocId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  profileId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  loggedInUserDocId: PropTypes.string.isRequired,
  profileImageUrl: PropTypes.string.isRequired,
};
