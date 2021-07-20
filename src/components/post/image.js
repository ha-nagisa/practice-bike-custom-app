import PropTypes from 'prop-types';
import { useState } from 'react';

export default function Image({ realSrc, title }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      className={`w-full ${loaded ? null : 'animate-pulse'}`}
      src={loaded ? realSrc : '/images/postDummy.jpg'}
      alt={title}
      onLoad={() => setLoaded(true)}
    />
  );
}

Image.propTypes = {
  realSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
