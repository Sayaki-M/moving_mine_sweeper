// phina.js をグローバル領域に展開
phina.globalize();

const COLORS = {
  bg: "#dfe0d8",
  frame: "#43464d",
  close: "gray",
  open: "white",
  next: "yellow",
  0: "#9aadbe",
  1: "#934e61",
  2: "#4d639f",
  3: "#1d695f",
  4: "#844f30",
};

// MainScene クラスを定義
phina.define("MainScene", {
  superClass: "DisplayScene",
  init: function (option) {
    option = (option || {}).$safe({ tilenum: 9, bombnum: 10 });
    this.superInit(option);
    // 背景色を指定
    this.tilenum = option.tilenum;
    this.bombnum = option.bombnum;
    this.tilewidth = 504 / this.tilenum;
    option.tilewidth = this.tilewidth;
    this.backgroundColor = COLORS.bg;
    this.isongame = false;
    this.isdigmode = true;
    this.time = 0;
    this.timelabel = Label({ text: "⌛000", fontSize: 40 })
      .addChildTo(this)
      .setPosition(500, 120);
    let label = Label({ text: "💣×" + this.bombnum, fontSize: 40 })
      .addChildTo(this)
      .setPosition(320, 120);
    let self = this;
    this.tileGroup = Tiles(option)
      .addChildTo(this)
      .setPosition(
        this.gridX.center() - ((this.tilewidth + 3) * (this.tilenum - 1)) / 2,
        this.gridY.center() - ((this.tilewidth + 3) * (this.tilenum - 1)) / 2
      );
    let configbutton = ButtonDesign({ text: "⚙設定" })
      .addChildTo(this)
      .setPosition(140, 120);
    configbutton.onpointend = () => {
      self.exit("setting", option);
    };
    this.digbutton = Button({
      fill: "gray",
      fontColor: "black",
      text: "⛏",
      fontSize: 40,
      width: 200,
      height: 60,
    })
      .addChildTo(this)
      .setPosition(this.gridX.center(), 880);
    this.digbutton.onpointend = () => {
      self.changedigmode();
    };
    let retrybutton = ButtonDesign({ text: "retry", width: 120, height: 60 })
      .addChildTo(this)
      .setPosition(540, 880);
    retrybutton.onpointend = () =>
      this.exit({ tilenum: this.tilenum, bombnum: this.bombnum });
    this.howtobutton = ButtonDesign({ text: "遊び方", width: 120, height: 60 })
      .addChildTo(this)
      .setPosition(100, 880);
    this.howtobutton.onpointend = () => this.app.pushScene(HowToPlayScene());
  },
  update: function (app) {
    if (this.isongame) {
      this.time += app.deltaTime;
      this.timelabel.text =
        "⌛" +
        (
          Array(3).join("0") + Math.min(Math.floor(this.time / 1000), 999)
        ).slice(-3);
    }
  },
  start: function () {
    this.isongame = true;
  },
  gameover: function (props) {
    this.isongame = false;
    this.digbutton.hide();
    this.digbutton.setInteractive(false);
    this.howtobutton.hide();
    this.howtobutton.setInteractive(false);
    this.opentile = props.opentile;
    this.app.pushScene(GameoverPopup());
    this.historybutton = ChangeLRNumButton({
      num: this.opentile,
      maxnum: this.opentile,
      minnum: 0,
    })
      .addChildTo(this)
      .setPosition(320, 880);
    this.historybutton.rightbutton.onpointend = () => {
      this.historybutton.upnum();
      this.updatehistory(this.historybutton.num);
    };
    this.historybutton.leftbutton.onpointend = () => {
      this.historybutton.downnum();
      this.updatehistory(this.historybutton.num);
    };
    this.historytext = Label({ text: "最終盤", fontSize: 40 })
      .addChildTo(this)
      .setPosition(320, 880);
    ButtonDesign({
      text: "シェア",
    })
      .addChildTo(this)
      .setPosition(100, 880).onpush = function () {
      let url =
        "https://twitter.com/intent/tweet?text=%E7%88%86%E5%BC%BE%E3%81%8C%E5%8B%95%E3%81%8F%E3%83%9E%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%91%E3%83%BC%E3%81%A0%E3%82%88%0A%E3%81%BF%E3%82%93%E3%81%AA%E3%82%82%E3%82%84%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%A6%E3%81%AD%0Ahttps%3A%2F%2Fugokusweeper.web.app%0A%23%E5%8B%95%E3%81%8F%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%91%E3%83%BC%0A";
      window.open(url);
    };
  },
  updatehistory: function (h) {
    this.tileGroup.sethistory(h);
    if (h == this.opentile) {
      this.historytext.text = "最終盤";
    } else {
      this.historytext.text = h + 1 + "手目";
    }
  },
  changedigmode: function () {
    this.isdigmode = !this.isdigmode;
    this.tileGroup.changedigmode(this.isdigmode);
    this.digbutton.text = this.isdigmode ? "⛏" : "🚩";
  },
});

