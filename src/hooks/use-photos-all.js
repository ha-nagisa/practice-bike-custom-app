import { useState, useEffect } from 'react';
import { getPhotosAll } from '../services/firebase';

export default function usePhotosAll(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotosAll() {
      const allPhotos = await getPhotosAll(user?.userId, user?.following);
      // re-arrange array to be newest photos first by dateCreated
      allPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
      setPhotos(allPhotos);
    }

    getTimelinePhotosAll();
  }, [user?.userId, user?.following]);

  return { photos };
}
