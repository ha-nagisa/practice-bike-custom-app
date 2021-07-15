import PropTypes from 'prop-types';

export default function Image({ src, title }) {
  return <img className="w-full" src={!src ? 'images/postDummy.jpg' : src} alt={title} />;
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
