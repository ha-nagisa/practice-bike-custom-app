import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import FirebaseContext from '../../context/firebase';
import UserContext from '../../context/user';
import UserPhotosContext from '../../context/userPhotos';

export default function AddComment({ docId, comments, setComments, commentInput }) {
  const [comment, setComment] = useState('');
  const { firebase, FieldValue } = useContext(FirebaseContext);
  const {
    user: { displayName },
  } = useContext(UserContext);
  const { loggedInUserPhotos, setLoggedInUserPhotos } = useContext(UserPhotosContext);

  const handleSubmitComment = (event) => {
    event.preventDefault();

    setComments([...comments, { displayName, comment }]);
    setComment('');

    if (loggedInUserPhotos.some((photo) => photo.docId === docId)) {
      setLoggedInUserPhotos((prevPhotos) =>
        prevPhotos.map((photo) => {
          if (photo.docId === docId) {
            photo.comments = [...photo.comments, { displayName, comment }];
          }
          return photo;
        })
      );
    }

    return firebase
      .firestore()
      .collection('photos')
      .doc(docId)
      .update({
        comments: FieldValue.arrayUnion({ displayName, comment }),
      });
  };

  return (
    <div className="border-t border-gray-primary">
      <form
        className="flex justify-between pl-0"
        method="POST"
        onSubmit={(event) => (comment.length >= 1 ? handleSubmitComment(event) : event.preventDefault())}
      >
        <input
          aria-label="Add a comment"
          autoComplete="off"
          className="text-sm text-gray-base w-full sm:py-5 sm:px-4 py-4 px-3 focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base"
          type="text"
          name="add-comment"
          placeholder="コメントを入力"
          value={comment}
          onChange={({ target }) => setComment(target.value)}
          ref={commentInput}
        />
        <button
          className={`px-5 text-sm font-bold text-logoColor-base focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base ${
            !comment && 'opacity-25'
          }`}
          type="button"
          disabled={comment.length < 1}
          onClick={handleSubmitComment}
        >
          Post
        </button>
      </form>
    </div>
  );
}

AddComment.propTypes = {
  docId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  setComments: PropTypes.func.isRequired,
  commentInput: PropTypes.object,
};
