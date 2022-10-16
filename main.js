/* 10.15 Update 

	1. 재접속 시 발생하였던 _playerList null 현상 해결 (그냥 때려박기로 !)
	2. timer 60분 단위로 맵 이동하게 변경
	3. !초기화 삭제 (수동으로 변경)
	4. n일차 참여를 위한 초기화 코드 추가 (타이머 초기화, 포인트 증가, title 변경)
	4-1. 아이디 값을 알기 위하여 !rank 변경 (오전 9시 사용하여 기록할 것)
	4-2. 매일 코드를 조금씩 변경해줘야 함 (랭킹아이디, n일차)
	4-3. 정확한 비교를 위해서는 구글 설문조사 + 접속 기록(ZEP 자체 기능)과 비교할 필요가 있음
	5. str[4] - point 추가. title 변경 (on Update에서) 

*/


let _stateTimer;
// _playerList에는 id/name/time/state 문자열이 들어가 있습니다.
let _playerList;


/* No Error */
const playerIndexOf = (arrStr, playerId) => {
  for (let i = 0; i < arrStr.length; i++) {
    let arrCurId = arrStr[i].split("/")[0];

    if (arrCurId == playerId) {
      return i;
    }
  }

  return -1;
};


/* 관리자 사람이 재접시 오류 */
let pg = App.loadSpritesheet(
  "pg2.png",
  154.1,
  152,
  {
    left: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 좌방향 이동 이미지
    right: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  8
);

App.onInit.Add(function () {
  _stateTimer = 0;
  _playerList = new Array();
});

// player join시 //
// initial join -> player add _playerList //

/* split undefined error -> 이유는 아마.. (관리자만!)재접 시 생김. */
App.onJoinPlayer.Add(function (player) {
  // 환영 인사
  player.showCenterLabel(
    player.name + "님 환영합니다. 공지사항을 읽어주시기 바랍니다."
  );

  player.tag = {
    widget: null,
  };

  playerStorage = player.storage;

  if (playerStorage == null) {
    // playerStorage를 id/name/time/state 로 설정한다. //
    let playerId = player.id;
    let playerName = player.name;
    let playerTime = 1;
    let playerState = "X";
	let playerPoint = 0;

    let temp = [
      playerId.toString(),
      playerName.toString(),
      playerTime.toString(),
      playerState.toString(),
	  playerPoint.toString(),
    ];

    player.storage = temp.join("/");
    _playerList.push(temp.join("/"));
    player.save();
  }
  playerStorage = player.storage; // 재초기화
  let str = playerStorage.split('/');	
  
  if(str[3] !== "X"){
	player.spawnAtLocation('ex',1);
  }	
	
	
	/* 에러 해결을 위한 삭제 - 22.10.15. jsmoon
	
    // 관리자 권한이 있는 사람이 재접할 시에만 에러가 생긴다!!!
    // error message -> _playerList.length == 0
    App.sayToAll("_playerList.length : " + _playerList.length);
    for (let i = 0; i < _playerList.length; i++) {
      App.sayToAll(_playerList[i]);
    }

    // playerStorage 갱신 하기 (초기화 후 접속한 경우)
    let playerIndex = playerIndexOf(_playerList, player.id.toString());
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 0");
    }

    let playerTime = _playerList[playerIndex].split("/")[2];
    let playerState = _playerList[playerIndex].split("/")[3];
    */
	
	/* 삭제
	if (playerState != "X") {
      player.title = playerState;
      player.sendUpdated();
    }
	*/
	
	/*
    let temp = [
      player.id.toString(),
      player.name.toString(),
      playerTime.toString(),
      playerState.toString(),
    ];

    player.storage = temp.join("/");
    player.save();
  }
  */
	/*
  // print all _playerList -> 재접시 _playerList가 null이 되는 문제.
  for (let i = 0; i < _playerList.length; i++) {
    App.sayToAll(`_playerList[${i}] = ${_playerList[i]}`);
  }
  */
});

App.onUpdate.Add(function (dt) {
  let players = App.players;

  for (let i in players) {
    //load player List
    let player = players[i];
    let playerStorage = player.storage;
    let str = playerStorage.split("/");
	
	// 닉네임 변경하였을 때 오류
	if (player.name !== str[1]){
		str[1] = player.name;
	}
	if (player.id !== str[0]){
		str[0] = player.id;
	}
	
	// player Index 확인 후 List 추가
	let playerIndex = playerIndexOf(_playerList, player.id.toString())
	
	// playerIndex가 없을 경우, playerList에다가 추가하여 오류 해결하였음
    if (playerIndex == -1){
		let temp = [str[0], str[1], str[2], str[3], str[4]];
		_playerList.push(temp.join("/"));
		playerIndex = playerIndexOf(_playerList, player.id.toString())
	}
	
    // 주의! 신규 사용자가 아닌 사람은 error 발생! (ex. 나,,)
    // 따라서 앱을 새로 만들어야 한다.
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 1"+playerIndex+"playerList"+_playerList);
    }
		
	
	// n일차 참여 인원들 초기화를 위한 코드 (초기화 진행 시 사용 예정, 사용자 접속했을 때)	
	/*
	if (str[3] == 'X'){ // 1일차일 때 진행 중 사용할 코드
		str[3] = '1'; // 
	}
	*/
	
	
	let n = '0'; // n 초기화
	if(player.getLocationName() === 'ex'){ // player 초기 spawn 지정 str[3]
		str[3] = n;
	}
	
	/*
	let rank1 = 'jsmoon' // rank1 설정 (ID 값)
	let rank2 = 'jsmoon' // rank2 설정 (ID 값)
	let rank3 = 'jsmoon' // rank3 설정 (ID 값)
	
	
	if(str[3] == n){ // n+1일차일 때 (n은 위에서 변경함)
		
		str[4] = Number(str[4]); // 포인트 계산을 위한 자료형 변경
	
		if(player.id.toString() == rank1){  // 랭크 1등은 포인트 5점 추가
			str[4] = str[4] + 5;
		}
		else if (player.id.toString() == rank2){
			str[4] = str[4] + 4;
		}
		else if (player.id.toString() == rank3){
			str[4] = str[4] + 3;
		}
		else{
			str[4] = str[4] + 1;			
		}
		str[2] = "0"; // timer 값 0으로 변경
		n = Number(n)+1;
		n = n.toString();
		str[3] = n; // n+1일차로 변경함 ex. 2일차 점검 시, 기존 state 1일차에서 2일차로 변경
	} 
	player.title = str[4] + 'point';
	*/
	
    // 관리자는 시간 업데이트 X
    if (str[3] == "Manager") {
      str[2] = "0";
      playerStorage = [str[0], str[1], str[2], str[3],str[4]];
      player.storage = playerStorage.join("/");

      player.save();
	  player.sendUpdated()
      _playerList[playerIndex] = player.storage;
      continue;
    }

	
	
	// timer update
    let timer = Number(str[2]);
    _stateTimer += dt;
	
	
    if (_stateTimer >= 1) {
      _stateTimer = 0;
      timer += 1;
    }
	// 10분 마다 다른 맵으로 이동시키기
	let tempLocate = null;
	if(timer % 3600 === 0 && timer !== 0){
		timer += 1;
		str[2] = timer.toString();
		playerStorage = [str[0], str[1], str[2], str[3],str[4]];
		player.storage = playerStorage.join("/");
		player.save();
		player.sendUpdated()
		_playerList[playerIndex] = player.storage.toString();
		player.spawnAtMap("AEVXPv","2496NE");
		continue;
	}
	
    str[2] = timer.toString();
	
	// 설문 참여 안한 인원
	if (str[3] === 'X'){
		str[2] = '0';
	}

    playerStorage = [str[0], str[1], str[2], str[3],str[4]];
    player.storage = playerStorage.join("/");
    player.sendUpdated()
    player.save();
    _playerList[playerIndex] = player.storage.toString();
	
  }
  
});

