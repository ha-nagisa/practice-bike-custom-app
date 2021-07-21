import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import FirebaseContext from '../../context/firebase';
import backfaceFixed from '../../utils/backfaceFixed';
import * as ROUTES from '../../constants/routes';
import AccountDeleteToastContext from '../../context/accountDeleteToast';
import LoggedInUserContext from '../../context/logged-in-user';
import UserPhotosContext from '../../context/userPhotos';
import { getDocumentByArraysIn } from '../../services/firebase';

export default function DeleteAccountModal({ setIsDeleteAccountModalOpen }) {
  const { firebase, FieldValue } = useContext(FirebaseContext);
  const { user: activeUser } = useContext(LoggedInUserContext);
  const { loggedInUserPhotos } = useContext(UserPhotosContext);
  const history = useHistory();
  const { successDeleteToast } = useContext(AccountDeleteToastContext);
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    backfaceFixed(false);
    setIsDeleteAccountModalOpen(false);
  };

  const deleteAccount = async () => {
    console.log('ボタンが押されました');
    setIsLoading(true);
    try {
      // Authから削除されたユーザーを削除
      await firebase
        .auth()
        .currentUser.delete()
        .then(() => {
          console.log('authからユーザー削除成功');
        })
        .catch((error) => {
          throw new Error(error.message);
        });

      // 削除されたユーザーが投稿した写真にお気に入りしたユーザーのlikesから削除
      const activeUserPhotoIds = loggedInUserPhotos.map((photo) => photo.docId);
      console.log(activeUserPhotoIds);
      const getQuery = (batch) => firebase.firestore().collection('users').where('likes', 'array-contains-any', batch);
      const LikedUser = await getDocumentByArraysIn(activeUserPhotoIds, getQuery);
      console.log(LikedUser);
      if (LikedUser && LikedUser.length > 0) {
        await Promise.all(
          LikedUser.map((user) => {
            firebase
              .firestore()
              .collection('users')
              .doc(user.docId)
              .update({
                likes: user.likes.filter((likeId) => activeUserPhotoIds.some((activeUserId) => likeId !== activeUserId)),
              });
            return user;
          })
        )
          .then(() => {
            console.log('削除されたユーザーが投稿した写真にお気に入りしたユーザーのlikesから削除成功');
          })
          .catch((error) => {
            throw new Error(error.message);
          });
      }

      // 投稿のお気に入りにある削除されたユーザーのIDを削除
      console.log(activeUser.userId);
      await firebase
        .firestore()
        .collection('photos')
        .where('likes', 'array-contains', `${activeUser.userId}`)
        .get()
        .then(async (res) => {
          console.log(res.docs.map((doc) => ({ ...doc.data() })));
          await Promise.all(
            res.docs.map((doc) => {
              firebase
                .firestore()
                .collection('photos')
                .doc(doc.id)
                .update({
                  likes: FieldValue.arrayRemove(activeUser.userId),
                });
              return doc;
            })
          )
            .then(() => {
              console.log('投稿のお気に入りにある削除されたユーザーのIDを削除成功');
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        });

      // 削除されたユーザーのコメントを削除
      await firebase
        .firestore()
        .collection('photos')
        .where('comments', '!=', [])
        .get()
        .then(async (res) => {
          console.log(res.docs.map((doc) => ({ ...doc.data() })));
          if (res.docs.length > 0) {
            await Promise.all(
              res.docs.map((doc) => {
                if (doc.data().comments.some((comment) => comment.displayName === activeUser.username)) {
                  console.log(doc.id);
                  firebase
                    .firestore()
                    .collection('photos')
                    .doc(doc.id)
                    .update({
                      comments: doc.data().comments.filter((comment) => comment.displayName !== activeUser.username),
                    });
                }
                return doc;
              })
            )
              .then(() => {
                console.log('削除されたユーザーのコメントを削除成功');
              })
              .catch((error) => {
                throw new Error(error.message);
              });
          }
        });

      // すべてのユーザーのフォローから削除されたユーザーを削除
      await firebase
        .firestore()
        .collection('users')
        .where('following', 'array-contains', `${activeUser.userId}`)
        .get()
        .then(async (res) => {
          console.log(res.docs.map((doc) => ({ ...doc.data() })));
          if (res.docs.length > 0) {
            await Promise.all(
              res.docs.map((doc) => {
                console.log(doc.id);
                firebase
                  .firestore()
                  .collection('users')
                  .doc(doc.id)
                  .update({
                    following: FieldValue.arrayRemove(activeUser.userId),
                  });
                return doc;
              })
            )
              .then(() => {
                console.log('すべてのユーザーのフォローから削除されたユーザーを削除成功');
              })
              .catch((error) => {
                throw new Error(error.message);
              });
          }
        });

      // すべてのユーザーのフォロワーから削除されたユーザーを削除
      await firebase
        .firestore()
        .collection('users')
        .where('followers', 'array-contains', `${activeUser.userId}`)
        .get()
        .then(async (res) => {
          console.log(res.docs.map((doc) => ({ ...doc.data() })));
          if (res.docs.length > 0) {
            await Promise.all(
              res.docs.map((doc) => {
                console.log(doc.id);
                firebase
                  .firestore()
                  .collection('users')
                  .doc(doc.id)
                  .update({
                    followers: FieldValue.arrayRemove(activeUser.userId),
                  });
                return doc;
              })
            )
              .then(() => {
                console.log('すべてのユーザーのフォロワーから削除されたユーザーを削除成功');
              })
              .catch((error) => {
                throw new Error(error.message);
              });
          }
        });

      // 削除されたユーザーをコレクションから削除
      await firebase
        .firestore()
        .collection('users')
        .doc(activeUser.docId)
        .delete()
        .then(() => {
          console.log('firestoreからユーザー削除成功');
        })
        .catch((error) => {
          throw new Error(error.message);
        });

      // 削除されたユーザーの投稿したPhotoを削除
      if (loggedInUserPhotos) {
        await Promise.all(
          loggedInUserPhotos.map((photo) => {
            firebase.firestore().collection('photos').doc(photo.docId).delete();
            return photo;
          })
        )
          .then(() => {
            console.log('投稿したPhotoを削除成功');
          })
          .catch((error) => {
            throw new Error(error.message);
          });
      }
      successDeleteToast();
      backfaceFixed(false);
      history.push(ROUTES.SIGN_UP);
      setIsLoading(false);
    } catch (error) {
      if (error.message.indexOf('sensitive')) {
        alert('ログインしてから時間が経過しています。再度ログインし直してください。');
      } else {
        alert(error.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full">
      <button type="button" onClick={() => closeModal()} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-170px w-330px z-10 rounded">
        <div className="bg-white flex justify-center items-center overflow-auto w-full h-full rounded">
          <div className="inline-block font-bold p-5">
            <p className="text-base">アカウントに関する情報はすべて削除されます。 本当にアカウントを削除しますか？</p>
            <div className="mt-5 flex items-center justify-center">
              <button
                type="button"
                className="border border-gray-700 text-gray-700 px-3 py-2 mr-5 rounded-md hover:opacity-70 text-sm"
                onClick={closeModal}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={`bg-red-600 text-white px-3 py-2 rounded-md  0 text-sm ${isLoading ? 'cursor-default opacity-50' : 'hover:opacity-70'}`}
                onClick={deleteAccount}
                disabled={isLoading}
              >
                {isLoading ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
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

DeleteAccountModal.propTypes = {
  setIsDeleteAccountModalOpen: PropTypes.func.isRequired,
};
