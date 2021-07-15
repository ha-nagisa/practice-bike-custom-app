/* eslint-disable no-nested-ternary */
import { useContext, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotos from '../hooks/use-photos';
import { getPhotos } from '../services/firebase';
import Post from './post';

export default function Timeline() {
  const { user } = useContext(LoggedInUserContext);
  const { photos, setPhotos, latestDoc, setLatestDoc } = usePhotos(user);
  const [isLoading, setIsLoading] = useState(false);
  const isDisplayMoreRead = photos ? photos.length > 5 : false;
  const isReachingEnd = latestDoc === undefined;

  const addNextPhoto = async (doc) => {
    setIsLoading(true);
    if (latestDoc) {
      const { photosWithUserDetails: nextPhotos, lastDoc } = await getPhotos(user?.userId, user?.following, doc);
      setLatestDoc(lastDoc);
      nextPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      setPhotos((prevPhotos) => [...prevPhotos, ...nextPhotos]);
    }
    setIsLoading(false);
  };

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
        <>
          {photos.map((content) => (
            <Post key={content.docId} content={content} />
          ))}
          {isDisplayMoreRead ? (
            <div className="col-span-4 text-center pb-10 pt-5">
              <button
                onClick={() => addNextPhoto(latestDoc)}
                type="button"
                className={`font-bold border text-gray-700 border-gray-700 px-3 py-2 rounded-md ${
                  isLoading || isReachingEnd ? 'opacity-50 cursor-default' : 'hover:text-white hover:bg-gray-700'
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
