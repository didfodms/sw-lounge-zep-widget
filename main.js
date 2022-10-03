let _players = App.players; // App.players : get total players
let _stateTimer = 0;
let _widget = null;

/*

player.storage == 스페이스에서 player 마다 따로 저장할 수 있는 string 값
본 코드에서는 str로 로드하여 str[0]은 state : 관리자, 우승자 등 지정, str[1]은 timer를 관리함

*/

// 모든 플레이어가 이 이벤트를 통해 app에 입장
App.onJoinPlayer.Add(function (player) {
  player.tag = {
    time: null,
    widget: null,
  };

  let playerStorage = player.storage;

  //init firstPlayer
  if (playerStorage == null) {
    playerStorage = ["X", "0"]; // [0] : state, [1] : timer
    player.storage = playerStorage.join("/");
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
    let playerStorage = _player.storage;
    let str = playerStorage.split("/");

    // Timer
    let _timer = Number(str[1]); //change str[1] to _timer(number)
    _stateTimer += dt;

    if (_stateTimer >= 1) {
      _stateTimer = 0;
      _timer = _timer + 1;
    }

    // Timer Check. 1시간 마다 이동. 현재 test 30초
    /*
  if (_timer % 3600 == 0){
		
		_player.spawnAtMap("AEVXPv","2496NE");
	}
  */

    //change _timer to str[1](String)
    str[1] = _timer.toString();

    // Update player.storage & save
    playerStorage = [str[0], str[1]];
    _player.tag.time = playerStorage.join("/");
    _player.storage = playerStorage.join("/");
    _player.save();
  }
});

App.onSay.Add(function (player, text) {
  // Load player.storage, Map Key is str[0]
  let playerStorage = player.storage;
  let str = playerStorage.split("/");

  // check my storage
  if (text == "!") {
    App.sayToAll(playerStorage);
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
