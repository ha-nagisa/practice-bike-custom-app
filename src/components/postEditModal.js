/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-onchange */

import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import ModalContext from '../context/modal';
import FirebaseContext from '../context/firebase';
import UserContext from '../context/user';
import useUser from '../hooks/use-user';
import UserPhotosContext from '../context/userPhotos';

export default function PostEditModal({ isModalOpen, setIsModalOpen }) {
  const { user: loggedInUser } = useContext(UserContext);
  const { loggedInUserPhotos, setLoggedInUserPhotos } = useContext(UserPhotosContext);
  const { user } = useUser(loggedInUser?.uid);
  const { modalInfo } = useContext(ModalContext);
  const { firebase } = useContext(FirebaseContext);

  console.log(loggedInUserPhotos);

  const [title, setTitle] = useState(modalInfo.title ? modalInfo.title : '');
  const [description, setDiscription] = useState(modalInfo.description ? modalInfo.description : '');
  const [category, setCategory] = useState(modalInfo.category ? modalInfo.category : '');
  const [workHours, setWorkHours] = useState(modalInfo.workHours ? modalInfo.workHours : '');
  const [workMoney, setWorkMoney] = useState(modalInfo.workMoney ? modalInfo.workMoney : null);
  const [workImage, setWorkImage] = useState(modalInfo.imageSrc ? modalInfo.imageSrc : null);
  const [previewWorkImageSrc, setPreviewWorkImageSrc] = useState(modalInfo.imageSrc ? modalInfo.imageSrc : null);

  const isInvalid = title === '' || description === '' || category === '' || workHours === '' || workMoney === '' || workImage === null;
  console.log(isInvalid);

  const onChangeImageHandler = (e) => {
    if (e.target.files[0]) {
      setWorkImage(e.target.files[0]);

      const selectedFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewWorkImageSrc(imageUrl);

      e.target.value = '';
    }
  };

  const handleChangePost = async (event) => {
    event.preventDefault();
    try {
      let workImageUrl = modalInfo.imageSrc;
      if (workImage && workImage !== modalInfo.imageSrc) {
        const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const N = 16;
        const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
          .map((n) => S[n % S.length])
          .join('');
        const fileName = `${randomChar}_${workImage.name}`;
        await firebase.storage().ref(`posts/${fileName}`).put(workImage);
        workImageUrl = await firebase.storage().ref('posts').child(fileName).getDownloadURL();
      }

      firebase.firestore().collection('photos').doc(modalInfo.docId).update({
        title,
        description,
        imageSrc: workImageUrl,
        category,
        workMoney,
        workHours,
      });

      if (loggedInUserPhotos) {
        const copyLoggedInUserPhotos = [...loggedInUserPhotos];
        const updatedLoggedInUserPhotos = copyLoggedInUserPhotos.map((userPhoto) => {
          if (userPhoto.docId === modalInfo.docId) {
            userPhoto.title = title;
            userPhoto.description = description;
            userPhoto.imageSrc = workImageUrl;
            userPhoto.category = category;
            userPhoto.workMoney = workMoney;
            userPhoto.workHours = workHours;
          }
          return userPhoto;
        });
        setLoggedInUserPhotos(updatedLoggedInUserPhotos);
      }

      setIsModalOpen(!isModalOpen);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="fixed z-10 top-0 left-0 w-full h-full">
        <button type="button" onClick={() => setIsModalOpen(!isModalOpen)} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
        <div className="bg-white flex justify-center overflow-auto absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-80vh w-4/5 z-10 rounded max-w-screen-lg">
          <form className="grid bg-white rounded-lg w-full" onSubmit={handleChangePost} method="POST">
            <div className="grid grid-cols-1 mt-8 mx-7">
              <label className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold mb-1">写真をアップロード</label>
              <div className="flex items-center justify-center w-full">
                {workImage ? (
                  <div>
                    <div>
                      <label className="text-sm text-logoColor-littleLight cursor-pointer underline mb-2 inline-block">
                        写真を変更する
                        <input type="file" className="hidden" onChange={onChangeImageHandler} />
                      </label>
                    </div>
                    <img src={previewWorkImageSrc} alt="" />
                  </div>
                ) : (
                  <label className="flex flex-col border-4 border-dashed w-full h-44 hover:bg-gray-100 hover:border-logoColor-light group cursor-pointer">
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg
                        className="w-10 h-10 text-gray-500 group-hover:text-logoColor-light"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="lowercase text-sm text-gray-400 group-hover:text-logoColor-light pt-1 tracking-wider">アップロード</p>
                    </div>
                    <input type="file" className="hidden" onChange={onChangeImageHandler} />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 mt-5 mx-7">
              <label htmlFor="title" className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">
                タイトル
              </label>
              <input
                className="py-2 px-3 rounded-lg border-2 border-black-light mt-1 focus:outline-none focus:ring-2 focus:ring-logoColor-light focus:border-transparent"
                type="text"
                name="title"
                id="title"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 mt-5 mx-7">
              <label htmlFor="description" className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">
                カスタマイズ説明
              </label>
              <textarea
                className="py-2 px-3 rounded-lg border-2 border-black-light mt-1 focus:outline-none focus:ring-2 focus:ring-logoColor-light focus:border-transparent"
                type="text"
                placeholder="カスタマイズ説明"
                name="description"
                id="description"
                rows="8"
                value={description}
                onChange={(e) => setDiscription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 mt-5 mx-7">
              <span className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">カテゴリー</span>
              <div className="mt-2">
                <div className="flex items-start mb-1">
                  <input
                    id="soupUp"
                    name="category"
                    type="radio"
                    className="focus:ring-logoColor-base h-4 w-4 text-logoColor-base border-black-light"
                    value="スープアップ"
                    onChange={(e) => setCategory(e.target.value)}
                    checked={category === 'スープアップ'}
                  />
                  <label htmlFor="soupUp" className="ml-3 block text-sm font-medium text-gray-700">
                    スープアップ
                    <br />
                    <span className="text-xs">圧縮や排気量を上げて、スピードとパワーをアップする</span>
                  </label>
                </div>
                <div className="flex items-start mb-1">
                  <input
                    id="tuneUp"
                    name="category"
                    type="radio"
                    className="focus:ring-logoColor-base h-4 w-4 text-logoColor-base border-black-light"
                    value="チューンナップ"
                    onChange={(e) => setCategory(e.target.value)}
                    checked={category === 'チューンナップ'}
                  />
                  <label htmlFor="tuneUp" className="ml-3 block text-sm font-medium text-gray-700">
                    チューンナップ
                    <br />
                    <span className="text-xs">耐久性、乗り心地、バランスなどの調整</span>
                  </label>
                </div>
                <div className="flex items-start mb-1">
                  <input
                    id="dressUp"
                    name="category"
                    type="radio"
                    className="focus:ring-logoColor-base  h-4 w-4 text-logoColor-base border-black-light"
                    value="ドレスアップ"
                    onChange={(e) => setCategory(e.target.value)}
                    checked={category === 'ドレスアップ'}
                  />
                  <label htmlFor="dressUp" className="ml-3 block text-sm font-medium text-gray-700">
                    ドレスアップ
                    <br />
                    <span className="text-xs">車高、タイヤ、フレーム加工など見た目の変化</span>
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    id="utilityUp"
                    name="category"
                    type="radio"
                    className="focus:ring-logoColor-base  h-4 w-4 text-logoColor-base border-black-light"
                    value="ユーティリティアップ"
                    onChange={(e) => setCategory(e.target.value)}
                    checked={category === 'ユーティリティアップ'}
                  />
                  <label htmlFor="utilityUp" className="ml-3 block text-sm font-medium text-gray-700">
                    ユーティリティアップ
                    <br />
                    <span className="text-xs">ガードの取り付け、電源取り出しなど、実用性を上げる</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mt-5 mx-7">
              <div className="grid grid-cols-1">
                <label className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">作業時間</label>
                <select
                  className="py-2 px-3 rounded-lg border-2 border-black-light mt-1 focus:outline-none focus:ring-2 focus:ring-logoColor-light focus:border-transparent"
                  id="workHours"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                >
                  <option value="60分以内">60分以内</option>
                  <option value="1~2時間">1~2時間</option>
                  <option value="2~3時間">2~3時間</option>
                  <option value="3~4時間">3~4時間</option>
                  <option value="4~5時間">4~5時間</option>
                  <option value="5~6時間">5~6時間</option>
                  <option value="6~7時間">6~7時間</option>
                  <option value="7~8時間">7~8時間</option>
                  <option value="8~9時間">8~9時間</option>
                  <option value="9~10時間">9~10時間</option>
                  <option value="10~11時間">10~11時間</option>
                  <option value="11~12時間">11~12時間</option>
                  <option value="12~13時間">12~13時間</option>
                  <option value="13~14時間">13~14時間</option>
                  <option value="14~15時間">14~15時間</option>
                  <option value="15~16時間">15~16時間</option>
                  <option value="16~17時間">16~17時間</option>
                  <option value="17~18時間">17~18時間</option>
                  <option value="18~19時間">18~19時間</option>
                  <option value="19~20時間">19~20時間</option>
                  <option value="20~21時間">20~21時間</option>
                  <option value="21~22時間">21~22時間</option>
                  <option value="22~23時間">22~23時間</option>
                  <option value="23~24時間">23~24時間</option>
                  <option value="24時間以上">24時間以上</option>
                  <option value="2日間">2日間</option>
                  <option value="3日間">3日間</option>
                  <option value="4日間">4日間</option>
                  <option value="5日間">5日間</option>
                  <option value="6日間">6日間</option>
                  <option value="7日間">7日間</option>
                  <option value="1週間以上">1週間以上</option>
                  <option value="1ヶ月以上">1ヶ月以上</option>
                </select>
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="money" className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">
                  工賃
                </label>
                <div>
                  <input
                    className="w-7/12 sm:w-9/12 py-2 px-3 rounded-lg border-2 border-black-light mt-1 focus:outline-none focus:ring-2 focus:ring-logoColor-light focus:border-transparent"
                    type="number"
                    placeholder="000"
                    name="money"
                    id="money"
                    value={workMoney}
                    onChange={(e) => setWorkMoney(e.target.value)}
                  />
                  <p className="inline-block ml-2">円</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center  md:gap-8 gap-4 pt-5 pb-5 mt-8 mb-6">
              <button
                type="button"
                className="w-auto bg-white rounded-lg shadow-xl font-medium text-black-base px-4 py-2 hover:opacity-70 border border-black-base"
                onClick={() => setIsModalOpen(!isModalOpen)}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`w-auto bg-logoColor-base rounded-lg shadow-xl font-medium text-white px-4 py-2 hover:opacity-70 ${
                  isInvalid && 'opacity-50'
                }`}
                disabled={isInvalid}
              >
                更新
              </button>
            </div>
          </form>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="bg-black-base p-2 rounded-full absolute top-0 right-0  overflow-visible z-20 transform -translate-y-1/2 translate-x-1/2 hover:opacity-80"
        >
          <img width="16px" height="16px" src="/images/closeButton.png" alt="閉じるボタン" />
        </button>
      </div>
    </>
  );
}

PostEditModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};
