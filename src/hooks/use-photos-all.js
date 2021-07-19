import { useState, useEffect, useContext } from 'react';
import UserPhotosContext from '../context/userPhotos';
import { getPhotosAll } from '../services/firebase';

export default function usePhotosAll(user) {
  const [photos, setPhotos] = useState(null);
  const { loggedInUserPhotos } = useContext(UserPhotosContext);
  const [latestDoc, setLatestDoc] = useState(null);

  useEffect(() => {
    async function getTimelinePhotosAll() {
      const { photosWithUserDetails: allPhotos, lastDoc } = await getPhotosAll(user?.userId, latestDoc);
      setLatestDoc(lastDoc);

      if (loggedInUserPhotos) {
        const allPhotosInUserPhotos = allPhotos.map((allphoto) => {
          const copyLoggedInUserPhotos = [...loggedInUserPhotos];
          if (copyLoggedInUserPhotos.length > 0 && copyLoggedInUserPhotos.some((userPhoto) => userPhoto.docId === allphoto.docId)) {
            return copyLoggedInUserPhotos.filter((userPhoto) => userPhoto.docId === allphoto.docId)[0];
          }
          return allphoto;
        });
        allPhotosInUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
        setPhotos(allPhotosInUserPhotos);
        return;
      }

      allPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
      setPhotos(allPhotos);
    }
    if (latestDoc === null) {
      getTimelinePhotosAll();
    }
  }, [user?.userId, loggedInUserPhotos]);

  return { photos, setPhotos, latestDoc, setLatestDoc };
}
