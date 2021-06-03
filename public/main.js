// phina.js をグローバル領域に展開
phina.globalize();

const COLORS = {
      bg:'#dfe0d8',
      frame:'#43464d',
      close: "gray",
      open : "white",
      0:'#9aadbe',
      1:'#934e61',
      2:'#4d639f',
      3:'#1d695f',
      4:'#844f30',

};

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function(option) {
    option = (option || {}).$safe({tilenum:9,bombnum:10});
    this.superInit(option);
    // 背景色を指定
    this.tilenum = option.tilenum
    this.bombnum = option.bombnum
    this.tilewidth = 504/this.tilenum
    option.tilewidth=this.tilewidth
    this.backgroundColor = COLORS.bg;
    this.isongame=false;
    this.time=0;
    this.timelabel = Label({text:"⌛000",fontSize:40}).addChildTo(this).setPosition(500,120)
    let label = Label({text:"💣×"+this.bombnum,fontSize:40}).addChildTo(this).setPosition(this.gridX.center(),120);
    let self = this
    this.tileGroup=Tiles(option).addChildTo(this).setPosition(this.gridX.center()-(this.tilewidth+3)*(this.tilenum-1)/2,this.gridY.center()-(this.tilewidth+3)*(this.tilenum-1)/2);
    let configbutton = ButtonDesign({text:"⚙設定"}).addChildTo(this).setPosition(140,120)
    configbutton.onpointend=()=>{
      self.exit('setting',option)
    }
  },
  update:function(app){
    if(this.isongame){
      this.time += app.deltaTime;
      this.timelabel.text="⌛"+ (Array(3).join('0')+Math.min(Math.floor(this.time/1000),999)).slice(-3);
    }
  },
  start:function(){
    this.isongame=true;
  },
  gameover: function(opentile){
    this.tileGroup.tiles.forEach(ytiles => {
      ytiles.forEach(tile => {
        tile.setInteractive(false)
      });
    });
    this.isongame=false;
    let button = ButtonDesign({text:"retry",width:120,height:60}).addChildTo(this).setPosition(540,880)
    button.onpointend=() =>this.exit({tilenum:this.tilenum,bombnum:this.bombnum})
    this.historybutton = ChangeLRNumButton({num:opentile,maxnum:opentile,minnum:0}).addChildTo(this).setPosition(320,880);
    this.historybutton.rightbutton.onpointend= () => {
      this.historybutton.upnum();
      this.updatehistory(this.historybutton.num)
    }
    this.historybutton.leftbutton.onpointend= () => {
      this.historybutton.downnum();
      this.updatehistory(this.historybutton.num)
    }
    this.historytext = Label({text: (opentile + 1) + "手目",fontSize:40 }).addChildTo(this).setPosition(320,880)
  },
  updatehistory: function(h){
    this.tileGroup.sethistory(h)
    this.historytext.text=(h + 1) + "手目"
  }
});

phina.define('SettingScene',{
  superClass:'DisplayScene',
  init: function(option){
    option = (option || {}).$safe({tilenum:9,bombnum:10});
    this.superInit({backgroundColor:COLORS.bg});
    let bomblabelheight = 300;
    let tilelabelheight = 400;
    let buttonheight = 700;
    this.bombnum = option.bombnum;
    this.tilenum = option.tilenum;
    this.bomblabel=Label({text:"バクダン数 ● × "+this.bombnum}).addChildTo(this).setPosition(this.gridX.center(-2),bomblabelheight);
    this.bombnumbutton = ChangeNumButton({
      num: this.bombnum,
      maxnum:79,
      minnum:1
    }).addChildTo(this).setPosition(this.gridX.center(4.5),bomblabelheight);
    this.bombnumbutton.up.onpointend= () => {
      this.bombnumbutton.upnum();
      this.changebomb()
    }
    this.bombnumbutton.down.onpointend= () => {
      this.bombnumbutton.downnum();
      this.changebomb()
    }
    this.tilelabel=Label({text: "マス数 "+this.tilenum+" × "+this.tilenum}).addChildTo(this).setPosition(this.gridX.center(-2),tilelabelheight);
    this.tilenumbutton = ChangeNumButton({
      num: this.tilenum,
      maxnum:12,
      minnum:3
    }).addChildTo(this).setPosition(this.gridX.center(4.5),tilelabelheight);
    this.tilenumbutton.up.onpointend= () => {
      this.tilenumbutton.upnum();
      this.changetile();
    }
    this.tilenumbutton.down.onpointend= () => {
      this.tilenumbutton.downnum();
      this.changetile();
    }
    let changebutton = ButtonDesign({text:"設定"}).addChildTo(this).setPosition(this.gridX.center(),buttonheight);
    let self = this;
    changebutton.onpointend=()=>{
      self.exit('main',{
        tilenum: self.tilenum,
        bombnum: self.bombnum
      });
    }
    this.changebomb();
    this.changetile();
  },
  changebomb:function(){
    this.bombnum=this.bombnumbutton.num;
    this.bomblabel.text = "バクダン数 💣 × "+this.bombnum;
    this.changetilerange();
  },
  changetile:function(){
    this.tilenum=this.tilenumbutton.num;
    this.tilelabel.text = "マス数 "+this.tilenum+" × "+this.tilenum
    this.changebombrange();
  },
  changebombrange:function(){
    let n = this.tilenum;
    this.bombnumbutton.changerange(1,n*n-2)
  },
  changetilerange:function(){
    let n = this.bombnum
    n= Math.ceil(Math.sqrt(n+2));
    this.tilenumbutton.changerange(n,12)
  }
})