phina.define("SettingScene", {
  superClass: "DisplayScene",
  init: function (option) {
    option = (option || {}).$safe({ tilenum: 9, bombnum: 10 });
    this.superInit({ backgroundColor: COLORS.bg });
    let bomblabelheight = 300;
    let tilelabelheight = 400;
    let buttonheight = 700;
    this.bombnum = option.bombnum;
    this.tilenum = option.tilenum;
    this.bomblabel = Label({ text: "バクダン数 ● × " + this.bombnum })
      .addChildTo(this)
      .setPosition(this.gridX.center(-2), bomblabelheight);
    this.bombnumbutton = ChangeNumButton({
      num: this.bombnum,
      maxnum: 79,
      minnum: 1,
    })
      .addChildTo(this)
      .setPosition(this.gridX.center(4.5), bomblabelheight);
    this.bombnumbutton.up.onpointend = () => {
      this.bombnumbutton.upnum();
      this.changebomb();
    };
    this.bombnumbutton.down.onpointend = () => {
      this.bombnumbutton.downnum();
      this.changebomb();
    };
    this.tilelabel = Label({
      text: "マス数 " + this.tilenum + " × " + this.tilenum,
    })
      .addChildTo(this)
      .setPosition(this.gridX.center(-2), tilelabelheight);
    this.tilenumbutton = ChangeNumButton({
      num: this.tilenum,
      maxnum: 12,
      minnum: 3,
    })
      .addChildTo(this)
      .setPosition(this.gridX.center(4.5), tilelabelheight);
    this.tilenumbutton.up.onpointend = () => {
      this.tilenumbutton.upnum();
      this.changetile();
    };
    this.tilenumbutton.down.onpointend = () => {
      this.tilenumbutton.downnum();
      this.changetile();
    };
    let changebutton = ButtonDesign({ text: "設定" })
      .addChildTo(this)
      .setPosition(this.gridX.center(), buttonheight);
    let self = this;
    changebutton.onpointend = () => {
      self.exit("main", {
        tilenum: self.tilenum,
        bombnum: self.bombnum,
      });
    };
    this.changebomb();
    this.changetile();
  },
  changebomb: function () {
    this.bombnum = this.bombnumbutton.num;
    this.bomblabel.text = "バクダン数 💣 × " + this.bombnum;
    this.changetilerange();
  },
  changetile: function () {
    this.tilenum = this.tilenumbutton.num;
    this.tilelabel.text = "マス数 " + this.tilenum + " × " + this.tilenum;
    this.changebombrange();
  },
  changebombrange: function () {
    let n = this.tilenum;
    this.bombnumbutton.changerange(1, n * n - 2);
  },
  changetilerange: function () {
    let n = this.bombnum;
    n = Math.ceil(Math.sqrt(n + 2));
    this.tilenumbutton.changerange(n, 12);
  },
});

