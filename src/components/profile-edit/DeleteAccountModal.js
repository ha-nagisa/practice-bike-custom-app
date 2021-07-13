import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import FirebaseContext from '../../context/firebase';
import { backfaceFixed } from '../../utils/backfaceFixed';
import * as ROUTES from '../../constants/routes';
import AccountDeleteToastContext from '../../context/accountDeleteToast';

export default function DeleteAccountModal({ setIsDeleteAccountModalOpen }) {
  const { firebase } = useContext(FirebaseContext);
  const history = useHistory();
  const { successDeleteToast } = useContext(AccountDeleteToastContext);

  const closeModal = () => {
    backfaceFixed(false);
    setIsDeleteAccountModalOpen(false);
  };

  const deleteAccount = () => {
    firebase
      .auth()
      .currentUser.delete()
      .then(() => {
        console.log('成功');
        successDeleteToast();
        backfaceFixed(false);
        history.push(ROUTES.SIGN_UP);
      })
      .catch((error) => {
        console.log('失敗');
        alert(error.message);
      });
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full">
      <button type="button" onClick={() => closeModal()} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-170px w-330px z-10 rounded">
        <div className="bg-white flex justify-center items-center overflow-auto w-full h-full rounded">
          <div className="inline-block font-bold p-5">
            <p className="text-base">本当にアカウントを削除しますか？</p>
            <div className="mt-5 flex items-center justify-center">
              <button
                type="button"
                className="border border-gray-700 text-gray-700 px-3 py-2 mr-5 rounded-md hover:opacity-70 text-sm"
                onClick={closeModal}
              >
                キャンセル
              </button>
              <button type="button" className="bg-red-600 text-white px-3 py-2 rounded-md hover:opacity-70 0 text-sm" onClick={deleteAccount}>
                削除
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
