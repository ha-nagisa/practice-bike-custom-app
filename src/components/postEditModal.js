import React from 'react';
import PropTypes from 'prop-types';

export default function PostEditModal({ isModalOpen, setIsModalOpen }) {
  return (
    <>
      <div className="bg-white p-6 fixed top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-50vh w-4/5 z-10">
        <div>
          <h1>postEditModalです。</h1>
          <p>
            モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。モーダルウィンドウが開いています。
          </p>
        </div>
        <div>✕</div>
      </div>
      <button
        type="button"
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="bg-black-base opacity-70 cursor-pointer fixed top-0 left-0 h-full w-full"
      />
    </>
  );
}

PostEditModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};
