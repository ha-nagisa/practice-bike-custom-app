import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../context/logged-in-user';
import usePhotos from '../hooks/use-photos';
import Post from './post';

export default function Timeline() {
  const { user } = useContext(LoggedInUserContext);
  const { photos } = usePhotos(user);

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
