import { useState, useEffect, useContext } from 'react';
import UserPhotosContext from '../context/userPhotos';
import { getPhotosFavorite } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);
  const { loggedInUserPhotos, setLoggedInUserPhotos } = useContext(UserPhotosContext);

  useEffect(() => {
    async function getTimelinePhotosFavorite() {
      // does the user actually follow people?
      if (user?.likes?.length > 0) {
        const favoritedPhotos = await getPhotosFavorite(user.userId, user.likes);

        if (loggedInUserPhotos) {
          const favoritedPhotoInUserPhotos = favoritedPhotos.map((favaritedphoto) => {
            const copyLoggedInUserPhotos = loggedInUserPhotos;
            if (copyLoggedInUserPhotos.some((userPhoto) => userPhoto.docId === favaritedphoto.docId)) {
              return copyLoggedInUserPhotos.filter((userPhoto) => userPhoto.docId === favaritedphoto.docId)[0];
            }
            return favaritedphoto;
          });

          favoritedPhotoInUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
          setPhotos(favoritedPhotoInUserPhotos);
          return;
        }
        favoritedPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
        setPhotos(favoritedPhotos);
      }
    }

    getTimelinePhotosFavorite();
  }, [user?.userId, loggedInUserPhotos]);

  return { photos };
}
