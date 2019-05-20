var Level2 = {

  preload: function() {
			game.load.image('starfield', '/assets/starfield.png');
			game.load.image('ship', '/assets/ship.png');
			game.load.image('bullet', '/assets/bullets/bullet.png');
			game.load.image('enemy2sp', '/assets/enemies/enemy2.png');
			game.load.image('enemy3sp', '/assets/enemies/enemy3.png');
			game.load.image('enemy3Bullet', '/assets/bullets/blue-enemy-bullet.png');
			game.load.image('weaponsp', '/assets/bullets/death-ray.png');
			game.load.spritesheet('explosion', '/assets/explode.png', 128, 128);
			game.load.bitmapFont('spacefont', '/assets/spacefont/spacefont.png', '/assets/spacefont/spacefont.xml');
			game.load.image('boss', '/assets/enemies/boss.png');
			game.load.image('deathRay', '/assets/bullets/death-ray.png');
	},

  create: function() {
			
			game.scale.pageAlignHorizontally = true;
			music.addEventListener('ended',function(){
				this.currentTime = 0;
				this.play();
			}, false);
			music.play();
			
			//  The scrolling starfield background
			starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
			//  Our bullet group
			bullets = game.add.group();
			bullets.enableBody = true;
			bullets.physicsBodyType = Phaser.Physics.ARCADE;
			bullets.createMultiple(30, 'bullet');
			bullets.setAll('anchor.x', 0.5);
			bullets.setAll('anchor.y', 1);
			bullets.setAll('outOfBoundsKill', true);
			bullets.setAll('checkWorldBounds', true);
			//  The hero!
			player = game.add.sprite(100, game.height / 2, 'ship');
			player.health = 100;
			player.anchor.setTo(0.5, 0.5);
			game.physics.enable(player, Phaser.Physics.ARCADE);
			player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
			player.body.drag.setTo(DRAG, DRAG);
			player.weaponLevel = 1;
			player.events.onKilled.add(function(){
				shipTrail.kill();
			});
			player.events.onRevived.add(function(){
				shipTrail.start(false, 5000, 10);
			});
			
			// The enemies - Are we the baddies?
			enemy2 = game.add.group();
			enemy2.enableBody = true;
			enemy2.physicsBodyType = Phaser.Physics.ARCADE;
			enemy2.createMultiple(5, 'enemy2sp');
			enemy2.setAll('anchor.x', 0.5);
			enemy2.setAll('anchor.y', 0.5);
			enemy2.forEach(function(enemy){
				addEnemyEmitterTrail(enemy);
				enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
				enemy.damageAmount = 20;
				enemy.events.onKilled.add(function(){
					enemy.trail.kill();
				});
			});
			
			game.time.events.add(1000, launchEnemy2);
			
			//  Enemy's bullets
			enemy3Bullets = game.add.group();
			enemy3Bullets.enableBody = true;
			enemy3Bullets.physicsBodyType = Phaser.Physics.ARCADE;
			enemy3Bullets.createMultiple(30, 'enemy3Bullet');
			enemy3Bullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
			enemy3Bullets.setAll('alpha', 0.9);
			enemy3Bullets.setAll('anchor.x', 0.5);
			enemy3Bullets.setAll('anchor.y', 0.5);
			enemy3Bullets.setAll('outOfBoundsKill', true);
			enemy3Bullets.setAll('checkWorldBounds', true);
			enemy3Bullets.forEach(function(enemy){
				enemy.body.setSize(20, 20);
			});
			
			// More enemies!
			enemy3 = game.add.group();
			enemy3.enableBody = true;
			enemy3.physicsBodyType = Phaser.Physics.ARCADE;
			enemy3.createMultiple(30, 'enemy3sp');
			enemy3.setAll('anchor.x', 0.5);
			enemy3.setAll('anchor.y', 0.5);
			enemy3.forEach(function(enemy){
				enemy.damageAmount = 40;
			});
			
			// Weapon shiny diamonds
			weapon = game.add.group();
			weapon.enableBody = true;
			weapon.physicsBodyType = Phaser.Physics.ARCADE;
			weapon.createMultiple(5, 'weaponsp');
			weapon.setAll('anchor.x', 0.5);
			weapon.setAll('anchor.y', 0.5);
			//weapon.setAll('scale.x', 0.5);
			//weapon.setAll('scale.y', 0.5);
			weapon.callAll('crop', null, {x: 90, y: 0, width: 120, height: 70});
			weapon.forEach(function(diamond){
				diamond.body.setSize(diamond.width * 3 / 4, diamond.height * 3 / 4);
			});
			
			//game.time.events.add(1000, launchWeapon);
			
			//  And some controls to play the game with
			cursors = game.input.keyboard.createCursorKeys();
			fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			//  Add an emitter for the ship's trail
			shipTrail = game.add.emitter(player.x - 20, player.y, 400);
			shipTrail.height = 10;
			shipTrail.makeParticles('bullet');
			shipTrail.setYSpeed(20, -20);
			shipTrail.setXSpeed(-140, -120);
			shipTrail.setRotation(50, -50);
			shipTrail.setAlpha(1, 0.01, 800);
			shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000,
					Phaser.Easing.Quintic.Out);
			shipTrail.start(false, 5000, 10);
			
			//  An explosion pool
			explosions = game.add.group();
			explosions.enableBody = true;
			explosions.physicsBodyType = Phaser.Physics.ARCADE;
			explosions.createMultiple(30, 'explosion');
			explosions.setAll('anchor.x', 0.5);
			explosions.setAll('anchor.y', 0.5);
			explosions.forEach( function(explosion) {
				explosion.animations.add('explosion');
			});
			
			// Big explosion
			playerDeath = game.add.emitter(player.x, player.y);
			playerDeath.width = 50;
			playerDeath.height = 50;
			playerDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 10);
			playerDeath.setAlpha(0.9, 0, 800);
			playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);

			//  The boss!
			boss = game.add.sprite(0, 0, 'boss');
			boss.exists = false;
			boss.alive = false;
			boss.anchor.setTo(0.5, 0.5);
			boss.damageAmount = 50;
			// Talvez mudar (180 testado)
			boss.angle = -90;
			boss.scale.x = 0.6;
			boss.scale.y = 0.6;
			game.physics.enable(boss, Phaser.Physics.ARCADE);
			boss.body.maxVelocity.setTo(80, 100);
			boss.dying = false;
			boss.finishOff = function() {
				if (!boss.dying) {
					boss.dying = true;
					bossDeath.x = boss.x;
					bossDeath.y = boss.y;
					// Talvez mudar:
					bossDeath.start(false, 1000, 50, 20);
					//  kill boss after explotions
					game.time.events.add(1000, function(){
						var explosion = explosions.getFirstExists(false);
						var beforeScaleX = explosions.scale.x;
						var beforeScaleY = explosions.scale.y;
						var beforeAlpha = explosions.alpha;
						explosion.reset(boss.body.x + boss.body.halfWidth, boss.body.y + boss.body.halfHeight);
						explosion.alpha = 0.4;
						explosion.scale.x = 3;
						explosion.scale.y = 3;
						var animation = explosion.play('explosion', 30, false, true);
						animation.onComplete.addOnce(function(){
							explosion.scale.x = beforeScaleX;
							explosion.scale.y = beforeScaleY;
							explosion.alpha = beforeAlpha;
						});
						boss.kill();
						booster.kill();
						boss.dying = false;
						bossDeath.on = false;
						//  queue next boss
						bossLaunchTimer = game.time.events.add(game.rnd.integerInRange(bossSpacing, bossSpacing + 5000), launchBoss);
					});

					//  reset pacing for other enemies
					enemy3Spacing = 2500;
					enemy2Spacing = 1000;
					//  give some bonus health
					player.health = Math.min(100, player.health + 40);
					shields.render();
				}
			};
			
			//  Boss death ray
			function addRay(leftRight) {
				var ray = game.add.sprite(leftRight * boss.width * 0.75, 0, 'deathRay');
				ray.alive = false;
				ray.visible = false;
				boss.addChild(ray);
				ray.crop({x: 0, y: 0, width: 40, height: 40});
				ray.anchor.x = 0.5;
				ray.anchor.y = 0.5;
				ray.scale.x = 2.5;
				ray.damageAmount = boss.damageAmount;
				game.physics.enable(ray, Phaser.Physics.ARCADE);
				ray.body.setSize(ray.width / 5, ray.height / 4);
				ray.update = function() {
					this.alpha = game.rnd.realInRange(0.6, 1);
				};
				boss['ray' + (leftRight > 0 ? 'Right' : 'Left')] = ray;
			}
			addRay(1);
			addRay(-1);
			//  need to add the ship texture to the group so it renders over the rays
			var ship = game.add.sprite(0, 0, 'boss');
			ship.anchor = {x: 0.5, y: 0.5};
			boss.addChild(ship);

			boss.fire = function() {
				if (game.time.now > bossBulletTimer) {
					var raySpacing = 3000;
					var chargeTime = 1500;
					var rayTime = 1500;

					function chargeAndShoot(side) {
						ray = boss['ray' + side];
						ray.name = side;
						ray.revive();
						ray.y = 80;
						ray.alpha = 0;
						ray.scale.y = 13;
						game.add.tween(ray).to({alpha: 1}, chargeTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
							ray.scale.y = 150;
							game.add.tween(ray).to({y: -1500}, rayTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
								ray.kill();
							});
						});
					}
					chargeAndShoot('Right');
					chargeAndShoot('Left');
					bossBulletTimer = game.time.now + raySpacing;
				}
			};

			boss.update = function() {
				if (!boss.alive) return;
				boss.rayLeft.update();
				boss.rayRight.update();
				// Mudar --> confirmar tudo:
				if (boss.x < game.width - 140) {
					boss.body.acceleration.x = 50;
				}
				if (boss.x > game.width - 140) {
					boss.body.acceleration.x = -50;
				}
				if (boss.y > player.y + 50) {
					boss.body.acceleration.y = -50;
				} else if (boss.y < player.y - 50) {
					boss.body.acceleration.y = 50;
				} else {
					boss.body.acceleration.y = 0;
				}
				//  Squish and rotate boss for illusion of "banking"
				var bank = boss.body.velocity.y / MAXSPEED;
				boss.scale.y = 0.6 - Math.abs(bank) / 3;
				// Talvez mudar para 90 ou 180
				boss.angle = -90 - bank * 20;
				// Talvez mudar para +10 e -5
				booster.x = boss.x - 10 * Math.abs(bank) - boss.width / 2;
				booster.y = boss.y + 5 * bank;
				//  fire if player is in target
				// Talvez mudar para +90 ou tirar o 90 (tirar o 90 testado)
				var angleToPlayer = game.math.radToDeg(game.physics.arcade.angleBetween(boss, player)) - 90;
				// Talvez tirar o -90 ou mudar para +90
				var anglePointing = -90 - Math.abs(boss.angle);
				if (anglePointing - angleToPlayer < 18) {
					boss.fire();
				}
			}

			//  boss's boosters
			booster = game.add.emitter(boss.body.x + boss.width / 2, boss.body.y);
			booster.height = 0;
			booster.makeParticles('enemy3Bullet');
			booster.forEach(function(p){
				p.crop({x: 0, y: 120, width: 50, height: 45});
				//  clever way of making 2 exhaust trails by shifing particles randomly up or down
				// Talvez
				p.anchor.x = 0.75;
				p.anchor.y = game.rnd.pick([1,-1]) * 0.95 + 0.5;
			});
			// Talvez mudar para -30 e -50 (testado os 2 negativos)
			booster.setXSpeed(30, 50);
			booster.setRotation(0,0);
			booster.setYSpeed(0, 0);
			booster.gravity = 0;
			booster.setAlpha(1, 0.1, 400);
			// Talvez mudar --> 0.3 0 0.7 0 ou trocados (testado tudo a 0)
			booster.setScale(0.3, 0, 0.7, 0, 5000, Phaser.Easing.Quadratic.Out);
			// Talvez mudar
			boss.bringToTop();

			//  Big explosion for boss
			bossDeath = game.add.emitter(boss.x, boss.y);
			bossDeath.width = boss.width / 2;
			bossDeath.height = boss.height / 2;
			bossDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 20);
			bossDeath.setAlpha(0.9, 0, 900);
			bossDeath.setScale(0.3, 1.0, 0.3, 1.0, 1000, Phaser.Easing.Quintic.Out);

			//  Shields stat
			shields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health +'%', 50);
			shields.render = function () {
				shields.text = 'Shields: ' + Math.max(player.health, 0) +'%';
			};
			shields.render();
			
			//  Score
			scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 50);
			scoreText.render = function () {
				scoreText.text = 'Score: ' + score;
			};
			scoreText.render();
			
			//  Game over text
			gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER!', 110);
			gameOver.x = gameOver.x - gameOver.textWidth / 2;
			gameOver.y = gameOver.y - gameOver.textHeight / 3;
			gameOver.visible = false;
		},
    
    update: function() {
			//  Scroll the background
			starfield.tilePosition.x -= 2;
			//  Reset the player, then check for movement keys
			player.body.acceleration.y = 0;
			player.body.acceleration.x = 0;
			if (cursors.up.isDown && cursors.left.isDown) {
				player.body.acceleration.y = -0.7 * ACCLERATION;
				player.body.acceleration.x = -0.7 * ACCLERATION;
			}
			if (cursors.up.isDown && cursors.right.isDown) {
				player.body.acceleration.y = -0.7 * ACCLERATION;
				player.body.acceleration.x = 0.7 * ACCLERATION;
			}
			if (cursors.down.isDown && cursors.left.isDown) {
				player.body.acceleration.y = 0.7 * ACCLERATION;
				player.body.acceleration.x = -0.7 * ACCLERATION;
			} 
			if (cursors.down.isDown && cursors.right.isDown) {
				player.body.acceleration.y = 0.7 * ACCLERATION;
				player.body.acceleration.x = 0.7 * ACCLERATION;
			}
			if (cursors.up.isDown) {
				player.body.acceleration.y = -ACCLERATION;
			}
			if (cursors.down.isDown) {
				player.body.acceleration.y = ACCLERATION;
			}
			if (cursors.left.isDown) {
				player.body.acceleration.x = -ACCLERATION;
			}
			if (cursors.right.isDown) {
				player.body.acceleration.x = ACCLERATION;
			}
			//  Stop at screen edges
			if (player.x > game.width - 30) {
				player.x = game.width - 30;
				player.body.acceleration.x = 0;
			}
			if (player.x < 30) {
				player.x = 30;
				player.body.acceleration.x = 0;
			}
			if (player.y > game.height - 15) {
				player.y = game.height - 15;
				player.body.acceleration.y = 0;
			}
			if (player.y < 15) {
				player.y = 15;
				player.body.acceleration.y = 0;
			}
			//  Fire bullet
			if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
				fireBullet();
			}
			//  Keep the shipTrail lined up with the ship
			shipTrail.y = player.y;
			shipTrail.x = player.x - 20;
			
			//  Check collisions
			game.physics.arcade.overlap(player, enemy2, shipCollide, null, this);
			game.physics.arcade.overlap(enemy2, bullets, hitEnemy, null, this);
			
			game.physics.arcade.overlap(player, enemy3, shipCollide, null, this);
			game.physics.arcade.overlap(enemy3, bullets, hitEnemy, null, this);
			game.physics.arcade.overlap(player, boss.rayRight, enemyHitsPlayer, null, this);

			game.physics.arcade.overlap(boss, bullets, hitEnemy, bossHitTest, this);
			game.physics.arcade.overlap(player, boss.rayLeft, enemyHitsPlayer, null, this);

			
			game.physics.arcade.overlap(enemy3Bullets, player, enemyHitsPlayer, null, this);
			
			game.physics.arcade.overlap(player, weapon, weaponCollide, null, this);
			
			//  Game over?
			if (! player.alive && gameOver.visible === false) {
				gameOver.visible = true;
				var fadeInGameOver = game.add.tween(gameOver);
				fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
				fadeInGameOver.onComplete.add(setResetHandlers);
				fadeInGameOver.start();
				function setResetHandlers() {
					//  The "click to restart" handler
					tapRestart = game.input.onTap.addOnce(_restart,this);
					spaceRestart = fireButton.onDown.addOnce(_restart,this);
					function _restart() {
						tapRestart.detach();
						spaceRestart.detach();
						restart();
					}
				}
			}
		}

}
