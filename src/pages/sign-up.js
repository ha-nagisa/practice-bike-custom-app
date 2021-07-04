/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-onchange */

import { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import FirebaseContext from '../context/firebase';
import * as ROUTES from '../constants/routes';
import { doesUsernameExist } from '../services/firebase';

export default function SignUp() {
  const history = useHistory();
  const { firebase } = useContext(FirebaseContext);

  const [username, setUsername] = useState('');
  const [bikeImage, setBikeImage] = useState('');
  const [previewBikeImageSrc, setPreviewBikeImageSrc] = useState('');
  const [maker, setMaker] = useState('');
  const [carModel, setCarModel] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const isInvalid = password === '' || emailAddress === '';

  const onChangeImageHandler = (e) => {
    if (e.target.files[0]) {
      setBikeImage(e.target.files[0]);

      const selectedFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreviewBikeImageSrc(imageUrl);

      e.target.value = '';
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    const usernameExists = await doesUsernameExist(username);
    if (!usernameExists) {
      try {
        const createdUserResult = await firebase.auth().createUserWithEmailAndPassword(emailAddress, password);

        let url = '';
        if (bikeImage) {
          const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          const N = 16;
          const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
            .map((n) => S[n % S.length])
            .join('');
          const fileName = `${randomChar}_${bikeImage.name}`;
          await firebase.storage().ref(`bikes/${fileName}`).put(bikeImage);
          url = await firebase.storage().ref('bikes').child(fileName).getDownloadURL();
        }

        // authentication
        // -> emailAddress & password & username (displayName)
        await createdUserResult.user.updateProfile({
          displayName: username,
          photoURL: url,
        });

        // firebase user collection (create a document)
        await firebase.firestore().collection('users').add({
          userId: createdUserResult.user.uid,
          username: username.toLowerCase(),
          bikeImageUrl: url,
          carModel,
          emailAddress: emailAddress.toLowerCase(),
          following: [],
          followers: [],
          dateCreated: Date.now(),
        });

        history.push(ROUTES.DASHBOARD);
      } catch (error) {
        setBikeImage('');
        setMaker('');
        setCarModel('');
        setEmailAddress('');
        setPassword('');
        setError(error.message);
      }
    } else {
      setUsername('');
      setError('That username is already taken, please try another.');
    }
  };

  useEffect(() => {
    document.title = 'Sign Up - Instagram';
  }, []);

  return (
    <div className="container flex mx-auto max-w-screen-lg items-center h-screen px-3 py-3 sm:py-0 ">
      <div className="hidden sm:flex w-1/2 shadow-lg">
        <img src="/images/loginLogo.png" alt="Bun Bun BIKE" />
      </div>
      <div className="flex flex-col w-full sm:w-1/2 sm:pt-harf sm:relative sm:border-0">
        <div className="flex flex-col items-center sm:w-4/5 bg-white p-4 mb-4 rounded mx-auto sm:mx-0 sm:absolute sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 shadow-lg">
          <div className="mb-5 block sm:hidden">
            <img src="/images/smLoginLogo.png" alt="Bun Bun BIKE" width="300px" />
          </div>
          <h1 className="hidden sm:flex justify-center w-full font-logoFont font-bold mb-5 text-2xl">SIGIN UP</h1>

          {error && <p className="mb-4 text-xs text-red-primary">{error}</p>}

          <form onSubmit={handleSignUp} method="POST">
            <input
              aria-label="Enter your username"
              type="text"
              placeholder="ユーザーネーム"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setUsername(target.value)}
              value={username}
            />
            {bikeImage ? (
              <div className="text-center">
                <img className="inline object-cover w-16 h-16 mr-2 rounded-full" src={previewBikeImageSrc} alt="" />
                <br />
                <div className="inline-block">
                  <label className="text-sm text-logoColor-littleLight cursor-pointer underline mb-2 inline-block">
                    写真を変更する
                    <input type="file" className="hidden" onChange={onChangeImageHandler} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <label className="cursor-pointer mb-2 inline-block">
                  <img
                    className="inline object-cover w-16 h-16 mr-2 rounded-full border-2 border-gray-primary"
                    src="/images/avatars/bikeDefault.png"
                    alt="bike example"
                  />
                  <br />
                  <span className="text-xs">バイクの画像</span>
                  <input type="file" className="hidden" onChange={onChangeImageHandler} />
                </label>
              </div>
            )}
            <select
              className="py-2 px-3 rounded border-2 w-full text-gray-base border-gray-primary mb-4 mt-1 focus:outline-none focus:ring-2 focus:ring-logoColor-light focus:border-transparent"
              id="maker"
              value={maker}
              onChange={(e) => setMaker(e.target.value)}
            >
              <option value="" className="hidden">
                メーカー
              </option>
              <option value="1" selected>
                ホンダ | HONDA
              </option>
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
            <input
              aria-label="Enter your full name"
              type="text"
              placeholder="車種"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setCarModel(target.value)}
              value={carModel}
            />
            <input
              aria-label="Enter your email address"
              type="text"
              placeholder="メールアドレス"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setEmailAddress(target.value)}
              value={emailAddress}
            />
            <input
              aria-label="Enter your password"
              type="password"
              placeholder="パスワード"
              className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border-2 border-gray-primary focus:outline-none focus:ring-2 focus:ring-logoColor-light rounded mb-4 focus:border-transparent"
              onChange={({ target }) => setPassword(target.value)}
              value={password}
            />
            <button
              disabled={isInvalid}
              type="submit"
              className={`bg-logoColor-base text-white w-full rounded h-10 font-bold mb-2
            ${isInvalid && 'opacity-50'}`}
            >
              Sign Up
            </button>
          </form>
          <p className="text-sm">
            Have an account?{` `}
            <Link to={ROUTES.LOGIN} className="font-bold text-logoColor-base">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
