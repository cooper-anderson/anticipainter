import {Player} from "./player.js"
import {Tile} from "./tile/tile.js"
import {Wall} from "./wall/wall.js"
import {Vector} from "./vector.js"
import {Grid} from "./grid.js"
import {Generator} from "./generator.js"
import {Direction, Orientation} from "./util.js"

export class Game {
	static sprites = new PIXI.Container()
	static resources = {}
	static entities = []

	static size = new Vector(9, 9)
	static resizeRate = 15

	constructor(app) {
		this.app = app
		this.frame = 0

		this.app.loader.on("progress", this.loadProgressHandler)
		this.loadResource(Player)
			.loadResource(Tile)
			.loadResource(Wall)

		this.onResize()


		let game = this
		this.app.loader.load((loader, resources) => { game.start(loader, resources) })
		window.onresize = function() { game.onResize() }
	}

	start(loader, resources) {
		Game.resources = resources

		this.test()
		this.grid = new Grid(Game.size.x, Game.size.y)
		this.generator = new Generator(this.grid)
		this.generator.generate()
		this.player = new Player(this)

		this.grid.forEachTile(function (tile) {
			tile.start()
		})
		this.grid.forEachWall(function (wall) {
			wall.start()
		})
		this.player.start()

		this.app.stage.addChild(Game.sprites)
		let game = this
		this.app.ticker.add(() => {game.update()})
	}

	test() {

	}

	update() {
		this.frame++
		let intensity = (Math.sin(this.frame / 100) + 1) / 2
		let color = Math.round((intensity * 0.05 + 0.1) * 255) * (1 + 256 + 65536)
		color += Math.round(0x000008 * intensity) + 0x000008
		// console.log(grey * Math.pow(256, 0))
		// this.app.renderer.backgroundColor = intensity * (1 + 256 + 65536)
		let pos = new Vector(Math.round(this.player.position.x), Math.round(this.player.position.y))
		this.grid.getTile(pos).activate()
		if (this.frame % Game.resizeRate === 0) this.onResize()
		for (let entity of Game.entities) {
			entity.update()
		}
	}

	loadResource(type) {
		/* if (type instanceof Entity) */ this.app.loader.add(type.getLoadableObject())
		return this
	}

	loadProgressHandler(loader, resource) {
		console.log("loading: " + resource.url)
		console.log("progress: " + loader.progress.toFixed(1) + "%")
	}

	onResize() {
		let width = this.app.renderer.width
		let height = this.app.renderer.height
		let scale = height / 1080 * 16 / Game.size.y
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		Game.sprites.pivot.set(64 * (Game.size.x - 1) / 2, 64 * (Game.size.y - 1) / 2)
		Game.sprites.position.set(width / 2, height / 2)
		Game.sprites.scale.set(scale, scale)
	}

	keyPress(key) {
		if ([65, 37].includes(key)) this.player.queueMove(Direction.LEFT)
		else if ([68, 39].includes(key)) this.player.queueMove(Direction.RIGHT)
		else if ([87, 38].includes(key)) this.player.queueMove(Direction.UP)
		else if ([83, 40].includes(key)) this.player.queueMove(Direction.DOWN)
	}

	render() {

	}
}
