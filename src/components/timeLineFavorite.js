import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotosFavorite from '../hooks/use-photos-favorite';
import Post from './post';

export default function TimelineFavorite() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotosFavorite(user);

  return (
    <>
      {!photos ? (
        <>
          <div className="col-span-2">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
          <div className="col-span-2">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
        </>
      ) : (
        photos.map((content) => <Post key={content.docId} content={content} />)
      )}
    </>
  );
}
