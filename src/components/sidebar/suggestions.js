/* eslint-disable no-nested-ternary */
import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import SuggestedProfile from './suggested-profile';
import SuggestionsProfilesContext from '../../context/suggestions-profiles';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Suggestions() {
  const { profiles } = useContext(SuggestionsProfilesContext);
  const { user } = useContext(LoggedInUserContext);

  return !profiles ? (
    <Skeleton count={1} height={150} className="mt-5" />
  ) : profiles.length > 0 ? (
    <div className="rounded flex flex-col">
      <div className="text-sm flex items-center align-items justify-between mb-2">
        <p className="font-bold text-gray-base">あなたにおすすめのユーザー</p>
      </div>
      <div className="mt-4 grid gap-5">
        {profiles.map((profile) => (
          <SuggestedProfile
            key={profile.docId}
            profileDocId={profile.docId}
            username={profile.username}
            profileId={profile.userId}
            userId={user.userId}
            loggedInUserDocId={user.docId}
            profileImageUrl={profile.bikeImageUrl}
          />
        ))}
      </div>
    </div>
  ) : null;
}
