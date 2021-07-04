import { useContext } from 'react';
import User from './user';
import Suggestions from './suggestions';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Sidebar() {
  const { user: { docId = '', carModel, username, userId, following, bikeImageUrl } = {} } = useContext(LoggedInUserContext);

  return (
    <div className="p-4">
      <User username={username} carModel={carModel} bikeImageUrl={bikeImageUrl} />
      <Suggestions userId={userId} following={following} loggedInUserDocId={docId} />
    </div>
  );
}