phina.define('Tiles',{
  superClass:'DisplayElement',
  init: function(option){
    option = (option || {}).$safe({tilenum:9,bombnum:10,tilewidth:56})
    this.superInit();
    this.tilenum = option.tilenum;
    this.bombnum = option.bombnum;
    this.tilewidth = option.tilewidth;
    this.opentile = 0;
    this.bombs = [];
    this.tiles = [];
    this.history = [];
    this.isongame = false;
    for(let x = 0; x < this.tilenum; x++){
      let tiles = []
      for(let y = 0; y < this.tilenum; y++){
        let tile = Tile(x,y,this.tilewidth).addChildTo(this).setPosition(x*(this.tilewidth+3),y*(this.tilewidth+3));
        tiles.push(tile);
      }
      this.tiles.push(tiles)
    }
  },
  shuffle:function(x,y){
    let prearray = new Array(this.tilenum*this.tilenum).fill(null).map((item, i) => [Math.floor(i / this.tilenum), i % this.tilenum]).filter(i=>(i[0]!=x || i[1]!=y));
    for (let i = prearray.length - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [prearray[i], prearray[j]] = [prearray[j], prearray[i]];
    }
    for (let i = 0; i<this.bombnum;i++) {
      this.bombs[i] = [prearray[i][0],prearray[i][1]]
    }
    this.setnum();
    this.isongame = true;
  },
  play:function(x,y){
    if(!(this.isongame)){
      this.parent.start()
      this.shuffle(x,y);
    }
    this.tiles[x][y].open();
    this.addhistory()
    if(this.tiles[x][y].isbomb){
      this.gameover(false); //負け
    }else{
      this.opentile++;
      if(this.count()){
        this.movebomb();
      }
    }
  },
  setnum: function(){
    this.tiles.forEach(xtiles => {
      xtiles.forEach(tile => {
        tile.bombaround=0;
        tile.isbomb=false;
      });
    });
    let direct = new Array(9).fill(null).map((_,i)=>[Math.floor(i/3)-1,i%3-1]).filter(i=>(i[0]!=0 || i[1]!=0));
    let self = this;
    this.bombs.forEach(bomb => {
      self.tiles[bomb[0]][bomb[1]].isbomb=true;
      direct.forEach(item => {
        if(0 <= bomb[0]+item[0] && bomb[0]+item[0] < self.tilenum && 0 <= bomb[1]+item[1] && bomb[1]+item[1] < self.tilenum){
          self.tiles[bomb[0]+item[0]][bomb[1]+item[1]].bombaround+=1;
        }
      });
    });
    this.tiles.forEach(ytiles => {
      ytiles.forEach(tile => {
        tile.setlabel();
      });
    });
  },
  movebomb:function(){
    let self = this;
    let prearray = [];
    for(i=0;i<this.bombnum;i++){
      let bombx = this.bombs[i][0]
      let bomby = this.bombs[i][1]
      let direct = new Array(9).fill(null).map((_,i)=>[Math.floor(i/3)-1,i%3-1]).filter(i=>i[0]*i[1]==0);
      direct = direct.filter(i=>(0 <= bombx+i[0] && bombx+i[0] < self.tilenum && 0 <= bomby+i[1] && bomby+i[1] < self.tilenum))
                     .filter(i=>!(self.bombs.some(j=>(j[0]==bombx+i[0] && j[1]==bomby+i[1]))))
                     .filter(i=>!(self.tiles[bombx+i[0]][bomby+i[1]].isopen))
      direct.push([0, 0])
      let a = Math.floor(Math.random()*direct.length);
      this.bombs[i]=[bombx+direct[a][0],bomby+direct[a][1]];
    }
    this.setnum()
  },
  count:function(){
    if(this.opentile==this.tilenum*this.tilennum-this.bombnum){
      this.gameover(true); //勝ち
      return false;
    }
    return true;
  },
  addhistory: function(){
    let history = new Array(this.tilenum*this.tilenum).fill(null).map((item, i) => this.tiles[Math.floor(i / this.tilenum)][i % this.tilenum].historylabel());
    this.history.push(history)
  },
  sethistory: function(h){
    this.history[h].forEach((item, i) => {
      this.tiles[Math.floor(i / this.tilenum)][i % this.tilenum].sethistory(item)
    });
  },
  gameover: function(iswin){
    this.sethistory(this.opentile);
    this.parent.gameover(this.opentile)
    if(iswin){
      setTimeout(()=>{
        alert("clear");
      },50);
    }else{
      setTimeout(()=>{
        alert("gameover");
      },50);
    }
  }
})

