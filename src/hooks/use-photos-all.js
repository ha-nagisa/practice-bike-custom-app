import { useState, useEffect, useContext } from 'react';
import UserPhotosContext from '../context/userPhotos';
import { getPhotosAll } from '../services/firebase';

export default function usePhotosAll(user) {
  const [photos, setPhotos] = useState(null);
  const { loggedInUserPhotos, setLoggedInUserPhotos } = useContext(UserPhotosContext);
  console.log(loggedInUserPhotos);

  useEffect(() => {
    async function getTimelinePhotosAll() {
      const allPhotos = await getPhotosAll(user?.userId, user?.following);

      if (loggedInUserPhotos) {
        const allPhotosInUserPhotos = allPhotos.map((allphoto) => {
          const copyLoggedInUserPhotos = loggedInUserPhotos;
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

    getTimelinePhotosAll();
  }, [user?.userId, loggedInUserPhotos]);

  return { photos };
}
