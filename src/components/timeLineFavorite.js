/* eslint-disable no-nested-ternary */
import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotosFavorite from '../hooks/use-photos-favorite';
import Post from './post';

export default function TimelineFavorite() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotosFavorite(user);
  console.log(photos);

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
        <div className="col-span-4 text-xl text-center pt-8">お気に入りにした投稿はありません。気になる投稿をお気に入りしよう！</div>
      ) : (
        photos.map((content) => <Post key={content.docId} content={content} />)
      )}
    </>
  );
}
