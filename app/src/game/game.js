import {Direction, standardKeys} from "./util.js"
import {Display} from "./ui/display.js"
import {Generator} from "./generator.js"
import {Grid} from "./grid.js"
import {Hazard} from "./wall/hazard.js"
import {Player} from "./player.js"
import {Progression} from "./progression.js"
import {Tile} from "./tile/tile.js"
import {Vector} from "./vector.js"
import {Wall} from "./wall/wall.js"
import {bindAudio} from "../button.js"

export class Game {
	static sprites = new PIXI.Container()
	static tiles = new PIXI.Container()
	static walls = new PIXI.Container()
	static hazards = new PIXI.Container()
	static resources = {}

	static size = new Vector(9, 9)
	static resizeRate = 15

	static screenShakeIntensity = 3
	static screenShakeIntensityBonk = 10

	constructor(app) {
		this.preferences = new Preferences({configName: "user-preferences", defaults: Preferences.defaults})

		this.app = app
		this.frame = 0
		this.view = $("#game")
		this.display = new Display(this)
		this.victory = false
		this.victoryTimer = 100
		this.screenShake = this.preferences.get("video.screen-shake")
		this.wrapper = new PIXI.Container()

		this.app.loader.onProgress.add(this.loadProgressHandler)
		this.loadResource(Player)
			.loadResource(Tile)
			.loadResource(Wall)
			.loadResource(Hazard)

		this.onResize()

		let game = this
		this.progression = new Progression(this)
		this.app.loader.load((loader, resources) => { game.start(loader, resources) })
		window.onresize = function() { game.onResize() }
	}

	start(loader, resources) {
		Game.resources = resources

		this.grid = new Grid(Game.size.x, Game.size.y)
		this.generator = new Generator(this.grid)
		this.generator.generate()

		Game.sprites.addChild(Game.tiles)
		Game.sprites.addChild(Game.walls)
		Game.sprites.addChild(Game.hazards)

		this.player = new Player(this)
		this.player.position.x = Math.floor(Math.random() * Game.size.x)
		this.player.position.y = Math.floor(Math.random() * Game.size.y)

		this.display.start()
		this.grid.forEachTile(function (tile) {
			tile.start()
			tile.fadeIn()
		})
		this.grid.forEachWall(function (wall) { wall.start() })
		this.player.start()
		this.progression.initialize()

		this.wrapper.addChild(Game.sprites)
		this.app.stage.addChild(this.wrapper)
		let game = this
		this.app.ticker.add(() => {game.update()})
	}

	update() {
		this.frame++
		if (this.victory) {
			this.victoryTimer--
			this.player.updateVictory()
			this.grid.forEachTile(tile => tile.update())
			if (this.victoryTimer === 0) {
				this.showResults()
			}
			return
		}
		// let intensity = (Math.sin(this.frame / 100) + 1) / 2
		// let color = Math.floor((intensity * 0.05 + 0.1) * 256) * (1 + 256 + 65536)
		// color += Math.round(0x000008 * intensity) + 0x000008
		// this.app.renderer.backgroundColor = color

		// if (this.player.painting) this.grid.getTile(this.player.position.getRounded()).activate()

		let pos = new Vector()
		if (this.screenShake && this.player.lerp <= 1 && this.player.lastAttemptedMove !== undefined) {
			let direction = this.player.lastAttemptedMove.direction
			let lerp = (this.player.lerp < 0.5) ? this.player.lerp : 1 - this.player.lerp
			if (!this.player.bonk) pos = Vector.mul(Vector.lerp(new Vector(), Direction.toVector(direction), 1 - Math.pow(lerp - 1, 2)), Game.screenShakeIntensity)
			else pos = Vector.mul(Vector.lerp(new Vector(), Direction.toVector(Direction.inverse(direction)), 1 - Math.pow(lerp - 1, 2)), Game.screenShakeIntensityBonk)
		}
		Game.sprites.pivot.set(pos.x, pos.y)

		if (this.frame % Game.resizeRate === 0) this.onResize()

		this.grid.forEachTile(tile => tile.update())
		this.grid.forEachWall(wall => wall.update())
		this.player.update()

		this.progression.update()
	}

	gameVictory() {
		this.victory = true
	}

	gameOver() {
		setTimeout(this.showResults.bind(this), 650)
	}

	showResults() {
		if (isModalActive("modal-results")) return
		this.shownModal = true
		showModal("modal-results", function() {
			$("#state").text(this.victory ? "You Won!" : "You Died...")
			$("#total").text(this.progression.scoreTotal)
			bindAudio($(".modal .button"))
		}.bind(this))
		let m = $("#modals")
		m.css("now", 0)
		m.animate({now: 1}, {
			duration: 1000,
			step: now => {
				$("#score").text(Math.round(now * this.progression.scoreCount))
			}
		})
	}

	showValidTiles() {
		let valid = this.grid.getValidTiles(this.progression.sequence)
		valid.forEach((pos, index) => { this.grid.getTile(pos).showAsValid() })
	}

	loadResource(type) {
		/* if (type instanceof Entity) */ this.app.loader.add(type.getLoadableObject())
		return this
	}

	loadProgressHandler(loader, resource) {
		console.info("loading: " + resource.url)
		console.info("progress: " + loader.progress.toFixed(1) + "%")
	}

	onResize() {
		this.app.renderer.resize(this.view.innerWidth(), this.view.innerHeight());
		let width = this.app.renderer.width
		let height = this.app.renderer.height
		let scale = Math.min(width, height) / 1080 * 16 / Math.max(Game.size.x, Game.size.y)
		this.wrapper.pivot.set(64 * (Game.size.x - 1) / 2, 64 * (Game.size.y - 1) / 2)
		this.wrapper.position.set(width / 2, height / 2)
		this.wrapper.scale.set(scale, scale)
	}

	click() {
		if (this.shownModal) this.showResults()
	}

	keyDown(key) {
		if (key === 27) {
			$("body").fadeTo("slow", 0, () => {
				window.location = "menu.html"
			})
			return
		}
		if (standardKeys.includes(key) && this.shownModal) {
			this.showResults()
			return
		}
		if ([65, 37].includes(key)) this.player.queueMove(Direction.LEFT)
		else if ([68, 39].includes(key)) this.player.queueMove(Direction.RIGHT)
		else if ([87, 38].includes(key)) this.player.queueMove(Direction.UP)
		else if ([83, 40].includes(key)) this.player.queueMove(Direction.DOWN)
		else if ([32, 13].includes(key)) {
			if (!this.progression.inSequence) this.progression.speedUp = true
		}
	}

	keyUp(key) {
		if ([32, 13].includes(key)) this.progression.speedUp = false
	}

	render() {

	}
}
