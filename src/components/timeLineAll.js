import { useContext } from 'react';
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

  const addNextPhoto = async (doc) => {
    const { photosWithUserDetails: nextPhotos, lastDoc } = await getPhotosAll(user?.userId, doc);
    setLatestDoc(lastDoc);
    if (loggedInUserPhotos) {
      const nextPhotosInUserPhotos = nextPhotos.map((nextPhoto) => {
        const copyLoggedInUserPhotos = loggedInUserPhotos;
        if (copyLoggedInUserPhotos.length > 0 && copyLoggedInUserPhotos.some((userPhoto) => userPhoto.docId === nextPhoto.docId)) {
          return copyLoggedInUserPhotos.filter((userPhoto) => userPhoto.docId === nextPhoto.docId)[0];
        }
        return nextPhoto;
      });
      nextPhotosInUserPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      setPhotos((prevPhotos) => [...prevPhotos, ...nextPhotosInUserPhotos]);
      return;
    }
    nextPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
    setPhotos((prevPhotos) => [...prevPhotos, ...nextPhotos]);
    console.log(latestDoc);
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
          <button onClick={() => addNextPhoto(latestDoc)} type="button">
            もっと見る
          </button>
        </>
      )}
    </>
  );
}