phina.define("Tiles", {
  superClass: "DisplayElement",
  init: function (option) {
    option = (option || {}).$safe({ tilenum: 9, bombnum: 10, tilewidth: 56 });
    this.superInit();
    this.tilenum = option.tilenum;
    this.bombnum = option.bombnum;
    this.tilewidth = option.tilewidth;
    this.opentile = 0;
    this.bombs = [];
    this.tiles = [];
    this.history = [];
    this.isongame = false;
    for (let x = 0; x < this.tilenum; x++) {
      let tiles = [];
      for (let y = 0; y < this.tilenum; y++) {
        let tile = Tile(x, y, this.tilewidth)
          .addChildTo(this)
          .setPosition(x * (this.tilewidth + 3), y * (this.tilewidth + 3));
        tiles.push(tile);
      }
      this.tiles.push(tiles);
    }
  },
  setbomb: function (x, y) {
    let prearray = new Array(this.tilenum * this.tilenum)
      .fill(null)
      .map((item, i) => [Math.floor(i / this.tilenum), i % this.tilenum])
      .filter((i) => i[0] != x || i[1] != y);
    for (let i = prearray.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [prearray[i], prearray[j]] = [prearray[j], prearray[i]];
    }
    for (let i = 0; i < this.bombnum; i++) {
      this.bombs[i] = [prearray[i][0], prearray[i][1]];
    }
    this.setnum();
    this.isongame = true;
  },
  play: function (x, y) {
    if (!this.isongame) {
      this.parent.start();
      this.setbomb(x, y);
    }
    this.addhistory(x, y);
    this.tiles[x][y].open();
    if (this.tiles[x][y].isbomb) {
      this.gameover(false); //負け
    } else {
      if (this.count()) {
        this.movebomb();
      }
      this.opentile++;
    }
  },
  setnum: function () {
    this.tiles.forEach((xtiles) => {
      xtiles.forEach((tile) => {
        tile.bombaround = 0;
        tile.isbomb = false;
      });
    });
    let direct = new Array(9)
      .fill(null)
      .map((_, i) => [Math.floor(i / 3) - 1, (i % 3) - 1])
      .filter((i) => i[0] != 0 || i[1] != 0);
    let self = this;
    this.bombs.forEach((bomb) => {
      self.tiles[bomb[0]][bomb[1]].isbomb = true;
      direct.forEach((item) => {
        if (
          0 <= bomb[0] + item[0] &&
          bomb[0] + item[0] < self.tilenum &&
          0 <= bomb[1] + item[1] &&
          bomb[1] + item[1] < self.tilenum
        ) {
          self.tiles[bomb[0] + item[0]][bomb[1] + item[1]].bombaround += 1;
        }
      });
    });
    this.tiles.forEach((xtiles) => {
      xtiles.forEach((tile) => {
        tile.setlabel();
      });
    });
  },
  movebomb: function () {
    let self = this;
    let prearray = [];
    for (i = 0; i < this.bombnum; i++) {
      let bombx = this.bombs[i][0];
      let bomby = this.bombs[i][1];
      let direct = new Array(9)
        .fill(null)
        .map((_, i) => [Math.floor(i / 3) - 1, (i % 3) - 1])
        .filter((i) => i[0] * i[1] == 0);
      direct = direct
        .filter(
          (i) =>
            0 <= bombx + i[0] &&
            bombx + i[0] < self.tilenum &&
            0 <= bomby + i[1] &&
            bomby + i[1] < self.tilenum
        )
        .filter(
          (i) =>
            !self.bombs.some(
              (j) => j[0] == bombx + i[0] && j[1] == bomby + i[1]
            )
        )
        .filter((i) => !self.tiles[bombx + i[0]][bomby + i[1]].isopen);
      direct.push([0, 0]);
      let a = Math.floor(Math.random() * direct.length);
      this.bombs[i] = [bombx + direct[a][0], bomby + direct[a][1]];
    }
    this.setnum();
  },
  count: function () {
    if (this.opentile + 1 == this.tilenum * this.tilenum - this.bombnum) {
      this.gameover(true); //勝ち
      return false;
    }
    return true;
  },
  addhistory: function (x, y) {
    let history = new Array(this.tilenum * this.tilenum)
      .fill(null)
      .map((item, i) =>
        this.tiles[Math.floor(i / this.tilenum)][i % this.tilenum].historylabel(
          x,
          y
        )
      );
    this.history.push(history);
  },
  sethistory: function (h) {
    this.history[h].forEach((item, i) => {
      this.tiles[Math.floor(i / this.tilenum)][i % this.tilenum].sethistory(
        item
      );
    });
  },
  gameover: function (iswin) {
    this.stopaccess();
    this.addhistory(-1, -1);
    this.sethistory(this.opentile + 1);
    this.parent.gameover({ opentile: this.opentile + 1, iswin: iswin });
  },
  changedigmode: function (isdigmode) {
    this.tiles.forEach((xtiles) => {
      xtiles.forEach((tile) => {
        tile.isdigmode = isdigmode;
      });
    });
  },
  stopaccess: function () {
    this.tiles.forEach((xtiles) => {
      xtiles.forEach((tile) => {
        tile.setInteractive(false);
      });
    });
  },
});

