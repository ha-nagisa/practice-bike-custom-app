import PropTypes from 'prop-types';

export default function Footer({ category, title }) {
  return (
    <div className="p-4 pt-2 pb-1">
      <p className="italic font-bold text-lg">{title.length > 40 ? `${title.substr(0, 40)}...` : title}</p>
      <p className="italic border-b border-gray-400 text-sm pb-2 mt-1">
        カテゴリー : <span className="text-logoColor-base">{category}</span>
      </p>
    </div>
  );
}

Footer.propTypes = {
  category: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
