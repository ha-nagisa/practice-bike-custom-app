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
  }));
}

// get user from the firestore where userId === userId (passed from the auth)
export async function getUserByUserId(userId) {
  const result = await firebase.firestore().collection('users').where('userId', '==', userId).get();
  const user = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
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
  }));

  const gettedProfileIds = profiles.map((user) => user.userId);

  if (result.docs.length < 15) {
    let query = firebase.firestore().collection('users');
    if (following.length > 0) {
      query = query.where('userId', 'not-in', [...following, userId, ...gettedProfileIds]);
    } else {
      query = query.where('userId', 'not-in', [...following, userId, ...gettedProfileIds]);
    }
    const addResult = await query.limit(15 - result.docs.length).get();

    const addProfiles = addResult.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
    }));

    const sumProfiles = [...addProfiles, ...profiles];
    sumProfiles.sort((a, b) => b.dateCreated - a.dateCreated);

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
    })
    .catch((error) => {
      alert(error.message);
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
    })
    .catch((error) => {
      alert(error.message);
    });
}

export async function getPhotos(userId, following, latestDoc) {
  let result;
  console.log(following);
  if (latestDoc) {
    result = await firebase
      .firestore()
      .collection('photos')
      .where('userId', 'in', following)
      .orderBy('dateCreated', 'desc')
      .startAfter(latestDoc || 0)
      .limit(6)
      .get();
  } else {
    result = await firebase.firestore().collection('photos').where('userId', 'in', following).orderBy('dateCreated', 'desc').limit(6).get();
  }

  const lastDoc = result ? result.docs[result.docs.length - 1] : undefined;

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
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

  return { photosWithUserDetails, lastDoc };
}

export async function getPhotosFavorite(userId, likes) {
  let likesPhotos;

  await Promise.all(likes.map((docId) => firebase.firestore().collection('photos').doc(docId).get())).then((docs) => {
    likesPhotos = docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    }));
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

  const lastDoc = result ? result.docs[result.docs.length - 1] : undefined;

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
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

  return { photosWithUserDetails, lastDoc };
}

export async function getUserPhotosByUserId(userId) {
  if (userId) {
    const result = await firebase.firestore().collection('photos').where('userId', '==', userId).get();

    const userPhotos = result.docs.map((photo) => ({
      ...photo.data(),
      docId: photo.id,
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
  }));

  return response.userId;
}

export async function toggleFollow(isFollowingProfile, activeUserDocId, profileDocId, profileUserId, followingUserId) {
  await updateLoggedInUserFollowing(activeUserDocId, profileUserId, isFollowingProfile);

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
    }));
  }

  return users;
}

export async function getProfileFollowedgUsers(followed) {
  let users = [];

  if (followed.length > 0) {
    const result = await firebase
      .firestore()
      .collection('users')
      .where('userId', 'in', [...followed])
      .get();

    users = result.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
    }));
  }

  return users;
}