phina.define("Tile", {
  superClass: "TileDesign",
  init: function (nx, ny, w) {
    this.superInit();
    this.fill = COLORS.close;
    this.width = w;
    this.height = w;
    this.nx = nx;
    this.ny = ny;
    this.bombaround = 0;
    this.isbomb = false;
    this.isopen = false;
    this.isflag = false;
    this.isdigmode = true;
    this.label = Label({ text: "" }).addChildTo(this);
    this.label.hide();
    this.setInteractive(true);
  },
  open: function () {
    this.setlabel();
    this.setInteractive(false);
    this.isopen = true;
    this.fill = COLORS.open;
    this.label.show();
  },
  change: function (n) {
    this.label.text = n;
  },
  setlabel: function () {
    if (this.isopen) {
      if (this.isbomb) {
        this.change("💣");
      } else {
        this.change(this.bombaround);
      }
    }
  },
  flaganim: function () {
    this.label.tweener.by({ rotation: 30 }, 100);
    this.label.tweener.by({ rotation: -60 }, 200);
    this.label.tweener.by({ rotation: 30 }, 100);
    this.label.tweener.play();
  },
  bombanim: function () {
    if (this.isbomb) {
      this.label.tweener.wait(100);
      this.change("💥");
      this.label.tweener.wait(100);
    }
  },
  onpointend: function () {
    if (!this.isopen) {
      if (this.isdigmode) {
        if (this.isflag) {
          this.flaganim();
        } else {
          this.parent.play(this.nx, this.ny);
        }
      } else {
        this.changeflag();
      }
    }
  },
  changeflag: function () {
    this.isflag = !this.isflag;
    if (this.isflag) {
      this.change("🚩");
      this.label.show();
    } else {
      this.change("");
      this.label.hide();
    }
  },
  changedigmode: function (isdigmode) {
    this.isdigmode = isdigmode;
  },
  historylabel: function (x, y) {
    return {
      isbomb: this.isbomb,
      isopen: this.isopen,
      bombaround: this.bombaround,
      isnext: this.nx == x && this.ny == y,
    };
  },
  sethistory: function (props) {
    if (props.isbomb) {
      this.change("💣");
    } else {
      this.change(props.bombaround);
    }
    if (props.isopen) {
      this.fill = COLORS.open;
      this.label.show();
    } else {
      this.fill = COLORS.close;
      this.label.hide();
    }
    if (props.isbomb) {
      this.label.show();
    }
    if (props.isnext) {
      this.fill = COLORS.next;
    }
  },
});

phina.define("TileDesign", {
  superClass: "RectangleShape",
  init: function () {
    this.superInit({ stroke: COLORS.frame, strokeWidth: 6, cornerRadius: 0 });
  },
});

