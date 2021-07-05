import PropTypes from 'prop-types';

export default function Footer({ description, username, title }) {
  return (
    <div className="p-4 pt-2 pb-1">
      <p className="italic font-bold text-lg">{title.length > 40 ? `${title.substr(0, 40)}...` : title}</p>
      <p className="italic border-b border-gray-400 text-sm pb-2">{description?.length > 60 ? `${description.substr(0, 60)}...` : description}</p>
    </div>
  );
}

Footer.propTypes = {
  description: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
