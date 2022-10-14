let _stateTimer;
let _playerList;

let pg = App.loadSpriteSheet(
  "pg2.png",
  154.1,
  152,
  {
    left: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 좌방향 이동 이미지
    right: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  8
);

App.onInit.Add(() => {
  _stateTimer = 0;
  _playerList = new Array();
});

App.onJoinPlayer.Add((player) => {
  player.showCenterLabel(
    player.name + "님 환영합니다. 공지사항을 읽어주시기 바랍니다."
  );

  player.tag = {
    widget: null,
  };
  playerStorage = player.storage;

  // 처음 접속시
  if (playerStorage === null) {
    let playerId = player.id;
    let playerName = player.name;
    let playerTime = "0";
    let playerState = "X";
    let temp = [playerId.toString(), playerName, playerTime, playerState];

    player.storage = temp.join("/");
    player.save();
    playerStorage = player.storage;
    _playerList.push(playerStorage);
  } else {
    // 재접시 -> 현재 _playerList의 정보를 player.storage에 가지고 와야 함
    let playerIndex = playerIndexOf(_playerList, player.id.toString());
    if (playerIndex < 0) {
      App.sayToAll("playerIndex reference error 0");
    }
    let str = _playerList[playerIndex].split("/");
    let temp = [str[0], str[1], str[2], str[3]];
    let playerStorage = temp.join("/");
    player.storage = playerStorage;
    player.save();
  }
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
