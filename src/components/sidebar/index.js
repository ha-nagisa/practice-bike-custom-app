import { useContext } from 'react';
import User from './user';
import Suggestions from './suggestions';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Sidebar() {
  const { user: { docId = '', carModel, username, userId, following, bikeImageUrl } = {} } = useContext(LoggedInUserContext);

  return (
    <div className="p-4">
      <Suggestions userId={userId} following={following} loggedInUserDocId={docId} />
    </div>
  );
}
