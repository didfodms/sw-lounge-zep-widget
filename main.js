let _stateTimer;
let _playerList;

let pg = App.loadSpritesheet('pg2.png', 154.1, 152, {
    left: [9,10,11,12,13,14,15,16,17], // 좌방향 이동 이미지
    right: [0,1,2,3,4,5,6,7,8],		
},8);


// initial start //
// _playerList 초기화 //
App.onInit.Add(function () {
  _stateTimer = 0;
  _playerList = new Array();
});

// player join시 //
// initial join -> player add _playerList //
App.onJoinPlayer.Add(function (player) {
  player.tag = {
    widget: null,
  };

  playerStorage = player.storage;
  
  // 환영 인사
  player.showCenterLabel(player.name+'님 환영합니다. 공지사항을 읽어주시기 바랍니다.');
  
  if (playerStorage === null) {
    // playerStorage를 id/name/time/state 로 설정한다. //
    let playerId = player.id;
    let playerName = player.name;
    let playerTime = 0;
    let playerState = "X";

    let temp = [
      playerId.toString(),
      playerName.toString(),
      playerTime.toString(),
      playerState.toString(),
    ];

    player.storage = temp.join("/");
    _playerList.push(temp.join("/"));
    player.save();

    // 처음 접속 시 플레이어 리스트, 리스트 길이 출력
    for (let i = 0; i < _playerList.length; i++) {
      App.sayToAll(_playerList[i]);
    }
    App.sayToAll(_playerList.length);
  }
});

App.onUpdate.Add(function (dt) {
  let players = App.players;

  for (let i in players) {
    let player = players[i];
    let playerStorage = player.storage;
    let str = playerStorage.split("/");

    let timer = Number(str[2]);
    _stateTimer += dt;

    if (_stateTimer >= 1) {
      _stateTimer = 0;
      timer += 1;
    }

    str[2] = timer.toString();

    playerStorage = [str[0], str[1], str[2], str[3]];
    player.storage = playerStorage.join("/");

    // playerIndex 찾는데에 오류 <- but. 에러메세지 안뜨는거 보면 playerIndex는 찾아짐
    // 출력 값 : playerIndex = ?? 이거 확인하기. app에 넣어놓음.
    // player.id값으로 찾게 되어있는데 id값이 number가 아님;;
    // playerIndex 성공적으로 찾아짐.
    let playerIndex = playerIndexOf(_playerList, player.id);
    // 주의! 신규 사용자가 아닌 사람은 error 발생! (ex. 나,,)
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 1");
    }
    player.save();
    _playerList[playerIndex] = player.storage.toString();
    // App.sayToAll("playerIndex = " + playerIndex);
  }
});

App.onSay.Add(function (player, text) {
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

  if (text === "!") {
    App.sayToAll(playerStorage);
    App.sayToAll("접속했던 총 플레이어 수 : " + _playerList.length);
  }
});

App.addOnKeyDown(81, function (player) {
  let playerWidget = player.tag.widget;

  if (!playerWidget) {
    playerWidget = player.showWidget("1.html", "top", 600, 450);

    let playerListSort = _playerList.sort(function (a, b) {
      return Number(b.split("/")[2]) - Number(a.split("/")[2]);
    });

    // playerListSort 모두 출력 -> 정상적으로 출력됨.
    for (let i = 0; i < playerListSort.length; i++) {
      App.sayToAll(playerListSort[i]);
    }

    // indexOf 함수 따로 만들기
    let playerIndex = playerIndexOf(playerListSort, player.id);
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 2");
    }
    App.sayToAll("당신의 순위는 현재 : " + playerIndex + "+1위 입니다.");

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

const playerIndexOf = (arr, playerId) => {
  for (let i = 0; i < arr.length; i++) {
    let arrCurId = arr[i].split("/")[0];

    if (arrCurId === playerId) {
      return i;
    }
  }

  return -1;
};

App.onSay.Add(function (player, text) {
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

	// 전체 채팅, 라벨 채팅 둘 다.
	if (text.substr(0,2) =="!!"){
		App.sayToAll(text.substr(2));
		for(let i in _players){
			let _player = _players[i];
			_player.showCenterLabel(text.substr(2));	
		}
	}
	
	// 펭귄 변신
	if(text == '!#') {
		player.title = "Manager";
		player.sprite = pg;
		player.sendUpdated();
	}
	
  if (text === "!@") {
    let temp = ["Manager", "0"];
    playerStorage = temp.join("/");
    player.storage = playerStorage;
    str = playerStorage.split("/");
    player.title = str[0];
    player.save();
    player.sendUpdated();
  }

  if (text === "!rank") {
    let playerListSort = _playerList.sort(function (a, b) {
      return Number(b.storage.split("/")[2] - Number(a.storage.split("/")[2]));
    });

    for (let i = 0; i < playerListSort.length; i++) {
      let __timer = Number(playerListSort[i].storage.split("/")[2]);

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
        i +
          1 +
          "등 " +
          playerListSort[i].storage.split("/")[1] +
          " 시간 : " +
          __timer
      );
    }
  }

  if (text == "!150") {
    player.moveSpeed = 150;
  }
  if (text == "!100") {
    player.moveSpeed = 100;
  }
  /* 수정 안함
  if (text == "!초기화") {
    _players = App.players; // player data load

    // player Rank Load
    let playerResult = _players.sort(function (a, b) {
      return (
        Number(b.tag.time.split("/")[1]) - Number(a.tag.time.split("/")[1])
      );
    });

    // check each player storage
    for (let i in _players) {
      // Load Player Storage
      let _player = _players[i];
      let playerStorage = _player.storage;
      let str = playerStorage.split("/");

      //check each player rank and title with str[0]
      if (playerResult[0].name == _player.name) {
        str[0] = "<1등 - 5point>";
      } else if (playerResult[1].name == _player.name) {
        str[0] = "<2등 - 4point>";
      } else if (playerResult[2].name == _player.name) {
        str[0] = "<3등 - 3point>";
      } else {
        str[0] = "<1point>";
      }

      if (str[0] != null) {
        _player.title = str[0];
      }
      str[1] = "0";
      playerStorage = [str[0], str[1]];
      _player.tag.time = playerStorage.join("/");
      _player.storage = playerStorage.join("/");
      _player.sendUpdated();
      _player.save();
    }
  } */
});
