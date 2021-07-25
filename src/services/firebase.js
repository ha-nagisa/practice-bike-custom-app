import { firebase, FieldValue } from '../lib/firebase';

// ユーザーネームを持ったユーザーが存在するかをチェック
export async function doesUsernameExist(username) {
  const result = await firebase.firestore().collection('users').where('username', '==', username).get();

  return result.docs.length > 0;
}

// ユーザーネームによってuserのドキュメントを取得
export async function getUserByUsername(username) {
  const result = await firebase.firestore().collection('users').where('username', '==', username).get();

  return result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));
}

// ユーザーのIDによってuserのドキュメントを取得
export async function getUserByUserId(userId) {
  const result = await firebase.firestore().collection('users').where('userId', '==', userId).get();
  const user = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));
  return user;
}

// firestoreからwhereを使用して、比較する配列が10個以上の場合にドキュメントを取得する関数
// おすすめのユーザー用
export async function getDocumentByArrays(arr, getQuery) {
  return new Promise((resolve) => {
    if (!arr) return resolve([]);

    const spliceArr = [...arr];
    const batches = [];

    while (spliceArr.length) {
      const batch = spliceArr.splice(0, 10);

      batches.push(
        new Promise((resolve) => {
          getQuery(batch)
            .get()
            .then((results) => {
              const profiles = results.docs.map((result) => ({
                ...result.data(),
                docId: result.id,
              }));
              const modifyProfiles = profiles.filter((profile) => !arr.includes(profile.userId));
              resolve(modifyProfiles);
            });
        })
      );
    }

    Promise.all(batches).then((content) => {
      const stackArr = [];
      const duplicatedDeleteArr = content.flat().filter((e) => {
        if (stackArr.indexOf(e.userId) === -1) {
          stackArr.push(e.userId);
          return true;
        }
        return false;
      });
      resolve(duplicatedDeleteArr);
    });
  });
}

// firestoreからwhereを使用して、比較する配列が10個以上の場合にドキュメントを取得する関数
// whereでINを使用しているドキュメントの取得
export async function getDocumentByArraysIn(arr, getQuery) {
  return new Promise((resolve) => {
    if (!arr) return resolve([]);

    const spliceArr = [...arr];
    const batches = [];

    while (spliceArr.length) {
      const batch = spliceArr.splice(0, 10);

      batches.push(
        new Promise((resolve) => {
          getQuery(batch)
            .get()
            .then((results) => {
              const profiles = results.docs.map((result) => ({
                ...result.data(),
                docId: result.id,
              }));
              resolve(profiles);
            });
        })
      );
    }

    Promise.all(batches).then((content) => {
      resolve(content.flat());
    });
  });
}

// おすすめのユーザーを取得
export async function getSuggestedProfiles(userId, following, maker) {
  const collectionPath = firebase.firestore().collection('users');
  let result;
  let profiles;

  if (following.length > 0) {
    const ids = [...following, userId];

    if (ids.length > 10) {
      const getQuery = (batch) => collectionPath.where('userId', 'not-in', batch).where('maker', '==', maker).limit(100);
      profiles = await getDocumentByArrays(ids, getQuery);
    } else {
      result = await collectionPath
        .where('userId', 'not-in', [...following, userId])
        .where('maker', '==', maker)
        .limit(15)
        .get();

      profiles = result.docs.map((user) => ({
        ...user.data(),
        docId: user.id,
      }));
    }
  } else {
    result = await collectionPath.where('userId', '!=', userId).where('maker', '==', maker).limit(15).get();

    profiles = result.docs.map((user) => ({
      ...user.data(),
      docId: user.id,
    }));
  }

  const gettedProfileIds = profiles.map((user) => user.userId);

  if (profiles.length < 15) {
    let addIds;
    let addProfiles;
    if (following.length > 0) {
      addIds = [...following, userId, ...gettedProfileIds];
      const getQuery = (batch) => collectionPath.where('userId', 'not-in', batch).limit(100);
      addProfiles = await getDocumentByArrays(addIds, getQuery);
    } else {
      addIds = [userId, ...gettedProfileIds];
      const getQuery = (batch) => collectionPath.where('userId', 'not-in', batch).limit(100);
      addProfiles = await getDocumentByArrays(addIds, getQuery);
    }
    addProfiles.slice(0, result || result !== undefined ? 15 - result.docs.length : 0);
    const sumProfiles = [...addProfiles, ...profiles];
    sumProfiles.sort((a, b) => b.dateCreated - a.dateCreated);

    return sumProfiles;
    // eslint-disable-next-line no-else-return
  } else {
    profiles.slice(0, 15);
    return profiles;
  }
}

// ログインしているユーザーのフォローしている人を更新
export async function updateLoggedInUserFollowing(loggedInUserDocId, profileId, isFollowingProfile) {
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

// ログインしているユーザーのフォロワーを更新
export async function updateFollowedUserFollowers(profileDocId, loggedInUserDocId, isFollowingProfile) {
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

// ログインしているユーザーがフォローしている人のポストを取得
export async function getPhotos(userId, following) {
  if (following && following.length > 0) {
    const collectionPath = firebase.firestore().collection('photos');
    const getQuery = (batch) => collectionPath.where('userId', 'in', batch);
    const userFollowedPhotos = await getDocumentByArraysIn(following, getQuery);

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

    return { photosWithUserDetails };
  }
  return [];
}

// ログインしているユーザーがお気に入りしているポストを取得
export async function getPhotosFavorite(userId, likes) {
  let likesPhotos;

  await Promise.all(likes.map((docId) => firebase.firestore().collection('photos').doc(docId).get())).then((docs) => {
    likesPhotos = docs
      .filter((doc) => !!doc.data())
      .map((doc) => ({
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

      const user = await getUserByUserId(photo.userId);

      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return photosWithUserDetails;
}

// すべてのポストを取得
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

// ユーザーIDによってポストを取得
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

// ユーザーをフォローしているかをチェック
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

// フォローとフォローの解除
export async function toggleFollow(isFollowingProfile, activeUserDocId, profileDocId, profileUserId, followingUserId) {
  await updateLoggedInUserFollowing(activeUserDocId, profileUserId, isFollowingProfile);

  await updateFollowedUserFollowers(profileDocId, followingUserId, isFollowingProfile);
}

// フォローしている人のuserドキュメントを取得
export async function getProfileFollowingUsers(following) {
  let users = [];
  if (following.length > 0) {
    const collectionPath = firebase.firestore().collection('users');
    const getQuery = (batch) => collectionPath.where('userId', 'in', batch);
    users = await getDocumentByArraysIn(following, getQuery);
  }

  return users;
}
// フォローされている人のuserドキュメントを取得
export async function getProfileFollowedgUsers(followed) {
  let users = [];

  if (followed.length > 0) {
    const collectionPath = firebase.firestore().collection('users');
    const getQuery = (batch) => collectionPath.where('userId', 'in', batch);
    users = await getDocumentByArraysIn(followed, getQuery);
  }

  return users;
}
