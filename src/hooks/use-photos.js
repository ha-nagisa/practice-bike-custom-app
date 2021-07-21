import { useState, useEffect } from 'react';
import { getPhotos } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      // フォローしているユーザーはいるか
      if (user || user?.following?.length > 0) {
        const { photosWithUserDetails: followedUserPhotos } = await getPhotos(user.userId, user.following);
        if (followedUserPhotos) {
          // 日付順に並び替える
          followedUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
          setPhotos(followedUserPhotos);
        } else {
          setPhotos([]);
        }
      } else {
        setPhotos([]);
      }
    }

    getTimelinePhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.following]);

  return { photos };
}
