import { useState, useEffect } from 'react';
import { getPhotosFavorite } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotosFavorite() {
      // does the user actually follow people?
      if (user?.likes?.length > 0) {
        const favoritedPhotos = await getPhotosFavorite(user.userId, user.likes);
        // re-arrange array to be newest photos first by dateCreated
        favoritedPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
        setPhotos(favoritedPhotos);
      }
    }

    getTimelinePhotosFavorite();
  }, [user?.userId, user?.following]);

  return { photos };
}
