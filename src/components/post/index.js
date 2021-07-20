import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import Header from './header';
import Image from './image';
import Actions from './actions';
import Footer from './footer';
import Comments from './comments';
import { getUserByUsername } from '../../services/firebase';

export default function Post({ content }) {
  const location = useLocation();
  const isProfilePage = location.pathname.includes('/p/');

  const [postUser, setPostUser] = useState('');
  useEffect(() => {
    const getUser = async () => {
      const user = await getUserByUsername(content.username);
      setPostUser(user[0]);
    };
    getUser();
  }, [content.username]);

  const commentInput = useRef(null);
  const handleFocus = () => commentInput.current.focus();

  return (
    <div className={`${isProfilePage ? 'group' : 'col-span-4 sm:col-span-2'}  sm;mb-12 mb-8`}>
      <div className="rounded border bg-white border-gray-primary">
        <Header content={content} postUser={postUser} isProfilePage={isProfilePage} />
        <Image realSrc={content.imageSrc} title={content.title} />
        <Footer description={content.description} username={content.username} title={content.title} category={content.category} />
        <Actions docId={content.docId} totalLikes={content.likes.length} likedPhoto={content.userLikedPhoto} handleFocus={handleFocus} />
        <Comments docId={content.docId} comments={content.comments} posted={content.dateCreated} commentInput={commentInput} />
      </div>
    </div>
  );
}

Post.propTypes = {
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
};
