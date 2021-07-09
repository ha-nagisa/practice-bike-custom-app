import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotosAll from '../hooks/use-photos-all';
import Post from './post';

export default function TimelineAll() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotosAll(user);
  return (
    <>
      {!photos ? (
        <>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
          <div className="sm:col-span-2 col-span-4">
            <Skeleton count={4} height={400} className="mb-5" />
          </div>
        </>
      ) : (
        photos.map((content) => <Post key={content.docId} content={content} />)
      )}
    </>
  );
}
