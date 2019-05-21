var Menu = {
	
	preload: function() {
    
		game.load.image('lvl1', 'assets/lvl1.png', 200,200);
		game.load.image('lvl2', 'assets/lvl2.png', 200,200);
		game.load.image('background', 'Tails_spaceship.png', 20,20);

	},

	create: function() {
		var button1;
		var button2;

		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.physics.startSystem(Phaser.Physics.ARCADE);

		var bg = game.add.image(-1300,20, 'background');

		button1 = game.add.button(100,1750, "lvl1", click1 , this, function(){});
		button2 = game.add.button(1000,1750, "lvl2", click2, this, function(){});
    
		function click1 () {
			game.state.start('Level1');
		}

		function click2() {
			game.state.start('Level2');
		}
	}
	
}
