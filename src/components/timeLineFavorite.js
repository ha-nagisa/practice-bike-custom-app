/* eslint-disable no-nested-ternary */
import { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotosFavorite from '../hooks/use-photos-favorite';
import Post from './post';

export default function TimelineFavorite() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotosFavorite(user);
  const [displayPhotos, setDisplayPhotos] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (photos) {
      setDisplayPhotos(photos.filter((e, key) => key < 6));
    }
  }, [photos]);
  console.log(displayPhotos);
  console.log(photos);
  console.log(user);

  const getNextFavoritePhoto = () => {
    setPage((n) => n + 1);
    setDisplayPhotos((prev) => [...prev, ...photos.filter((e, key) => 6 * page - 6 < key && 6 * page > key)]);
  };

  return (
    <>
      {displayPhotos === null ? (
        <>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
        </>
      ) : displayPhotos.length === 0 ? (
        <div className="col-span-4 text-xl text-center pt-8">お気に入りにした投稿はありません。気になる投稿をお気に入りしよう！</div>
      ) : (
        displayPhotos.map((content) => <Post key={content.docId} content={content} />)
      )}
    </>
  );
}
