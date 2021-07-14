import { useState, useEffect } from 'react';
import { getUserPhotosByUserId } from '../services/firebase';

export default function useActiveUserPhotos(userId) {
  const [loggedInUserPhotos, setLoggedInUserPhotos] = useState(null);

  useEffect(() => {
    async function getUserPhotosAll() {
      const Photos = await getUserPhotosByUserId(userId);
      setLoggedInUserPhotos(Photos);
    }

    getUserPhotosAll();
  }, [userId]);

  return { loggedInUserPhotos, setLoggedInUserPhotos };
}
