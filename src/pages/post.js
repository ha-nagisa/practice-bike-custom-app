import { useEffect } from 'react';
import Header from '../components/header';
import useUser from '../hooks/use-user';
import LoggedInUserContext from '../context/logged-in-user';
import useAuthListener from '../hooks/use-auth-listener';
import PostPhoto from '../components/postPhoto';

export default function Post() {
  const { user: loggedInUser } = useAuthListener();
  const { user, setActiveUser } = useUser(loggedInUser.uid);
  useEffect(() => {
    document.title = 'POST | Instagram';
  }, []);

  return (
    <LoggedInUserContext.Provider value={{ user, setActiveUser }}>
      <div className="bg-gray-background">
        <Header />
        <PostPhoto />
      </div>
    </LoggedInUserContext.Provider>
  );
}
