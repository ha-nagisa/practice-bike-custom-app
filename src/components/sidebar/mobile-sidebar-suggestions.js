/* eslint-disable no-nested-ternary */

import React, { useContext } from 'react';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Skeleton from 'react-loading-skeleton';
import LoggedInUserContext from '../../context/logged-in-user';
import SuggestionsProfilesContext from '../../context/suggestions-profiles';
import MobileSuggestedProfile from './mobile-suggested-profile';

export default function MobileSidebarSuggestions() {
  const { profiles } = useContext(SuggestionsProfilesContext);
  const { user } = useContext(LoggedInUserContext);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4.5,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          slidesToShow: 3.5,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return !profiles ? (
    <Skeleton count={1} height={150} className="mt-5" />
  ) : profiles.length > 0 ? (
    <div className="mt-4">
      <Slider {...settings}>
        {profiles.map((profile) => (
          <MobileSuggestedProfile
            key={profile.docId}
            profileDocId={profile.docId}
            username={profile.username}
            profileId={profile.userId}
            userId={user.userId}
            loggedInUserDocId={user.docId}
            profileImageUrl={profile.bikeImageUrl}
          />
        ))}
      </Slider>
    </div>
  ) : null;
}
