import { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import FirebaseContext from '../context/firebase';
import * as ROUTES from '../constants/routes';

export default function Login() {
  const history = useHistory();
  const { firebase } = useContext(FirebaseContext);

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const isInvalid = password === '' || emailAddress === '';

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsActioning(true);
    try {
      await firebase.auth().signInWithEmailAndPassword(emailAddress, password);
      setIsActioning(false);
      history.push(ROUTES.DASHBOARD);
    } catch (error) {
      setEmailAddress('');
      setPassword('');
      setIsActioning(false);
      setError(error.message);
    }
  };

  useEffect(() => {
    document.title = 'Login - BUnBun BIKE';
  }, []);

  return (
    <div className="container flex mx-auto max-w-screen-lg items-center h-screen px-3 py-3 sm:py-0">
      <div className="hidden sm:flex w-1/2 shadow-lg">
        <div>
          <img src="/images/loginLogo.png" alt="Bun Bun BIKE" />
        </div>
      </div>
      <div className="flex flex-col w-full sm:w-1/2 sm:pt-harf sm:relative sm:border-0">
        <div className="flex flex-col items-center w-19/20 sm:w-4/5 bg-white p-4 mb-4 rounded mx-auto sm:mx-0 sm:absolute sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 shadow-lg">
          <div className="mb-5 block sm:hidden">
            <img src="/images/smLoginLogo.png" alt="Bun Bun BIKE" width="300px" />
          </div>
          <h1 className="hidden sm:flex justify-center w-full font-logoFont font-bold mb-5 text-2xl">ログイン</h1>

          {error && <p className="mb-4 text-xs text-red-primary">{error}</p>}

          <form onSubmit={handleLogin} method="POST">
            <input
              aria-label="Enter your email address"
              type="text"
              placeholder="メールアドレス"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setEmailAddress(target.value)}
              value={emailAddress}
            />
            <input
              aria-label="Enter your password"
              type="password"
              placeholder="パスワード"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setPassword(target.value)}
              value={password}
            />
            <button
              disabled={isInvalid}
              type="submit"
              className={`bg-logoColor-base border border-logoColor-base text-white w-full rounded h-10 font-bold mb-2 focus:outline-logoColor
              ${isInvalid || isActioning ? 'opacity-50 cursor-default' : 'hover:bg-white hover:text-logoColor-base'}`}
            >
              {isActioning ? '読み込み中...' : ' Login'}
            </button>
          </form>
          <p className="text-sm">
            アカウントをお持ちでないですか？{` `}
            <Link to={ROUTES.SIGN_UP} className="font-bold text-logoColor-base">
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
