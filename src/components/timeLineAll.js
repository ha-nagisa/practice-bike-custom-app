/* eslint-disable no-nested-ternary */
import { useContext, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import UserPhotosContext from '../context/userPhotos';
import usePhotosAll from '../hooks/use-photos-all';
import { getPhotosAll } from '../services/firebase';
import Post from './post';

export default function TimelineAll() {
  const { user } = useContext(LoggedInUserContext);
  const { loggedInUserPhotos } = useContext(UserPhotosContext);
  const { photos, setPhotos, latestDoc, setLatestDoc } = usePhotosAll(user);
  const [isLoading, setIsLoading] = useState(false);
  const isDisplayMoreRead = photos ? photos.length > 5 : false;
  const isReachingEnd = latestDoc === undefined;

  const addNextPhoto = async (doc) => {
    setIsLoading(true);
    if (latestDoc) {
      const { photosWithUserDetails: nextPhotos, lastDoc } = await getPhotosAll(user?.userId, doc);
      setLatestDoc(lastDoc);
      if (loggedInUserPhotos) {
        const nextPhotosInUserPhotos = nextPhotos.map((nextPhoto) => {
          const copyLoggedInUserPhotos = [...loggedInUserPhotos];
          if (copyLoggedInUserPhotos.length > 0 && copyLoggedInUserPhotos.some((userPhoto) => userPhoto.docId === nextPhoto.docId)) {
            return copyLoggedInUserPhotos.filter((userPhoto) => userPhoto.docId === nextPhoto.docId)[0];
          }
          return nextPhoto;
        });
        nextPhotosInUserPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
        setPhotos((prevPhotos) => [...prevPhotos, ...nextPhotosInUserPhotos]);
        setIsLoading(false);
        return;
      }
      nextPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      setPhotos((prevPhotos) => [...prevPhotos, ...nextPhotos]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {!photos ? (
        <>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
        </>
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
