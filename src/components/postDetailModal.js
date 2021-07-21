import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ModalContext from '../context/modal';
import backfaceFixed from '../utils/backfaceFixed';

export default function PostDetailModal({ setIsModalOpen }) {
  const { modalInfo } = useContext(ModalContext);

  const closeModal = () => {
    backfaceFixed(false);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed z-30 top-0 left-0 w-full h-full">
      <button type="button" onClick={() => closeModal()} className="bg-black-base opacity-70 cursor-pointer h-full w-full" />
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-80vh w-3/5 z-10 rounded max-h-600px min-w-300px max-w-540px">
        <div className="bg-white overflow-auto w-full h-full rounded">
          <div className="text-lg w-full p-5 overflow-auto">
            <p className="text-base font-bold mb-3 md:text-xl">{modalInfo.title}</p>
            <div className="rounded mb-3">
              <img className="rounded" src={modalInfo.imageSrc} alt={modalInfo.title} />
            </div>
            <div className="mb-3">
              <p className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">カスタマイズ説明</p>
              <p className="md:text-sm text-xs font-semibold">{modalInfo.description}</p>
            </div>
            <div className="mb-3">
              <p className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">カテゴリー</p>
              <p className="md:text-sm text-xs font-semibold">{modalInfo.category}</p>
            </div>
            <div className="mb-3">
              <p className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">作業時間</p>
              <p className="md:text-sm text-xs font-semibold">{modalInfo.workHours}</p>
            </div>
            <div>
              <p className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">工賃</p>
              <p className="md:text-sm text-xs font-semibold">{modalInfo.workMoney}円</p>
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

PostDetailModal.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired,
};
