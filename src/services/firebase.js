import { format } from 'date-fns';
import { firebase, FieldValue } from '../lib/firebase';

export async function doesUsernameExist(username) {
  const result = await firebase.firestore().collection('users').where('username', '==', username).get();

  return result.docs.length > 0;
}

export async function getUserByUsername(username) {
  const result = await firebase.firestore().collection('users').where('username', '==', username).get();

  return result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
    dateCreated: format(item.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));
}

// get user from the firestore where userId === userId (passed from the auth)
export async function getUserByUserId(userId) {
  const result = await firebase.firestore().collection('users').where('userId', '==', userId).get();
  const user = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
    dateCreated: format(item.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));
  return user;
}

// check all conditions before limit results
export async function getSuggestedProfiles(userId, following, maker) {
  let query = firebase.firestore().collection('users');

  if (following.length > 0) {
    query = query.where('userId', 'not-in', [...following, userId]).where('maker', '==', maker);
  } else {
    query = query.where('userId', '!=', userId).where('maker', '==', maker);
  }
  const result = await query.limit(15).get();

  const profiles = result.docs.map((user) => ({
    ...user.data(),
    docId: user.id,
    dateCreated: format(user.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));

  const gettedProfileIds = profiles.map((user) => user.userId);

  if (result.docs.length < 15) {
    let query = firebase.firestore().collection('users');
    if (following.length > 0) {
      query = query.where('userId', 'not-in', [...following, userId, ...gettedProfileIds]);
    } else {
      query = query.where('userId', 'not-in', [...following, ...gettedProfileIds]);
    }
    const addResult = await query.limit(15 - result.docs.length).get();

    const addProfiles = addResult.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
      dateCreated: format(user.data().dateCreated.toDate(), 'yyyy/MM/dd'),
    }));

    const sumProfiles = [...addProfiles, ...profiles];
    sumProfiles.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));

    return sumProfiles;
  }

  return profiles;
}

export async function updateLoggedInUserFollowing(
  loggedInUserDocId, // currently logged in user document id (karl's profile)
  profileId, // the user that karl requests to follow
  isFollowingProfile // true/false (am i currently following this person?)
) {
  return firebase
    .firestore()
    .collection('users')
    .doc(loggedInUserDocId)
    .update({
      following: isFollowingProfile ? FieldValue.arrayRemove(profileId) : FieldValue.arrayUnion(profileId),
    });
}

export async function updateFollowedUserFollowers(
  profileDocId, // currently logged in user document id (karl's profile)
  loggedInUserDocId, // the user that karl requests to follow
  isFollowingProfile // true/false (am i currently following this person?)
) {
  return firebase
    .firestore()
    .collection('users')
    .doc(profileDocId)
    .update({
      followers: isFollowingProfile ? FieldValue.arrayRemove(loggedInUserDocId) : FieldValue.arrayUnion(loggedInUserDocId),
    });
}

export async function getPhotos(userId, following) {
  // [5,4,2] => following
  const result = await firebase.firestore().collection('photos').where('userId', 'in', following).get();

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
    dateCreated: format(photo.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));

  const photosWithUserDetails = await Promise.all(
    userFollowedPhotos.map(async (photo) => {
      let userLikedPhoto = false;
      if (photo.likes.includes(userId)) {
        userLikedPhoto = true;
      }
      // photo.userId = 2
      const user = await getUserByUserId(photo.userId);
      // raphael
      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return photosWithUserDetails;
}

export async function getPhotosFavorite(userId, likes) {
  const result = await firebase.firestore().collection('photos').get();

  const photoAll = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
    dateCreated: format(photo.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));

  const likesPhotos = likes.map((likedDocId) => {
    const a = { ...photoAll.filter((photo) => photo.docId === likedDocId) };
    return a[0];
  });

  const photosWithUserDetails = await Promise.all(
    likesPhotos.map(async (photo) => {
      let userLikedPhoto = false;
      if (photo.likes.includes(userId)) {
        userLikedPhoto = true;
      }
      // photo.userId = 2
      const user = await getUserByUserId(photo.userId);
      // raphael
      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return photosWithUserDetails;
}

export async function getPhotosAll(userId, latestDoc) {
  let result;
  if (latestDoc) {
    result = await firebase
      .firestore()
      .collection('photos')
      .orderBy('dateCreated', 'desc')
      .startAfter(latestDoc || 0)
      .limit(6)
      .get();
  } else {
    result = await firebase.firestore().collection('photos').orderBy('dateCreated', 'desc').limit(6).get();
  }

  const lastDoc = result.docs[result.docs.length - 1];

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
    dateCreated: format(photo.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));

  console.log(userFollowedPhotos);

  const photosWithUserDetails = await Promise.all(
    userFollowedPhotos.map(async (photo) => {
      let userLikedPhoto = false;
      if (photo.likes.includes(userId)) {
        userLikedPhoto = true;
      }
      const user = await getUserByUserId(photo.userId);
      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return { photosWithUserDetails, lastDoc };
}

export async function getUserPhotosByUserId(userId) {
  if (userId) {
    const result = await firebase.firestore().collection('photos').where('userId', '==', userId).orderBy('dateCreated', 'disc').get();

    const userPhotos = result.docs.map((photo) => ({
      ...photo.data(),
      docId: photo.id,
      dateCreated: format(photo.data().dateCreated.toDate(), 'yyyy/MM/dd'),
    }));

    const photosWithUserDetails = await Promise.all(
      userPhotos.map(async (photo) => {
        let userLikedPhoto = false;
        if (photo.likes.includes(userId)) {
          userLikedPhoto = true;
        }

        const user = await getUserByUserId(photo.userId);

        const { username } = user[0];
        return { username, ...photo, userLikedPhoto };
      })
    );

    console.log(photosWithUserDetails);

    return photosWithUserDetails;
  }
  return null;
}

export async function isUserFollowingProfile(loggedInUserUsername, profileUserId) {
  const result = await firebase
    .firestore()
    .collection('users')
    .where('username', '==', loggedInUserUsername) // karl (active logged in user)
    .where('following', 'array-contains', profileUserId)
    .get();
  const [response = {}] = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
    dateCreated: format(item.data().dateCreated.toDate(), 'yyyy/MM/dd'),
  }));

  return response.userId;
}

export async function toggleFollow(isFollowingProfile, activeUserDocId, profileDocId, profileUserId, followingUserId) {
  // 1st param: karl's doc id
  // 2nd param: raphael's user id
  // 3rd param: is the user following this profile? e.g. does karl follow raphael? (true/false)
  await updateLoggedInUserFollowing(activeUserDocId, profileUserId, isFollowingProfile);

  // 1st param: karl's user id
  // 2nd param: raphael's doc id
  // 3rd param: is the user following this profile? e.g. does karl follow raphael? (true/false)
  await updateFollowedUserFollowers(profileDocId, followingUserId, isFollowingProfile);
}

export async function getProfileFollowingUsers(following) {
  let users = null;

  if (following.length > 0) {
    const result = await firebase
      .firestore()
      .collection('users')
      .where('userId', 'in', [...following])
      .get();

    users = result.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
      dateCreated: format(user.data().dateCreated.toDate(), 'yyyy/MM/dd'),
    }));
  }

  return users;
}

export async function getProfileFollowedgUsers(followed) {
  let users = null;

  if (followed.length > 0) {
    const result = await firebase
      .firestore()
      .collection('users')
      .where('userId', 'in', [...followed])
      .get();

    users = result.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
      dateCreated: format(user.data().dateCreated.toDate(), 'yyyy/MM/dd'),
    }));
  }

  return users;
}
