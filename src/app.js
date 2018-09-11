import kontra from './kontra-d.js'
import sound from  './sound.js'

let states = {
    enemyGap: 0,
    mute: false,
    score: 0,
    level: 1
}

let b = document.body
let $canvas = b.querySelector('#canvas')
$canvas.width = 400
$canvas.height = 800

kontra.init();

let bullets = []
let enemys = []

let gap = 0 // 控制时间间隔生成子弹或敌机
let player = kontra.sprite({
    x: 0,
    y: kontra.canvas.height - 100,
    color: 'red',
    width: 40,
    height: 40,
    speed: 5,
    life: 100,
    update: function(dt) {
        gap += dt
        if(gap > 0.2) {
            player.shoot()
            gap = 0
        }
        if (kontra.keys.pressed('left')){
            if(player.x > this.speed - player.width) {
                player.x -= this.speed;
            }
        }
        if (kontra.keys.pressed('right')){
            if (player.x < kontra.canvas.width - this.speed) {
                player.x += this.speed;
            }
        }
        if (kontra.keys.pressed('up')){
            if (player.y > this.speed ) {
                player.y -= this.speed;
            }
        }
        if (kontra.keys.pressed('down')){
            if(player.y < kontra.canvas.height) {
                player.y += this.speed;
            }
        }
    },
    render: function() {
        this.context.fillStyle = this.color;

        this.context.beginPath()
        this.context.lineTo(this.x, this.y + this.height);
        this.context.lineTo(this.x + this.width, this.y + this.height);
        this.context.lineTo(this.x + this.width / 2, this.y);

        this.context.fill();
    },
    shoot() {
        let bulletWidth = 5
        let bulletHeight = 5
        let bullet = kontra.sprite({
            x: this.x + this.width / 2 - bulletWidth / 2,
            y: this.y - this.height,
            color: '#fff',
            width: 5,
            height: 5,
            free: false,
            speed: 7,
            update: function() {
                this.y -= this.speed
                if(this.y < 0) {
                    this.free = true
                }
            }
        })
        !states.mute
        bullets.push(bullet)
    }
});

function createEnemy() {
    let enemy = kontra.sprite({
        x: Math.random() * kontra.canvas.width,
        y: 0,
        color: 'blue',
        width: 40,
        height: 40,
        speed: 5,
        update: function() {
            this.y += this.speed
            if(this.y > kontra.canvas.height) {
                this.free = true
            }
        },
        render: function() {
            this.context.fillStyle = this.color;

            this.context.beginPath()
            this.context.lineTo(this.x, this.y);
            this.context.lineTo(this.x + this.width, this.y);
            this.context.lineTo(this.x + this.width / 2, this.y + this.height);

            this.context.fill();
        },
        life: 10
    });
    enemys.push(enemy)
}

function cd(obj1, obj2) { //collision detection
    if(Math.max(obj1.x, obj2.x) <= Math.min(obj1.x + obj1.width, obj2.x + obj2.width)
        &&
        Math.max(obj1.y, obj2.y) <= Math.min(obj1.y + obj1.height, obj2.y + obj2.height)
    ) {
        return true  
    }else {
        return false
    }
}
function g(id) {
    return document.getElementById(id)
}

let stage = {
    $score: g('score'),
    $restart: g('restart'),
    $mute: g('mute'),
    $life: g('life'),
    renderScore() {
        stage.$score.innerHTML = states.score
    },
    renderLife() {
        stage.$life.innerHTML = player.life
    },
    init() {
        stage.$restart.addEventListener('click', ()=> {
            enemys = []
            bullets = []
            player.x = 0
            player.y = kontra.canvas.height - 100
            player.life = 100
            states = {
                enemyGap: 0,
                mute: false,
                score: 0,
                level: 1
            }
            loop.start()
        })
    },
    restart() {
        
    }
}
stage.init()
let loop = kontra.gameLoop({
    fps: 60,
    update: function(dt) {
        states.enemyGap += dt
        player.update(dt)
        
        // 敌人碰撞检测
        bullets.forEach((bullet)=> {
            enemys.forEach((enemy)=> {
                if(cd(bullet, enemy)) {
                    enemy.life -= 5
                    if(enemy.life <= 0) {
                        enemy.free = true
                        states.score += 10
                        stage.renderScore()
                    }
                    bullet.free = true
                    !states.mute && sound.hit.play()
                }
            })
        })
        
        bullets.forEach((bullet, i)=> {
            bullet.update()
            bullet.free && bullets.splice(i, 1)
        })
        enemys.forEach((enemy, i)=> {
            enemy.update()
            enemy.free && enemys.splice(i, 1)
        })
        
        if(states.enemyGap > 1) {
            states.enemyGap = 0
            createEnemy()
        }
        
        // 玩家碰撞检测
        enemys.forEach((enemy)=> {
            if(cd(player, enemy)) {
                !states.mute && sound.hit.play()
                enemy.free = true
                player.life -= 30
                stage.renderLife()
                if(player.life <= 0) {
                    loop.stop()
                }
            }
        })
    },
    render: function() {
        player.render()
        bullets.forEach((bullet)=> {
            bullet.render()
        })
        enemys.forEach((enemy)=> {
            enemy.render()
        })
    }
});

loop.start();