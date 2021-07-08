// モーダル表示時に背景固定
const backfaceFixed = (fixed) => {
  const scrollbarWidth = window.innerWidth - document.body.clientWidth;
  document.body.style.paddingRight = fixed ? `${scrollbarWidth}px` : '';

  const scrollingElement = () => {
    const browser = window.navigator.userAgent.toLowerCase();
    if ('scrollingElement' in document) return document.scrollingElement;
    if (browser.indexOf('webkit') > 0) return document.body;
    return document.documentElement;
  };

  const scrollY = fixed ? scrollingElement().scrollTop : parseInt(document.body.style.top || '0');

  const styles = {
    height: '100vh',
    left: '0',
    overflow: 'hidden',
    position: 'fixed',
    top: `${scrollY * -1}px`,
    width: '100vw',
  };

  Object.keys(styles).forEach((key) => {
    document.body.style[key] = fixed ? styles[key] : '';
  });

  if (!fixed) window.scrollTo(0, scrollY * -1);
};

export { backfaceFixed };
