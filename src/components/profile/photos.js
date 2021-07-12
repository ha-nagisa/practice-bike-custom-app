/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import Post from '../post';

export default function Photos({ photos }) {
  return (
    <div className="border-t border-gray-primary mt-8 pt-4 mx-3.5 h-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4 mb-12">
        {!photos
          ? new Array(12).fill(0).map((_, i) => (
              <div className="group">
                <Skeleton key={i} height={300} />
              </div>
            ))
          : photos.length > 0
          ? photos.map((content) => <Post key={content.docId} content={content} />)
          : null}
      </div>

      {!photos || (photos.length === 0 && <p className="text-center text-2xl">まだ投稿はありません。</p>)}
    </div>
  );
}

Photos.propTypes = {
  photos: PropTypes.array,
};
