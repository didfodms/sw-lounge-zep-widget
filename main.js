let _players = App.players; // App.players : get total players
let _stateTimer = 0;
let _widget = null;

// 모든 플레이어가 이 이벤트를 통해 app에 입장
App.onJoinPlayer.Add(function (player) {
  player.tag = {
    time: null,
    widget: null,
  };

  let playerTime = player.tag.time;

  //init firstPlayer
  if (playerTime == null) {
    playerTime = ["X", "0"]; // [0] : state, [1] : timer
    player.tag.time = playerTime.join("/");
    player.save();
  }
});

// 매 20ms(0.02초) 마다 실행
App.onUpdate.Add(function (dt) {
  _players = App.players; // player data load

  // check each player storage
  for (let i in _players) {
    // Load Player Storage
    let _player = _players[i];
    let playerTime = _player.tag.time;
    let str = playerTime.split("/");

    // Timer
    let _timer = Number(str[1]); //change str[1] to _timer(number)
    _stateTimer += dt;

    if (_stateTimer >= 1) {
      _stateTimer = 0;
      _timer = _timer + 1;
    }
    str[1] = _timer.toString(); //change _timer to str[1](String)

    // Update player.storage & save
    playerStorage = [str[0], str[1]];
    _player.tag.time = playerStorage.join("/");
    _player.save();
  }
});

App.onSay.Add(function (player, text) {
  // Load player.storage, Map Key is str[0]
  let playerTime = player.tag.time;
  let str = playerTime.split("/");
  // check my storage
  if (text == "!") {
    App.sayToAll(playerTime);
  }
});

// show the point when press q key
App.addOnKeyDown(81, function (player) {
  let playerWidget = player.tag.widget;

  if (!playerWidget) {
    playerWidget = player.showWidget("1.html", "top", 600, 450);

    // _players 정렬
    let playerResult = _players.sort(function (a, b) {
      return (
        Number(b.tag.time.split("/")[1]) - Number(a.tag.time.split("/")[1])
      );
    });

    let myRankIndex = playerResult.indexOf(player);

    // 코드 수정 - sendMessage 보내기
    playerWidget.sendMessage({
      result: playerResult,
      myRankIndex: myRankIndex,
      info: player,
    });
  }

  playerWidget.onMessage.Add(function (player, msg) {
    // 위젯에서 App으로 'type: close'라는 메시지를 보내면 위젯을 파괴함
    if (msg.type == "close") {
      // player.showCenterLabel("위젯이 닫혔습니다.");
      playerWidget.destroy();
      playerWidget = null;
    }
  });
});

// 접속 종료하였을 때 widget 삭제
App.onDestroy.Add(function () {
  _start = false;

  if (_widget) {
    _widget.destroy();
    _widget = null;
  }
});
