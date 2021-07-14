import { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import UserPhotosContext from '../context/userPhotos';
import { getPhotosFavorite } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);
  const { loggedInUserPhotos } = useContext(UserPhotosContext);

  useEffect(() => {
    async function getTimelinePhotosFavorite() {
      if (user?.likes?.length > 0) {
        const favoritedPhotos = await getPhotosFavorite(user.userId, user.likes);

        if (loggedInUserPhotos) {
          const favoritedPhotoInUserPhotos = favoritedPhotos.map((favaritedphoto) => {
            const copyLoggedInUserPhotos = loggedInUserPhotos;
            console.log(copyLoggedInUserPhotos);
            if (copyLoggedInUserPhotos && copyLoggedInUserPhotos.some((userPhoto) => userPhoto.docId === favaritedphoto.docId)) {
              return copyLoggedInUserPhotos.filter((userPhoto) => userPhoto.docId === favaritedphoto.docId)[0];
            }
            return favaritedphoto;
          });

          favoritedPhotoInUserPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
          setPhotos(favoritedPhotoInUserPhotos);
          return;
        }

        favoritedPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
        setPhotos(favoritedPhotos);
      } else {
        setPhotos([]);
      }
    }

    getTimelinePhotosFavorite();
  }, [user?.userId, loggedInUserPhotos, user?.likes]);

  return { photos };
}
