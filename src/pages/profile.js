/* eslint-disable no-nested-ternary */

import { useParams, useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { getUserByUsername, getUserPhotosByUserId } from '../services/firebase';
import * as ROUTES from '../constants/routes';
import Header from '../components/header';
import UserProfile from '../components/profile';
import PostIcon from '../components/postIcon';
import FollowedUserModal from '../components/profile/followedUserModal';
import FollowingUserModal from '../components/profile/followingUserModal';
import ModalContext from '../context/modal';
import PostEditModal from '../components/postEditModal';
import PostDetailModal from '../components/postDetailModal';
import LoggedInUserContext from '../context/logged-in-user';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const history = useHistory();
  const [isOpenFollowingModal, setIsOpenFollowingModal] = useState(false);
  const [isOpenFollowedModal, setIsOpenFollowedModal] = useState(false);
  const { isModalOpen, setIsModalOpen } = useContext(ModalContext);
  const { user: activeUser } = useContext(LoggedInUserContext);
  const isPostUser = username === activeUser?.username;

  useEffect(() => {
    async function checkUserExists() {
      const [user] = await getUserByUsername(username);
      if (user?.userId && isPostUser) {
        setUser(activeUser);
      } else if (user?.userId) {
        setUser(user);
      } else {
        history.push(ROUTES.NOT_FOUND);
      }
    }

    checkUserExists();
  }, [username, history]);

  return user?.username ? (
    <div className="bg-gray-background relative">
      <Header />
      <div className="mx-auto max-w-screen-xl pb-5">
        <UserProfile user={user} setIsOpenFollowingModal={setIsOpenFollowingModal} setIsOpenFollowedModal={setIsOpenFollowedModal} />
      </div>
      {isOpenFollowingModal ? <FollowingUserModal user={user} setIsOpenFollowingModal={setIsOpenFollowingModal} /> : null}
      {isOpenFollowedModal ? <FollowedUserModal user={user} setIsOpenFollowedModal={setIsOpenFollowedModal} /> : null}
      {isModalOpen ? (
        isPostUser ? (
          <PostEditModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        ) : (
          <PostDetailModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        )
      ) : null}
      <PostIcon />
    </div>
  ) : null;
}
