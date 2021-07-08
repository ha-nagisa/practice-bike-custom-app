import { useContext } from 'react';
import User from './user';
import Suggestions from './suggestions';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Sidebar() {
  return (
    <div className="p-4 hidden lg:block">
      <Suggestions />
    </div>
  );
}
