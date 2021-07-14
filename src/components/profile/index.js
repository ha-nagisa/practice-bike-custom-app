import { useReducer, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Header from './header';
import Photos from './photos';
import { getUserPhotosByUserId } from '../../services/firebase';
import UserContext from '../../context/user';
import UserPhotosContext from '../../context/userPhotos';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Profile({ user, setIsOpenFollowingModal, setIsOpenFollowedModal }) {
  const { user: activeUser } = useContext(LoggedInUserContext);
  const { loggedInUserPhotos } = useContext(UserPhotosContext);
  const reducer = (state, newState) => ({ ...state, ...newState });
  const initialState = {
    profile: {},
    photosCollection: null,
    followerCount: 0,
  };

  const [{ profile, photosCollection, followerCount }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function getProfileInfoAndPhotos() {
      let photos = await getUserPhotosByUserId(user.userId);
      photos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      if (activeUser?.userId === user?.userId) {
        photos = !loggedInUserPhotos ? photos : loggedInUserPhotos;
      }
      dispatch({ profile: user, photosCollection: photos, followerCount: user.followers.length });
    }
    getProfileInfoAndPhotos();
  }, [user.username]);

  return (
    <>
      <Header
        photosCount={photosCollection ? photosCollection.length : 0}
        profile={profile}
        followerCount={followerCount}
        setFollowerCount={dispatch}
        setIsOpenFollowingModal={setIsOpenFollowingModal}
        setIsOpenFollowedModal={setIsOpenFollowedModal}
      />
      <Photos photos={photosCollection} />
    </>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    docId: PropTypes.string,
    dateCreated: PropTypes.string,
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
  setIsOpenFollowedModal: PropTypes.func.isRequired,
};
