import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';

export default function PostIcon() {
  return (
    <div className="fixed bottom-8 right-8 bg-logoColor-base h-14 w-14 rounded-full flex justify-center items-center hover:opacity-70">
      <Link to={ROUTES.POST} className="cursor-pointer">
        <img className="w-10 h-10" src="/images/postIcon.png" alt="post icon" />
      </Link>
    </div>
  );
}
