import PropTypes from 'prop-types';

export default function Image({ src, title }) {
  return <img src={src} alt={title} />;
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
