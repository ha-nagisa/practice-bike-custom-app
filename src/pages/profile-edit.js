/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable no-nested-ternary */

import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

import FirebaseContext from '../context/firebase';
import Header from '../components/header';
import LoggedInUserContext from '../context/logged-in-user';
import * as ROUTES from '../constants/routes';
import ResetPasswordModal from '../components/profile-edit/resetPasswordModal';
import backfaceFixed from '../utils/backfaceFixed';
import DeleteAccountModal from '../components/profile-edit/DeleteAccountModal';
import { doesUsernameExist } from '../services/firebase';
import DEFAULT_IMAGE_PATH from '../constants/paths';

export default function ProfileEdit() {
  const location = useLocation();

  const history = useHistory();
  const { firebase } = useContext(FirebaseContext);
  const { user: activeUser, setActiveUser } = useContext(LoggedInUserContext);

  const [username, setUsername] = useState('');
  const [bikeImage, setBikeImage] = useState('');
  const [previewBikeImageSrc, setPreviewBikeImageSrc] = useState('');
  const [maker, setMaker] = useState('');
  const [carModel, setCarModel] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  useEffect(() => {
    setUsername(activeUser?.username);
    setBikeImage(activeUser?.bikeImageUrl);
    setPreviewBikeImageSrc(activeUser?.bikeImageUrl);
    setMaker(activeUser?.maker);
    setCarModel(activeUser?.carModel);
    setEmailAddress(activeUser?.emailAddress);
  }, [activeUser]);

  const isInvalid = emailAddress === '' || username === '' || bikeImage === '' || maker === '' || carModel === '' || isActioning;

  const onChangeImageHandler = (e) => {
    if (e.target.files[0]) {
      setBikeImage(e.target.files[0]);

      const selectedFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewBikeImageSrc(imageUrl);

      e.target.value = '';
    }
  };

  const openResetModal = () => {
    setIsResetModalOpen(true);
    backfaceFixed(true);
  };

  const openDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(true);
    backfaceFixed(true);
  };

  const successResetToast = () =>
    toast.success(' パスワードのリセットに関する案内メールが送信されました。', {
      style: {
        border: '1px solid #ffffff',
        padding: '16px',
        color: 'rgb(55, 65, 81)',
        background: '#ffffff',
      },
      iconTheme: {
        primary: '#ff9800',
        secondary: '#ffffff',
      },
    });

  const successUpdateToast = () =>
    toast.success('正常にプロフィール情報が更新されました。', {
      style: {
        border: '1px solid #ffffff',
        padding: '16px',
        color: 'rgb(55, 65, 81)',
        background: '#ffffff',
      },
      iconTheme: {
        primary: '#ff9800',
        secondary: '#ffffff',
      },
    });

  const handleEditProfile = async (event) => {
    event.preventDefault();
    setIsActioning(true);
    const isLoggedInUser = location.pathname === `/p/${activeUser?.username}/edit`;
    if (isLoggedInUser) {
      const usernameExists = await doesUsernameExist(username);
      try {
        if (usernameExists) {
          throw new Error('既に入力したユーザーネームを持ったユーザーが存在します。ユーザーネームを変更してください。');
        }
        await firebase
          .auth()
          .currentUser.updateEmail(emailAddress)
          .catch((error) => {
            throw new Error(error.message);
          });

        if (!errorText) {
          let url = '';
          if (bikeImage && activeUser?.bikeImageUrl !== bikeImage) {
            const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const N = 16;
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
              .map((n) => S[n % S.length])
              .join('');
            const fileName = `${randomChar}_${bikeImage.name}`;
            await firebase.storage().ref(`bikes/${fileName}`).put(bikeImage);
            url = await firebase.storage().ref('bikes').child(fileName).getDownloadURL();

            await firebase
              .auth()
              .currentUser.updateProfile({
                displayName: username.toLowerCase(),
                photoURL: url,
              })
              .catch((error) => {
                throw new Error(error.message);
              });

            await firebase
              .firestore()
              .collection('users')
              .doc(activeUser?.docId)
              .update({
                username: username.toLowerCase(),
                bikeImageUrl: url,
                carModel,
                maker,
                emailAddress: emailAddress.toLowerCase(),
              })
              .catch((error) => {
                throw new Error(error.message);
              });

            await firebase
              .firestore()
              .collection('photos')
              .where('comments', '!=', [])
              .get()
              .then(async (res) => {
                console.log('おっと');
                console.log(res.docs.map((doc) => ({ ...doc.data() })));
                if (res.docs.length > 0) {
                  await Promise.all(
                    res.docs.map((doc) => {
                      console.log(doc.id);
                      if (doc.data().comments.some((comment) => comment.displayName === activeUser.username)) {
                        console.log(doc.id);
                        firebase
                          .firestore()
                          .collection('photos')
                          .doc(doc.id)
                          .update({
                            comments: doc.data().comments.map((e) => {
                              if (e.displayName === activeUser.username) {
                                return {
                                  comment: e.comment,
                                  displayName: username.toLowerCase(),
                                };
                              }
                              return e;
                            }),
                          });
                      }
                      return doc;
                    })
                  )
                    .then(() => {
                      console.log('コメントのユーザーネーム更新成功');
                    })
                    .catch((error) => {
                      throw new Error(error.message);
                    });
                }
              });

            setActiveUser((prev) => ({
              ...prev,
              bikeImageUrl: url,
              carModel,
              emailAddress,
              maker,
              username,
            }));

            successUpdateToast();
          } else {
            await firebase
              .auth()
              .currentUser.updateProfile({
                displayName: username.toLowerCase(),
              })
              .catch((error) => {
                throw new Error(error.message);
              });

            await firebase
              .firestore()
              .collection('users')
              .doc(activeUser?.docId)
              .update({
                username: username.toLowerCase(),
                carModel,
                maker,
                emailAddress: emailAddress.toLowerCase(),
              })
              .catch((error) => {
                throw new Error(error.message);
              });

            await firebase
              .firestore()
              .collection('photos')
              .where('comments', '!=', [])
              .get()
              .then(async (res) => {
                console.log('おっと');
                console.log(res.docs.map((doc) => ({ ...doc.data() })));
                if (res.docs.length > 0) {
                  await Promise.all(
                    res.docs.map((doc) => {
                      console.log(doc.id);
                      if (doc.data().comments.some((comment) => comment.displayName === activeUser.username)) {
                        console.log(doc.id);
                        firebase
                          .firestore()
                          .collection('photos')
                          .doc(doc.id)
                          .update({
                            comments: doc.data().comments.map((e) => {
                              if (e.displayName === activeUser.username) {
                                return {
                                  comment: e.comment,
                                  displayName: username.toLowerCase(),
                                };
                              }
                              return e;
                            }),
                          });
                      }
                      return doc;
                    })
                  )
                    .then(() => {
                      console.log('コメントのユーザーネーム更新成功');
                    })
                    .catch((error) => {
                      throw new Error(error.message);
                    });
                }
              });

            setActiveUser((prev) => ({
              ...prev,
              carModel,
              emailAddress,
              maker,
              username,
            }));
            successUpdateToast();
          }
        }
      } catch (error) {
        setErrorText(error.message);
      }
    } else {
      history.push(ROUTES.LOGIN);
    }
    setIsActioning(false);
  };

  return (
    <div className="bg-gray-background relative pb-10">
      <Header />
      <section className="py-10 bg-gray-100  bg-opacity-50  h-auto">
        <form onSubmit={handleEditProfile} className="mx-auto container max-w-2xl md:w-3/4 shadow-md w-11/12">
          <div className="bg-white p-4 border-t-2 bg-opacity-5 border-logoColor-base rounded-t">
            <h1 className="text-gray-600 text-center text-lg">アカウント設定</h1>
          </div>
          <div className="bg-white space-y-6 mt">
            <div className="md:inline-flex space-y-4 md:space-y-0 w-full p-4 text-gray-500 items-center pt-6">
              <h2 className="md:w-1/3 max-w-sm mx-auto">アカウント</h2>
              <div className="md:w-2/3 max-w-sm mx-auto space-y-5">
                <div>
                  <label htmlFor="username" className="text-sm text-gray-400">
                    ユーザーネーム
                  </label>
                  <div className="w-full inline-flex border">
                    <div className="w-1/12 pt-2 bg-gray-100">
                      <svg fill="none" className="w-6 text-gray-400 mx-auto" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="w-11/12 border border-gray-400 focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base focus:text-gray-600 p-2 text-black-base"
                      placeholder="田中太郎"
                      onChange={({ target }) => setUsername(target.value.trim())}
                      value={username}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-gray-400">
                    メールアドレス
                  </label>
                  <div className="w-full inline-flex border">
                    <div className="pt-2 w-1/12 bg-gray-100 bg-opacity-50">
                      <svg fill="none" className="w-6 text-gray-400 mx-auto" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="w-11/12  border border-gray-400  focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base focus:text-gray-600 p-2 text-black-base"
                      placeholder="email@example.com"
                      onChange={({ target }) => setEmailAddress(target.value)}
                      value={emailAddress}
                    />
                  </div>
                </div>
                <div>
                  <button type="button" onClick={openResetModal} className="text-sm text-logoColor-base focus:outline-none hover:opacity-70">
                    パスワードの変更はこちらから
                  </button>
                </div>
              </div>
            </div>
            <hr />
            <div className="md:inline-flex  space-y-4 md:space-y-0  w-full p-4 text-gray-500 items-center">
              <h2 className="md:w-1/3 mx-auto max-w-sm">バイク情報</h2>
              <div className="md:w-2/3 mx-auto max-w-sm space-y-5">
                <div>
                  {bikeImage ? (
                    <div className="text-center">
                      <img className="inline object-cover w-24 h-24 mr-2 rounded-full" src={previewBikeImageSrc} alt="" />
                      <br />
                      <div className="inline-block">
                        <label className="text-sm text-logoColor-littleLight cursor-pointer underline mb-2 inline-block hover:opacity-70">
                          写真を変更する
                          <input type="file" className="hidden" onChange={onChangeImageHandler} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <label className="cursor-pointer mb-2 inline-block hover:opacity-70">
                        <img
                          className="inline object-cover w-20 h-20 mr-2 rounded-full border-2 border-gray-primary"
                          src={DEFAULT_IMAGE_PATH}
                          alt="bike example"
                        />
                        <br />
                        <span className="text-xs">バイクの画像</span>
                        <input type="file" className="hidden" onChange={onChangeImageHandler} />
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="maker" className="text-sm text-gray-400">
                    メーカー
                  </label>
                  <div className="w-full inline-flex border">
                    <select
                      className="w-full border border-gray-400  focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base focus:text-gray-600 p-2 text-black-base"
                      id="maker"
                      value={maker}
                      onChange={(e) => setMaker(e.target.value)}
                    >
                      <option value="" className="hidden">
                        選択する
                      </option>
                      <option value="HONDA">ホンダ | HONDA</option>
                      <option value="YAMAHA">ヤマハ | YAMAHA</option>
                      <option value="SUZUKI">スズキ | SUZUKI</option>
                      <option value="KAWASAKI">カワサキ | KAWASAKI</option>
                      <option value="Harley-Davidson">ハーレーダビッドソン | Harley-Davidson</option>
                      <option value="BMW">ビーエムダブリュー | BMW</option>
                      <option value="DUCATI">ドゥカティ | DUCATI</option>
                      <option value="TRIUMPH">トライアンフ | TRIUMPH</option>
                      <option value="KTM">ケーティーエム | KTM</option>
                      <option value="MV AGUSTA">MVアグスタ | MV AGUSTA</option>
                      <option value="MOTO GUZZI">モトグッツィ | MOTO GUZZI</option>
                      <option value="aprilia">アプリリア | aprilia</option>
                      <option value="Husqvarna">ハスクバーナ | Husqvarna</option>
                      <option value="PIAGGIO">ピアジオ | PIAGGIO</option>
                      <option value="Vespa">ベスパ | Vespa</option>
                      <option value="Indian">インディアン | Indian</option>
                      <option value="Victory">ヴィクトリー | Victory</option>
                      <option value="KYMCO">キムコ | KYMCO</option>
                      <option value="SNAKE MOTORS">スネークモータース | SNAKE MOTORS</option>
                      <option value="ZERO ENGINEERING">ゼロエンジニアリング | ZERO ENGINEERING</option>
                      <option value="Fuki Planning">フキプランニング | Fuki Planning</option>
                      <option value="MEGURO">メグロ | MEGURO</option>
                      <option value="Buell">ビューエル | Buell</option>
                      <option value="Boss Hoss">ボスホス | Boss Hoss</option>
                      <option value="CCW">クリーブランド | CCW</option>
                      <option value="Titan">タイタン | Titan</option>
                      <option value="Big Bear Choppers">ビッグベアチョッパーズ | Big Bear Choppers</option>
                      <option value="Saxon">サクソン | Saxon</option>
                      <option value="EBR">イービーアール | EBR</option>
                      <option value="BRP">ビーアールピー | BRP</option>
                      <option value="Italjet Moto">イタルジェット | Italjet Moto</option>
                      <option value="CAGIVA">カジバ | CAGIVA</option>
                      <option value="bimota">ビモータ | bimota</option>
                      <option value="beta">ベータ | beta</option>
                      <option value="MAGNI">マーニ | MAGNI</option>
                      <option value="malaguti">マラグーティ | malaguti</option>
                      <option value="LAVERDA">ラベルダ | LAVERDA</option>
                      <option value="Benelli">ベネリ | Benelli</option>
                      <option value="GILERA">ジレラ | GILERA</option>
                      <option value="FB-Mondial">FBモンディアル | FB-Mondial </option>
                      <option value="SWM">エスダブリューエム | SWM</option>
                      <option value="ATALA">アタラ | ATALA</option>
                      <option value="VOR">ベルティマーティ | VOR</option>
                      <option value="Di Blasi">ディブラッシ | Di Blasi</option>
                      <option value="FANTIC">ファンティック | FANTIC</option>
                      <option value="LAMBRETTA">ランブレッタ | LAMBRETTA</option>
                      <option value="Moto Morini">モトモリーニ | Moto Morini</option>
                      <option value="ADIVA">アディバ | ADIVA</option>
                      <option value="tm">tm</option>
                      <option value="Ghezzi &amp; Brian">ゲッツィ＆ブリアン | Ghezzi &amp; Brian</option>
                      <option value="VYRUS">ヴァイラス | VYRUS</option>
                      <option value="URAL">ウラル | URAL</option>
                      <option value="AJP">エージェーピー | AJP</option>
                      <option value="GAS GAS">ガスガス | GAS GAS</option>
                      <option value="montesa">モンテッサ | montesa</option>
                      <option value="DERBI">デルビ | DERBI</option>
                      <option value="BULTACO">ブルタコ | BULTACO</option>
                      <option value="RIEJU">リエフ | RIEJU</option>
                      <option value="Sherco">シェルコ | Sherco</option>
                      <option value="Krauser">クラウザー | Krauser</option>
                      <option value="SACHS">ザックス | SACHS</option>
                      <option value="MuZ">エムゼット | MuZ</option>
                      <option value="NSU">エヌエスウー | NSU</option>
                      <option value="BSA">ビーエスエー | BSA</option>
                      <option value="Norton">ノートン | Norton</option>
                      <option value="Vincent">ヴィンセント | Vincent</option>
                      <option value="Megelli">メガリ | Megelli</option>
                      <option value="Matchless">マチレス | Matchless</option>
                      <option value="Metisse">メティス | Metisse</option>
                      <option value="TOMOS">トモス | TOMOS</option>
                      <option value="Nico Bakker">ニコバッカー | Nico Bakker</option>
                      <option value="SOLEX">ソレックス | SOLEX</option>
                      <option value="Peugeot">プジョー | Peugeot</option>
                      <option value="Scorpa">スコルパ | Scorpa</option>
                      <option value="MBK">エムビーケー | MBK</option>
                      <option value="MOTOBECANE">モトベカン | MOTOBECANE</option>
                      <option value="Avinton">アヴィントン | Avinton</option>
                      <option value="GG">グルッターガット | GG</option>
                      <option value="HUSABERG">フサベル | HUSABERG</option>
                      <option value="Bajaj">パジャジ | Bajaj</option>
                      <option value="Royal Enfield">ロイヤルエンフィールド | Royal Enfield</option>
                      <option value="LML">エルエムエル | LML</option>
                      <option value="TVS">ティーブイエス | TVS</option>
                      <option value="XINGFU">幸福 | XINGFU</option>
                      <option value="QINGQI">クインキ | QINGQI</option>
                      <option value="PGO">ピージーオー | PGO</option>
                      <option value="CPI">シーピーアイ | CPI</option>
                      <option value="SYM">エス・ワイ・エム | SYM</option>
                      <option value="TGB">TGB</option>
                      <option value="DAELIM">デイリン | DAELIM</option>
                      <option value="HYOSUNG">ヒョースン | HYOSUNG</option>
                      <option value="GPX">ジーピーエックス | GPX</option>
                      <option value="DAIHATSU">ダイハツ | DAIHATSU</option>
                      <option value="YOSHIMURA">ヨシムラ | YOSHIMURA</option>
                      <option value="RODEO MOTORCYCLE">ロデオ | RODEO MOTORCYCLE</option>
                      <option value="YAMAGUCHI">山口 | YAMAGUCHI</option>
                      <option value="SHIN MITSUBISHI">新三菱重工 | SHIN MITSUBISHI</option>
                      <option value=" FUJI JUKOGYOU">富士重工業 | FUJI JUKOGYOU</option>
                      <option value="RIKUOH">陸王 | RIKUOH</option>
                      <option value="TOHATSU">トーハツ | TOHATSU</option>
                      <option value="MIYATA">ミヤタ | MIYATA</option>
                      <option value="BRIDGESTONE">ブリヂストン | BRIDGESTONE</option>
                      <option value="MORIWAKI">モリワキ | MORIWAKI</option>
                      <option value="TERA MOTORS">テラモーターズ | TERA MOTORS</option>
                      <option value="PROZZA">プロッツァ | PROZZA</option>
                      <option value="OVER CREATIVE">オーバークリエイティブ | OVER CREATIVE</option>
                      <option value="CK FACTORY">CKファクトリー | CK FACTORY</option>
                      <option value="SUN MOTORCYCLES">サンモーターサイクルズ | SUN MOTORCYCLES</option>
                      <option value="HIRANO">平野製作所 | HIRANO</option>
                      <option value="Marusho">丸正自動車 | Marusho</option>
                      <option value="SHIN MEIWA">新明和工業 | SHIN MEIWA</option>
                      <option value="CHUO JIDOUSYA">中央自動車工業 | CHUO JIDOUSYA</option>
                      <option value="HODAKA">ホダカ | HODAKA</option>
                      <option value="WhiteHouse">ホワイトハウス | WhiteHouse</option>
                      <option value="Easy Riders">イージーライダース | Easy Riders</option>
                      <option value="ITO IMC">イトウ機関工業 | ITO IMC</option>
                      <option value="JPMOTO">ジェーピーモト | JPMOTO</option>
                      <option value="KANNON">カノン | KANNON</option>
                      <option value="Big Dog">ビッグドッグ | Big Dog</option>
                      <option value="Bourget’s Bike Works">ブールジェ | Bourget’s Bike Works</option>
                      <option value="Lehman Trikes">リーマントライク | Lehman Trikes</option>
                      <option value="ROKON">ローコン | ROKON</option>
                      <option value="AMAZONES">アマゾネス | AMAZONES</option>
                      <option value="Ariel">アリエル | Ariel</option>
                      <option value="Velocette">ヴェロセット | Velocette</option>
                      <option value="AJS">エージェーエス | AJS</option>
                      <option value="MUTT">マット | MUTT</option>
                      <option value="Kreidler">クライドラー | Kreidler</option>
                      <option value="ZUNDAPP">ツェンダップ | ZUNDAPP</option>
                      <option value="REWACO">ルバコ | REWACO</option>
                      <option value="SideBike">サイドバイク | SideBike</option>
                      <option value="REUNALT">ルノー | REUNALT</option>
                      <option value="SALUTE">サルーテ | SALUTE</option>
                      <option value="SHIFTY">シフティー | SHIFTY</option>
                      <option value="SEGALE">セガーレ | SEGALE</option>
                      <option value="CIMATTI">チマッティ | CIMATTI</option>
                      <option value="MOTO MARTIN">モトマーチン | MOTO MARTIN</option>
                      <option value="CZ">シーゼット | CZ</option>
                      <option value="JAWA">ヤワ | JAWA</option>
                      <option value="TIGER">タイガー | TIGER</option>
                      <option value="DK CITY">DKシティ | DK CITY</option>
                      <option value="ADLY">アドリー | ADLY</option>
                      <option value="COSMOS">コスモス | COSMOS</option>
                      <option value="PRIDE">プライド | PRIDE</option>
                      <option value="JMStar">Jmstar | JMStar </option>
                      <option value="KINROAD">KINROAD</option>
                      <option value="SONGI">SONGI</option>
                      <option value="ARDEE">アーディー | ARDEE</option>
                      <option value="RDS">アールティーエス | RDS</option>
                      <option value="HSRC">エイチエスアールシー | HSRC</option>
                      <option value="FS">エフエス | FS</option>
                      <option value="FYM">エフワイエム | FYM</option>
                      <option value="KEEN MOTORBIKES">キーンモーターバイク | KEEN MOTORBIKES</option>
                      <option value="Kinetic">キネティック | Kinetic</option>
                      <option value="QM">キューエム | QM</option>
                      <option value="SUNDIRO">サンディーロ | SUNDIRO</option>
                      <option value="CBC">シービーシー | CBC</option>
                      <option value="GEELY">ジーリー | GEELY</option>
                      <option value="JAXIN">ジャキン | JAXIN</option>
                      <option value="JAKOMOTOR">ジャコモーター | JAKOMOTOR</option>
                      <option value="XINGYUE">シンユウ | XINGYUE</option>
                      <option value="SKYTEAM">スカイチーム | SKYTEAM</option>
                      <option value="DAYANG">ダヤン | DAYANG</option>
                      <option value="Nanfang">ナンファン | Nanfang</option>
                      <option value="BSE">ビーエスイー | BSE</option>
                      <option value="FUTONG">フートン | FUTONG</option>
                      <option value="PHOENIX">フェニックス | PHOENIX</option>
                      <option value="BLUE-ENERGY">ブルーエナジー | BLUE-ENERGY</option>
                      <option value="HONLING">ホーリン | HONLING</option>
                      <option value="MECA TECHNO">メカテクノ | MECA TECHNO</option>
                      <option value="Yadea">ヤディア | Yadea</option>
                      <option value="LONCIN">ロンシン | LONCIN</option>
                      <option value="LON-V">ロンブイ | LON-V</option>
                      <option value="KINJO">金城 | KINJO</option>
                      <option value="KARMIT">カーミット | KARMIT</option>
                      <option value="PAJANG">パジャイ | PAJANG</option>
                      <option value="ARMSTRONG">アームストロング | ARMSTRONG</option>
                      <option value="EXCELSIOR">エクセルシャー | EXCELSIOR</option>
                      <option value="KONDY">コンディー | KONDY</option>
                      <option value="XEAM">ジーム | XEAM</option>
                      <option value="LEONART">レオンアート | LEONART</option>
                      <option value="BAYES">ベイズ | BAYES</option>
                      <option value="ASIAWING">アジアウイング | ASIAWING</option>
                      <option value="MINIROAD">ミニロード | MINIROAD</option>
                      <option value="ITALMOTO">イタルモト | ITALMOTO</option>
                      <option value="ZONTES">ゾンテス | ZONTES</option>
                      <option value="BLAZE">ブレイズ | BLAZE</option>
                      <option value="aidea">アイディア | aidea</option>
                      <option value="Bullit">ブリット | Bullit</option>
                      <option value="ZERO MOTORCYCLES">ゼロモーターサイクルズ | ZERO MOTORCYCLES</option>
                      <option value="SUPER SOCO">スーパーソコ | SUPER SOCO</option>
                      <option value="BRIXTON MOTORCYCLES">ブリクストンモーターサイクルズ | BRIXTON MOTORCYCLES</option>
                      <option value="PHOENIX">PHOENIX</option>
                      <option value="TROMOX">トロモックス | TROMOX</option>
                      <option value="OTHER JAPANESE">その他の国産車 | OTHER JAPANESE</option>
                      <option value="OTHER FOREIGN">その他の外国車 | OTHER FOREIGN</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="carModel" className="text-sm text-gray-400">
                    車種
                  </label>
                  <div className="w-full inline-flex border">
                    <input
                      id="carModel"
                      type="text"
                      name="carModel"
                      className="w-full  border border-gray-400  focus:outline-logoColor focus:ring-logoColor-base focus:border-logoColor-base focus:text-gray-600 p-2 text-black-base"
                      placeholder="例) GB350"
                      onChange={({ target }) => setCarModel(target.value)}
                      value={carModel}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    className={`text-white text-center w-auto mx-auto max-w-sm rounded-md bg-logoColor-base py-2 px-4 inline-flex items-center focus:outline-none mt-3 ${
                      isInvalid ? 'opacity-50' : 'hover:opacity-70'
                    }`}
                    disabled={isInvalid}
                  >
                    {isActioning ? (
                      '更新中...'
                    ) : (
                      <>
                        {' '}
                        <svg fill="none" className="w-4 text-white mr-2" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        更新
                      </>
                    )}
                  </button>
                  {errorText ? (
                    errorText.includes('Log in again before retrying this request.') ? (
                      <p className="p-4 text-xs text-red-primary text-left">
                        ログインから時間が経過しています。
                        <button
                          type="button"
                          className="text-logoColor-base focus:outline-none underline"
                          onClick={() => {
                            firebase.auth().signOut();
                            history.push(ROUTES.LOGIN);
                          }}
                        >
                          こちら
                        </button>
                        から再度ログインをお願いいたします。
                      </p>
                    ) : (
                      <p className="p-4 text-xs text-red-primary text-right">{errorText}</p>
                    )
                  ) : null}
                </div>
              </div>
            </div>

            <hr />

            <div className="w-full p-4 text-right text-white ">
              <button
                type="button"
                onClick={openDeleteAccountModal}
                className="inline-flex items-center focus:outline-none mr-4 bg-red-600 px-3 py-2 rounded-md hover:opacity-70"
              >
                <svg fill="none" className="w-4 mr-2" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                アカウントの削除
              </button>
            </div>
          </div>
        </form>
      </section>
      {isResetModalOpen ? (
        <ResetPasswordModal
          setIsResetModalOpen={setIsResetModalOpen}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          successResetToast={successResetToast}
        />
      ) : null}
      {isDeleteAccountModalOpen ? <DeleteAccountModal setIsDeleteAccountModalOpen={setIsDeleteAccountModalOpen} /> : null}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 8000,
          // Default options for specific types
          success: {
            duration: 5000,
          },
        }}
      />
    </div>
  );
}
