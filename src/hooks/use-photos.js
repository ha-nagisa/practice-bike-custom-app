import { useState, useEffect } from 'react';
import { getPhotos } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);
  const [latestDoc, setLatestDoc] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      // フォローしているユーザーはいるか
      if (user?.following?.length > 0) {
        const { photosWithUserDetails: followedUserPhotos, lastDoc } = await getPhotos(user.userId, user.following, latestDoc);
        setLatestDoc(lastDoc);
        // 日付順に並び替える
        followedUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
        setPhotos(followedUserPhotos);
      } else {
        setPhotos([]);
      }
    }

    if (latestDoc === null) {
      getTimelinePhotos();
    }
  }, [user?.userId, user?.following]);

  return { photos, setPhotos, latestDoc, setLatestDoc };
}