phina.define("ButtonDesign", {
  superClass: "Button",
  init: function (option) {
    option = (option || {}).$safe({ width: 120, height: 60, fill: COLORS[2] });
    this.superInit(option);
  },
});

phina.define("ChangeNumButton", {
  superClass: "DisplayElement",
  init: function (option) {
    this.superInit();
    this.num = option.num;
    this.maxnum = option.maxnum;
    this.minnum = option.minnum;
    let position = 30;
    this.up = TriangleButtonDesign(0)
      .addChildTo(this)
      .setPosition(-position, 10);
    this.down = TriangleButtonDesign(180)
      .addChildTo(this)
      .setPosition(position, -10);
    this.canupdown();
  },
  upnum: function () {
    this.num++;
    this.canupdown();
  },
  downnum: function () {
    this.num--;
    this.canupdown();
  },
  canupdown: function () {
    this.up.active(this.minnum <= this.num && this.num < this.maxnum);
    this.down.active(this.minnum < this.num && this.num <= this.maxnum);
  },
  changerange: function (min, max) {
    this.minnum = min;
    this.maxnum = max;
    this.canupdown();
  },
});

phina.define("TriangleButtonDesign", {
  superClass: "TriangleShape",
  init: function (rotation) {
    this.superInit({ radius: 30, fill: COLORS[3], rotation: rotation });
  },
  active: function (bool) {
    this.setInteractive(bool);
    if (bool) {
      this.fill = COLORS[3];
    } else {
      this.fill = COLORS[4];
    }
  },
});

phina.define("ChangeLRNumButton", {
  superClass: "DisplayElement",
  init: function (option) {
    this.superInit();
    this.num = option.num;
    this.maxnum = option.maxnum;
    this.minnum = option.minnum;
    let position = 100;
    this.leftbutton = TriangleButtonDesign(270)
      .addChildTo(this)
      .setPosition(-position, 0);
    this.rightbutton = TriangleButtonDesign(90)
      .addChildTo(this)
      .setPosition(position, 0);
    this.canupdown();
  },
  upnum: function () {
    this.num++;
    this.canupdown();
  },
  downnum: function () {
    this.num--;
    this.canupdown();
  },
  canupdown: function () {
    this.rightbutton.active(this.minnum <= this.num && this.num < this.maxnum);
    this.leftbutton.active(this.minnum < this.num && this.num <= this.maxnum);
  },
});

//ゲームオーバーポップアップ
phina.define("GameoverPopup", {
  superClass: "DisplayScene",
  init: function (iswin) {
    this.superInit({ backgroundColor: "rgba(0,0,0,0.3)" });
    let self = this;
    let waku = RectangleShape({
      width: 480,
      height: 300,
      fill: COLORS.bg,
      stroke: COLORS.frame,
      strokeWidth: 10,
      cornerRadius: 20,
    })
      .addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center() + 20);
    ButtonDesign({
      text: "戻る",
    })
      .addChildTo(waku)
      .setPosition(waku.width / 4, waku.height / 4).onpush = function () {
      self.exit();
    };
    ButtonDesign({
      text: "シェア",
    })
      .addChildTo(waku)
      .setPosition(-waku.width / 4, waku.height / 4).onpush = function () {
      let url =
        "https://twitter.com/intent/tweet?text=%E7%88%86%E5%BC%BE%E3%81%8C%E5%8B%95%E3%81%8F%E3%83%9E%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%91%E3%83%BC%E3%81%A0%E3%82%88%0A%E3%81%BF%E3%82%93%E3%81%AA%E3%82%82%E3%82%84%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%A6%E3%81%AD%0Ahttps%3A%2F%2Fugokusweeper.web.app%0A%23%E5%8B%95%E3%81%8F%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%91%E3%83%BC%0A";
      window.open(url);
    };
    Label({
      text: iswin ? "クリア!" : "しっぱい...",
      fontSize: 60,
    })
      .addChildTo(waku)
      .setPosition(0, -waku.height / 6);
  },
});

