/* eslint-disable no-nested-ternary */
import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotos from '../hooks/use-photos';
import Post from './post';

export default function Timeline() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotos(user);

  return (
    <>
      {photos === null ? (
        <>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
        </>
      ) : photos.length === 0 ? (
        <div className="col-span-4 text-xl text-center pt-8">フォローしているユーザーの投稿はありません。気になるユーザーをフォローしよう！</div>
      ) : (
        photos.map((content) => <Post key={content.docId} content={content} />)
      )}
    </>
  );
}
