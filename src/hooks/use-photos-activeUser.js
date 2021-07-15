import { useState, useEffect } from 'react';
import { getUserPhotosByUserId } from '../services/firebase';

export default function useActiveUserPhotos(userId) {
  const [loggedInUserPhotos, setLoggedInUserPhotos] = useState(null);

  useEffect(() => {
    async function getUserPhotosAll() {
      const Photos = await getUserPhotosByUserId(userId);
      if (Photos) {
        Photos.sort((a, b) => b.dateCreated - a.dateCreated);
      }
      setLoggedInUserPhotos(Photos);
      console.log(loggedInUserPhotos);
    }

    getUserPhotosAll();
  }, [userId]);

  return { loggedInUserPhotos, setLoggedInUserPhotos };
}
