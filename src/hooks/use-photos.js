import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getPhotos } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      // フォローしているユーザーはいるか
      if (user?.following?.length > 0) {
        const followedUserPhotos = await getPhotos(user.userId, user.following);
        // 日付順に並び替える
        followedUserPhotos.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
        setPhotos(followedUserPhotos);
      } else {
        setPhotos([]);
      }
    }

    getTimelinePhotos();
  }, [user?.userId, user?.following]);

  return { photos };
}
