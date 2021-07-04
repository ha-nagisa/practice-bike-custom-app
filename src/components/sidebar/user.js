import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { DEFAULT_IMAGE_PATH } from '../../constants/paths';

export default function User({ username, carModel, bikeImageUrl }) {
  return !username || !carModel ? (
    <Skeleton count={1} height={61} />
  ) : (
    <Link to={`/p/${username}`} className="grid grid-cols-4 gap-4 mb-6 items-center">
      <div className="flex items-center justify-between col-span-1">
        <img
          className="rounded-full bject-cover w-16 h-16 flex"
          src={bikeImageUrl}
          alt=""
          onError={(e) => {
            e.target.src = DEFAULT_IMAGE_PATH;
          }}
        />
      </div>
      <div className="col-span-3">
        <p className="font-bold text-sm">{username}</p>
        <p className="text-sm">{carModel}</p>
      </div>
    </Link>
  );
}

User.propTypes = {
  username: PropTypes.string,
  carModel: PropTypes.string,
  bikeImageUrl: PropTypes.string,
};