phina.define('Tile',{
  superClass:'TileDesign',
  init: function(nx,ny,w){
    this.superInit();
    this.fill=COLORS.close;
    this.width=w;
    this.height=w;
    this.nx=nx;
    this.ny=ny;
    this.bombaround=0;
    this.isbomb=false;
    this.isopen=false;
    this.label=Label({text:""}).addChildTo(this);
    this.label.hide()
    this.setInteractive(true);
  },
  open: function(){
    this.setInteractive(false);
    this.isopen=true
    this.fill=COLORS.open;
    this.label.show()
  },
  change: function(n){
    this.label.text=n;
  },
  setlabel: function(){
    if(this.isbomb){
      this.change("💣");
    }else{
      this.change(this.bombaround)
    }
  },
  onpointend: function(){
    this.parent.play(this.nx,this.ny)
  },
  historylabel: function(){
    return {isbomb: this.isbomb, isopen: this.isopen,text:this.label.text}
  },
  sethistory: function(props){
    this.change(props.text)
    if(props.isopen){
      this.fill=COLORS.open
      this.label.show()
    }else{
      this.fill=COLORS.close
      this.label.hide()
    }
    if(props.isbomb){
      this.label.show()
    }
  }
});

phina.define('TileDesign',{
  superClass: 'RectangleShape',
  init: function(){
    this.superInit({stroke:COLORS.frame,strokeWidth:6,cornerRadius:0});
  }
});

phina.define('ButtonDesign',{
  superClass:'Button',
  init: function(option){
    option = (option || {}).$safe({width:120,height:60,fill:COLORS[2]})
    this.superInit(option);
  }
})

phina.define('ChangeNumButton',{
  superClass: 'DisplayElement',
  init:function(option){
    this.superInit();
    this.num = option.num;
    this.maxnum = option.maxnum;
    this.minnum = option.minnum;
    let position = 30;
    this.up = TriangleButtonDesign(0).addChildTo(this).setPosition(-position,10);
    this.down = TriangleButtonDesign(180).addChildTo(this).setPosition(position,-10);
    this.canupdown()
  },
  upnum:function(){
    this.num++;
    this.canupdown()
  },
  downnum:function(){
    this.num--;
    this.canupdown()
  },
  canupdown:function(){
    this.up.active((this.minnum<=this.num && this.num<this.maxnum));
    this.down.active((this.minnum<this.num && this.num<=this.maxnum));
  },
  changerange:function(min,max){
    this.minnum = min;
    this.maxnum = max;
    this.canupdown();
  }
})

phina.define('TriangleButtonDesign',{
  superClass: 'TriangleShape',
  init:function(rotation){
    this.superInit({radius:30,fill:COLORS[3],rotation:rotation});
  },
  active: function(bool){
    this.setInteractive(bool);
    if(bool){
      this.fill = COLORS[3];
    }else{
      this.fill = COLORS[4];
    }
  }
})

phina.define('ChangeLRNumButton',{
  superClass: 'DisplayElement',
  init:function(option){
    this.superInit();
    this.num = option.num;
    this.maxnum = option.maxnum;
    this.minnum = option.minnum;
    let position = 100;
    this.leftbutton = TriangleButtonDesign(270).addChildTo(this).setPosition(-position,0);
    this.rightbutton = TriangleButtonDesign(90).addChildTo(this).setPosition(position,0);
    this.canupdown()
  },
  upnum:function(){
    this.num++;
    this.canupdown()
  },
  downnum:function(){
    this.num--;
    this.canupdown()
  },
  canupdown:function(){
    this.rightbutton.active((this.minnum<=this.num && this.num<this.maxnum));
    this.leftbutton.active((this.minnum<this.num && this.num<=this.maxnum));
  },
})

// メイン処理
phina.main(function() {
  // アプリケーション生成
  let app = GameApp({
    startLabel: 'main', // メインシーンから開始する
    scenes: [
      {
        className:'MainScene',
        label: 'main',
        nextLabel: 'main',
      },{
        className:'SettingScene',
        label:'setting',
      }
    ]
  });
  // アプリケーション実行
  app.run();
});