App.onSay.Add(function (player, text) {
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

  if (text == "!") {
    App.sayToAll(playerStorage);
    App.sayToAll("랭킹 인원 수 : " + _playerList.length);
    for (let i = 0; i < _playerList.length; i++) {
      App.sayToAll(`_playerList[${i}] = ${_playerList[i]}`);
    }
  }
});

/* No Error */
App.addOnKeyDown(81, function (player) {
  let playerWidget = player.tag.widget;

  if (!playerWidget) {
    playerWidget = player.showWidget("1.html", "top", 600, 450);

    let playerListSort = _playerList.sort(function (a, b) {
      return Number(b.split("/")[2]) - Number(a.split("/")[2]);
    });

    let playerIndex = playerIndexOf(playerListSort, player.id.toString());
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 2");
    }

    playerWidget.sendMessage({
      result: playerListSort,
      playerIndex: playerIndex,
      info: player,
    });
  }

  playerWidget.onMessage.Add(function (player, msg) {
    if (msg.type == "close") {
      playerWidget.destroy();
      playerWidget = null;
    }
  });
});



App.onSay.Add(function (player, text) {
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

  // 전체 채팅, 라벨 채팅 둘 다.
  if (text.substr(0, 2) == "!!") {
    let _players = App.players; // player data load

    App.sayToAll(text.substr(2));
    for (let i in _players) {
      let _player = _players[i];
      _player.showCenterLabel(text.substr(2));
    }
  }

  // 펭귄 변신 + 관리자
  if (text == "!#") {
    player.title = "Manager";
    str = playerStorage.split("/");
    str[2] = "0";
    str[3] = "Manager";
    player.storage = str.join("/");
    player.sprite = pg;
    player.save();
    player.sendUpdated();

    let playerIndex = playerIndexOf(_playerList, player.id.toString());
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 3");
    }
    _playerList[playerIndex] = player.storage;
  }

  // 변신 풀기 + 관리자
  if (text == "!@") {
    let temp = [player.id.toString(), player.name, "0", "Manager"];
    playerStorage = temp.join("/");
    player.storage = playerStorage;
    player.title = "Manager";
    player.sprite = null;
    player.save();
    player.sendUpdated();

    let playerIndex = playerIndexOf(_playerList, player.id.toString());
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 4");
    }
    _playerList[playerIndex] = player.storage;
  }

  // 모든 랭크 출력
  if (text == "!rank") {
    let playerListSort = _playerList.sort(function (a, b) {
      return Number(b.split("/")[2]) - Number(a.split("/")[2]);
    });

    for (let i = 0; i < playerListSort.length; i++) {
      let __timer = Number(playerListSort[i].split("/")[2]);

      if (__timer < 60) {
        __timer = __timer + "초";
      } else {
        let m = Math.floor(__timer / 60);
        let s = __timer % 60;
        __timer = m + "분 " + s + "초 ";
        if (m >= 60) {
          let h = Math.floor(m / 60);
          m = m % 60;
          __timer = h + "시간 " + m + "분 " + s + "초 ";
        }
      }

      App.sayToAll(
        i + 1 + "등 " + playerListSort[i].split("/")[1] + " 시간 : " + __timer + '('+playerListSort[i].split("/")[0] +')'
      );
    }
  }
  if (text == "!all"){
	 for (let i = 0; i < _playerList.length; i++){
		 App.sayToAll(_playerList[i]);
	 }
  }

  if (text == "!150") {
    player.moveSpeed = 150;
  }
  if (text == "!100") {
    player.moveSpeed = 100;
  }
  if (text == "!a"){
	  App.sayToAll(playerStorage);
  }
  if (text == "!r" || text == "rrrrrrr"){
	let playerId = player.id;
    let playerName = player.name;
    let playerTime = 0;
    let playerState = "X";
	let playerPoint = 0;
	
	let temp = [
    playerId.toString(),
    playerName.toString(),
    playerTime.toString(),
    playerState.toString(),
	playerPoint.toString(),
    ];

    player.storage = temp.join("/");
	player.save();
  }
  /*
  if (text == "!안내"){
	let tempNotice = '💬  2022. 10. 16일(일) 18:00 ~ 10. 20일(목) 09:00 🎉

					💛😜스터디윗미 이벤트 진행 !!🎲🔥

					🔥🔥우리 같이 공부할까?!🔥🔥

					🕘익일 09시를 기준으로 접속 시간을 확인하여 포인트 지급 !
					* point 기준 
					 - 1등 5point  / 2등 4point  / 3등 3 point  / 그 외 1point

					🕘 10월 20일 09시 기준 🎉
					💖최종 포인트가 가장 많은 인원에게 상품💫✨
					(* 1등 20만원 상당🎁 부터 23등까지 !)

					* 이벤트 알림은 향후 오픈채팅방을 통해 안내드립니다.
					* 참여 인원과 우승 인원의 상품은 10월 내에 지급합니다.

					✌ 홈페이지 접속 :
					❕❕ https://swlounge.oopy.io/


					✅ 문의하기(익명 참여 ok) :
					 https://pf.kakao.com/_xiBKcK


					✅ 이벤트 알림받기(익명 참여 ok) :  참여코드 2021
					https://open.kakao.com/o/g9qCra0c';
	
	let _players = App.players; // player data load

    App.sayToAll(tempNotice);
    for (let i in _players) {
      let _player = _players[i];
      _player.showCenterLabel(tempNotice);
    }
  }
  */
  

  // 시간 0 초기화, 상태 갱신
  /* 초기화는 state 값을 다르게 하여 비교 예정
  // if state == 1 (1일차 접속자)
		timer = 0;
		state = 2; 
	이런식으로 코드를 변경하여 Storage 값을 변경하는 식으로 진행 (수동)
	변경 시간 : 오전 09시 ~ 오후 6시, 시작 전에만 변경하면 됨
	이때, Rank 1~3등, 나머지 인원의 포인트를 지정하면 될 듯함
	
	
  // 
  if (text == "!초기화") {
    let _players = App.players;

    let playerListSort = _playerList.sort(function (a, b) {
      return Number(b.split("/")[2]) - Number(a.split("/")[2]);
    });

    for (let i = 0; i < playerListSort.length; i++) {
      let curPlayer = playerListSort[i];
      let str = curPlayer.split("/");

      switch (i) {
        case 0: {
          str[3] = "<1등 - 5point>";
          break;
        }
        case 1: {
          str[3] = "<2등 - 4point>";
          break;
        }
        case 2: {
          str[3] = "<3등 - 3point>";
          break;
        }
        default: {
          str[3] = "<1point>";
          break;
        }
      }

      // App.players로 갖고오면 접속중이 아닌 사람들은 초기화 못함.
      // 따라서 전역변수 _playerList로 초기화를 해줘야 하는데
      // 그렇게되면 player에 접근 불가능.
      // 따라서 _playerList에 저장해두었다가 나갔다오면 뜨게 해야함
      // 결론 : 접속하고 있는 사람들은 우선 갱신
      // 접속 X사람들은 재접시 갱신 -> 오류 발생!
      if (str[3] !== "X" || str[3] !== "Manager") {
        for (let i = 0; i < _players.length; i++) {
          let _player = _players[i];
          if (str[0] == _player.storage.split("/")[0]) {
            let _playerStorage = _player.storage;
            let _str = _playerStorage.split("/");
            _str[3] = str[3];
            _player.title = _str[3];
            _player.storage = _str.join("/");

            _player.save();
            _player.sendUpdated();
          }
        }
      }

      str[2] = "0";
      let temp = [str[0], str[1], str[2], str[3]];
      // time 초기화, state 갱신된 정보 -> curPlayer
      curPlayer = temp.join("/");

      // 초기화한 값 리스트에 저장.
      playerListSort[i] = new String(curPlayer);
      _playerList[i] = new String(curPlayer);

      // error message -> 정상적으로 동작.
      App.sayToAll(`playerListSort[${i}] = ${curPlayer}`);
      App.sayToAll(`_playerList[${i}] = ${curPlayer}`);
    }
  }*/
});
