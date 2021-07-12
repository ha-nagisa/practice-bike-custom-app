/* eslint-disable jsx-a11y/img-redundant-alt */
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ModalContext from '../../context/modal';
import UserContext from '../../context/user';
import { backfaceFixed } from '../../utils/backfaceFixed';

export default function Header({ content, postUser, isProfilePage }) {
  const { modalInfo, setModalInfo, isModalOpen, setIsModalOpen } = useContext(ModalContext);
  const { user: loggedInUser } = useContext(UserContext);
  const isPostUser = loggedInUser.displayName === content.username;

  const openPostEditModal = () => {
    setModalInfo(content);
    backfaceFixed(true);
    setIsModalOpen(!isModalOpen);
  };

  const openPostDetailModal = () => {
    setModalInfo(content);
    backfaceFixed(true);
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex border-b border-gray-primary h-4 p-4 py-8">
      <div className="flex items-center justify-between w-full">
        {isProfilePage ? null : (
          <Link to={`/p/${content.username}`} className="flex items-center">
            <img
              className="rounded-full h-8 w-8 flex mr-3"
              src={!postUser.bikeImageUrl ? `/images/avatars/default.png` : postUser.bikeImageUrl}
              alt={`${content.username} profile picture`}
            />
            <p className="font-bold">{content.username}</p>
          </Link>
        )}
        {isPostUser ? (
          <button
            className="flex items-center text-logoColor-base  outline-none rounded text-sm px-2 py-1 border border-gray-primary hover:opacity-70"
            type="button"
            onClick={openPostEditModal}
          >
            編集
            <div className="border-l border-gray-primary pl-2 ml-2 ">
              <img className="h-3 w-3 inline-block" src="/images/postEditIcon.png" alt="編集" />
            </div>
          </button>
        ) : (
          <button
            className="flex items-center text-logoColor-base  outline-none rounded text-sm px-2 py-1 border border-gray-primary hover:opacity-70"
            type="button"
            onClick={openPostDetailModal}
          >
            詳細
            <img className="h-4 w-4 inline-block ml-3 " src="/images/detail.png" alt="詳細を見る" />
          </button>
        )}
      </div>
    </div>
  );
}

Header.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    imageSrc: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    docId: PropTypes.string.isRequired,
    userLikedPhoto: PropTypes.bool.isRequired,
    likes: PropTypes.array.isRequired,
    comments: PropTypes.array.isRequired,
    dateCreated: PropTypes.number.isRequired,
  }),
  postUser: PropTypes.object.isRequired,
  isProfilePage: PropTypes.bool.isRequired,
};
