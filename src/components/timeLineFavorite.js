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
  const [isLoading, setIsLoading] = useState(false);
  const [isReachingEnd, setIsReachingEnd] = useState(false);
  const isDisplayMoreRead = photos ? photos.length > 5 : false;

  useEffect(() => {
    if (photos && page === 1) {
      setDisplayPhotos(photos.filter((e, key) => key < 6));
    }
  }, [photos]);

  const getNextFavoritePhoto = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    setDisplayPhotos((prev) => {
      const nextPhotos = [...prev, ...photos.filter((e, key) => 6 * nextPage - 7 < key && 6 * nextPage > key)];
      setIsReachingEnd(prev.length === nextPhotos.length);
      return nextPhotos;
    });
    setIsLoading(false);
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
        <>
          {displayPhotos.map((content) => (
            <Post key={content.docId} content={content} />
          ))}
          {isDisplayMoreRead ? (
            <div className="col-span-4 text-center pb-10 pt-5">
              <button
                type="button"
                onClick={getNextFavoritePhoto}
                className={`font-bold border text-gray-700 border-gray-700 px-3 py-2 rounded-md ${
                  isLoading || isReachingEnd
                    ? 'opacity-50 cursor-default'
                    : 'hover:text-white hover:bg-gray-700 focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base'
                } `}
                disabled={isLoading || isReachingEnd}
              >
                {isLoading ? '読み込み中...' : isReachingEnd ? 'すべて読み込み済み' : 'もっと見る'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
