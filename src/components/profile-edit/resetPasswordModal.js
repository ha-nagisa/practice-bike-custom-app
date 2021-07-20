import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import FirebaseContext from '../../context/firebase';
import { backfaceFixed } from '../../utils/backfaceFixed';

export default function ResetPasswordModal({ setIsResetModalOpen, resetEmail, setResetEmail, successResetToast }) {
  const { firebase } = useContext(FirebaseContext);

  const sendResetEmail = async () => {
    await firebase
      .auth()
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        setResetEmail('');
        setIsResetModalOpen(false);
        backfaceFixed(false);
        successResetToast();
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail('');
      });
  };

  const closeModal = () => {
    backfaceFixed(false);
    setIsResetModalOpen(false);
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full">
      <button type="button" onClick={() => closeModal()} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-250px w-11/12 max-w-350px z-10 rounded">
        <div className="bg-white flex justify-center items-center overflow-auto w-full h-full rounded">
          <div className="inline-block p-5">
            <p>メールアドレスを入力してください。パスワードのリセットに関する案内のメールをお送りいたします。</p>
            <div className="mt-7 flex items-center justify-center">
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                placeholder="email@example.com"
                onChange={({ target }) => setResetEmail(target.value)}
                value={resetEmail}
                className="mr-5 border-0 border-b-2 border-gray-400 focus:border-logoColor-base focus:outline-none focus:shadow-none focus:ring-0 focus:translate-x-2"
              />
              <button
                type="button"
                onClick={sendResetEmail}
                className="transform hover:translate-x-2.5 ease-in-out duration-150 cursor-pointer hover:opacity-70"
              >
                <img className="h-10 w-10 object-cover" src="/images/resetEmailIcon.png" alt="送信ボタン" />
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

ResetPasswordModal.propTypes = {
  setIsResetModalOpen: PropTypes.func.isRequired,
  resetEmail: PropTypes.string.isRequired,
  setResetEmail: PropTypes.func.isRequired,
  successResetToast: PropTypes.func.isRequired,
};