phina.define("HowToPlayScene", {
  superClass: "DisplayScene",
  init: function (option) {
    option = (option || {}).$strict({ tilenum: 9, bombnum: 10 });
    this.superInit(option);
    // 背景色を指定
    this.tilenum = option.tilenum;
    this.bombnum = option.bombnum;
    this.tilewidth = 504 / this.tilenum;
    option.tilewidth = this.tilewidth;
    this.backgroundColor = COLORS.bg;
    this.isdigmode = true;
    let self = this;
    this.tileGroup = Tiles(option)
      .addChildTo(this)
      .setPosition(
        this.gridX.center() - ((this.tilewidth + 3) * (this.tilenum - 1)) / 2,
        this.gridY.center() - ((this.tilewidth + 3) * (this.tilenum - 1)) / 2
      );
    this.tileGroup.stopaccess();
    this.complements = DisplayElement().addChildTo(this);
    this.scene = 1;
    this.scene1();
  },
  scene1: function () {
    this.rectangle = RectangleShape({
      fill: "rgba(0,0,0,0)",
      stroke: "red",
      strokeWidth: 5,
      width: this.tilewidth * 3 + 8,
      height: this.tilewidth * 3 + 8,
    })
      .addChildTo(this.complements)
      .setPosition(this.gridX.center(), this.gridY.center());
    this.tileGroup.tiles[4][4].fill = "white";
    this.tileGroup.tiles[4][4].change("1");
    this.tileGroup.tiles[4][4].label.fill = "red";
    this.tileGroup.tiles[4][4].label.show();
    this.tileGroup.tiles[5][5].change("💣");
    this.tileGroup.tiles[5][5].label.show();
    this.description = TextRectangle(
      "数字は周囲8マスにある\n💣の数を表しています"
    )
      .addChildTo(this.complements)
      .setPosition(this.gridX.center(), 760);
  },
  scene2: function () {
    this.rectangle.hide();
    this.tileGroup.tiles[3][4].fill = "white";
    this.tileGroup.tiles[3][4].change("1");
    this.tileGroup.tiles[3][4].label.show();
    this.tileGroup.tiles[4][4].fill = "white";
    this.tileGroup.tiles[4][4].label.fill = "black";
    this.tileGroup.tiles[4][5].change("💣");
    this.tileGroup.tiles[4][5].label.show();
    this.tileGroup.tiles[5][5].label.hide();
    this.description.changetext("マスを開けるたびに\n💣が上下左右に動きます");
  },
  scene3: function () {
    this.tileGroup.tiles[4][5].fill = "white";
    this.tileGroup.tiles[4][5].change("💥");
    this.tileGroup.tiles[4][5].label.show();
    this.description.changetext("💣のあるマスを触ったら\nゲームオーバーです");
  },
  scene4: function () {
    this.description.changetext("グッドラック");
  },
  onpointend: function () {
    switch (this.scene++) {
      case 1:
        this.scene2();
        break;
      case 2:
        this.scene3();
        break;
      case 3:
        this.scene4();
        break;
      default:
        this.exit();
    }
  },
});

phina.define("TextRectangle", {
  superClass: "RectangleShape",
  init: function (text) {
    this.superInit({
      stroke: COLORS.frame,
      fill: COLORS.bg,
      width: 400,
      height: 100,
      strokeWidth: 6,
      cornerRadius: 0,
    });
    this.label = Label({ text: text }).addChildTo(this).setPosition(0, 0);
  },
  changetext: function (text) {
    this.label.text = text;
  },
});

// メイン処理
phina.main(function () {
  // アプリケーション生成
  let app = GameApp({
    startLabel: "main", // メインシーンから開始する
    scenes: [
      {
        className: "MainScene",
        label: "main",
        nextLabel: "main",
      },
      {
        className: "SettingScene",
        label: "setting",
        nextLabel: "main",
      },
    ],
  });
  // アプリケーション実行
  app.run();
});
