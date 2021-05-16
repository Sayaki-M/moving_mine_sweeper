// phina.js をグローバル領域に展開
phina.globalize();

const COLORS = {
      bg:'#dfe0d8',
      frame:'#848a96',
      aframe:'red',
      0:'#9aadbe',
      1:'#934e61',
      2:'#4d639f',
      3:'#1d695f',
      4:'#844f30',
};
const TILE = {
  9:60
};
// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function(option) {
    option = (option || {}).$safe({tilenum:9,bombnum:10});
    this.superInit(option);
    // 背景色を指定
    this.tilenum=option.tilenum
    this.bombnum=option.bombnum
    this.backgroundColor = COLORS.bg;
    this.bomb=[];
    this.shuffle();
    this.tiles=[];
    let label = Label({text:"● × "+this.bombnum,fontSize:40}).addChildTo(this).setPosition(this.gridX.center(),120);
    this.tileGroup=DisplayElement().addChildTo(this).setPosition(this.gridX.center()-TILE[this.tilenum]*(this.tilenum-1)/2,this.gridY.center()-TILE[this.tilenum]*(this.tilenum-1)/2);
    var self = this;
    for(let y = 0; y < this.tilenum; y++){
      let tiles = []
      for(let x = 0; x < this.tilenum; x++){
        let tile = Tile(x,y,self.bomb[x][y]).addChildTo(self.tileGroup).setPosition(x*TILE[this.tilenum],y*TILE[this.tilenum]);
        tile.onpointend=function(){
          if(tile.b==1){
            tile.open();
            tile.change("●");
            setTimeout(()=>{
              alert("gameover");
              self.exit();
            },50);
          }else{
            tile.open();
            self.play();
          }
        }
        tiles.push(tile);
      }
      self.tiles.push(tiles)
    }
  },
  shuffle:function(){
    let prearray =Array(this.tilenum*this.tilenum-this.bombnum).fill(0).concat(Array(this.bombnum).fill(1));
    let self=this;
    for (let i = prearray.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [prearray[i], prearray[j]] = [prearray[j], prearray[i]];
    }
    for(let i = 0;i<this.tilenum;i++){
      let darray = [];
      for(let j=0;j<this.tilenum;j++){
        darray.push(prearray[i*this.tilenum+j]);
      }
      self.bomb.push(darray);
    }
  },
  play:function(){
    this.count();
    this.movebomb();
    this.shownum();
  },
  movebomb:function(){
    let self = this;
    for(let y = 0; y < this.tilenum; y++){
      for(let x = 0; x < this.tilenum; x++){
        if(self.tiles[x][y].b!=1)continue;
        let n = [0,1,2,3,4]; //1:↑,2:←,3:↓,4:→
        if(x==0||self.tiles[x-1][y].b!=0)n=n.filter(a=>a!==1);
        if(y==0||self.tiles[x][y-1].b!=0)n=n.filter(a=>a!==2);
        if(x==this.tilenum-1||self.tiles[x+1][y].b!=0)n=n.filter(a=>a!==3);
        if(y==this.tilenum-1||self.tiles[x][y+1].b!=0)n=n.filter(a=>a!==4);
        let a = Math.floor(Math.random()*n.length);
        switch (n[a]) {
          case 1:
            self.tiles[x-1][y].b=1;
            self.tiles[x][y].b=0;
            break;
          case 2:
            self.tiles[x][y-1].b=1;
            self.tiles[x][y].b=0;
            break;
          case 3:
            self.tiles[x+1][y].b=1;
            self.tiles[x][y].b=0;
            break;
          case 4:
            self.tiles[x][y+1].b=1;
            self.tiles[x][y].b=0;
            break;
        }
      }
    }
  },
  count:function(){
    let i = 0;
    let self=this;
    for(let y = 0; y < this.tilenum; y++){
      for(let x = 0; x < this.tilenum; x++){
        if(self.tiles[x][y].b!=-1)i++;
      }
    }
    if(i==this.bombnum){
      setTimeout(()=>{
        alert("clear");
        self.exit();
      },50);
    }
  },
  shownum:function(){
    let self = this;
    for(let y = 0; y < this.tilenum; y++){
      for(let x = 0; x < this.tilenum; x++){
        if(self.tiles[x][y].b!=-1)continue;
        let t=0;
        for(let i = -1;i<=1;i++){
          for(let j=-1;j<=+1;j++){
            if(x+i<0||x+i>=this.tilenum||y+j<0||y+j>=this.tilenum)continue;
            if(self.tiles[x+i][y+j].b==1){
              t++;
            }
          }
        }
        self.tiles[x][y].change(t);
      }
    }
  }
});

phina.define('Tile',{
  superClass:'TileDesign',
  init: function(nx,ny,b){
    this.superInit();
    this.fill="gray";
    this.nx=nx;
    this.ny=ny;
    this.b=b;
    this.label=Label({text:""}).addChildTo(this);
    this.setInteractive(true);
  },
  open: function(){
    this.fill="white";
    this.b=-1;
    this.setInteractive(false);
  },
  change: function(n){
    this.label.text=n;
  }
});

phina.define('TileDesign',{
  superClass: 'RectangleShape',
  init: function(){
    this.superInit({width:TILE[this.tilenum],height:TILE[this.tilenum],stroke:COLORS.frame,strokeWidth:10});
  }
});

// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    startLabel: 'main', // メインシーンから開始する
    scenes: [
      {
        className:'MainScene',
        label: 'main',
        nextLabel: 'main',
      }
    ]
  });
  // アプリケーション実行
  app.run();
});
