import React, { useState } from 'react';

import MobileSidebarSuggestions from './mobile-sidebar-suggestions';

export default function MobileSidebar() {
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);

  return (
    <div className="lg:hidden block col-span-4 mb-2">
      <div className="flex items-center">
        <button
          onClick={() => setIsOpenSuggestions(!isOpenSuggestions)}
          type="button"
          className="text-gray-400 inline-block border-2 border-gray-400 p-1 mr-2 text-base h-8 rounded hover:opacity-70 focus:outline-none focus:border-logoColor-light"
        >
          あなたにおすすめのユーザー
        </button>
        <button
          onClick={() => setIsOpenSuggestions(!isOpenSuggestions)}
          type="button"
          className="border-2 border-gray-400 p-1 h-8 rounded hover:opacity-70 focus:outline-none focus:border-logoColor-light"
        >
          <img
            className={`h-4 w-4 object-cover transition duration-150 ease-in-out ${isOpenSuggestions ? 'transform rotate-180' : null}`}
            src="/images/arrowBottom.png"
            alt="あなたにおすすめのユーザー"
          />
        </button>
      </div>
      {isOpenSuggestions ? <MobileSidebarSuggestions /> : null}
    </div>
  );
}
