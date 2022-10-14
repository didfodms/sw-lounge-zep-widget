let _stateTimer;
// _playerList에는 id/name/time/state 문자열이 들어가 있습니다.
let _playerList;

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
  } else {
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
    if (playerState !== "X") {
      player.title = playerState;
      player.sendUpdated();
    }

    let temp = [
      player.id.toString(),
      player.name.toString(),
      playerTime.toString(),
      playerState.toString(),
    ];

    player.storage = temp.join("/");
    player.save();
  }

  // print all _playerList -> 재접시 _playerList가 null이 되는 문제.
  for (let i = 0; i < _playerList.length; i++) {
    App.sayToAll(`_playerList[${i}] = ${_playerList[i]}`);
  }
});

App.onUpdate.Add(function (dt) {
  let players = App.players;

  for (let i in players) {
    let player = players[i];
    let playerStorage = player.storage;
    let str = playerStorage.split("/");

    let playerIndex = playerIndexOf(_playerList, player.id.toString());
    // 주의! 신규 사용자가 아닌 사람은 error 발생! (ex. 나,,)
    // 따라서 앱을 새로 만들어야 한다.
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 1");
    }

    // 관리자는 시간 업데이트 X
    if (str[3] === "Manager") {
      str[2] = "0";
      playerStorage = [str[0], str[1], str[2], str[3]];
      player.storage = playerStorage.join("/");

      player.save();
      _playerList[playerIndex] = player.storage;
      continue;
    }

    let timer = Number(str[2]);
    _stateTimer += dt;

    if (_stateTimer >= 1) {
      _stateTimer = 0;
      timer += 1;
    }

    str[2] = timer.toString();

    playerStorage = [str[0], str[1], str[2], str[3]];
    player.storage = playerStorage.join("/");

    player.save();
    _playerList[playerIndex] = player.storage.toString();
  }
});

App.onSay.Add(function (player, text) {
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

  if (text === "!") {
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

/* No Error */
const playerIndexOf = (arrStr, playerId) => {
  for (let i = 0; i < arrStr.length; i++) {
    let arrCurId = arrStr[i].split("/")[0];

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
  if (text === "!@") {
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
  if (text === "!rank") {
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
        i + 1 + "등 " + playerListSort[i].split("/")[1] + " 시간 : " + __timer
      );
    }
  }

  if (text == "!150") {
    player.moveSpeed = 150;
  }
  if (text == "!100") {
    player.moveSpeed = 100;
  }

  // 시간 0 초기화, 상태 갱신
  if (text === "!초기화") {
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
          if (str[3] !== "Manager") {
            str[3] = "<1point>";
          }
          break;
        }
      }

      // App.players로 갖고오면 접속중이 아닌 사람들은 초기화 못함.
      // 따라서 전역변수 _playerList로 초기화를 해줘야 하는데
      // 그렇게되면 player에 접근 불가능.
      // 따라서 _playerList에 저장해두었다가 나갔다오면 뜨게 해야함
      // 결론 : 접속하고 있는 사람들은 우선 갱신
      // 접속 X사람들은 재접시 갱신 -> 오류 발생!
      if (str[3] !== "X") {
        for (let i = 0; i < _players.length; i++) {
          let _player = _players[i];
          if (str[0] === _player.storage.split("/")[0]) {
            let _playerStorage = _player.storage;
            let _str = _playerStorage.split("/");
            _str[3] = str[3];
            _player.title = _str[3];
            let temp = [_str[0], _str[1], _str[2], _str[3]];
            _player.storage = temp.join("/");

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
  }
});
