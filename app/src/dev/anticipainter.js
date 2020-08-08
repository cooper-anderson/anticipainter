import EventBus from "./event/eventbus.js"
import Graphics from "./graphics/graphics.js"
import Input from "./input/input.js";
import Controls from "./input/controls.js";
import Level0 from "./level/levels/level0.js"
import Level1 from "./level/levels/level1.js"
import EventUpdate from "./event/game/event-update.js";
import Entity from "./entity/entity.js";
import Player from "./game-object.js";
import GameMode from "./util/game-mode.js";

const levels = [Level0, Level1]

/**
 * The main Anticipainter module
 * @class Anticipainter
 */
export default class Anticipainter {
	/**
	 * If the [game]{@link Anticipainter} is running in the background
	 * @type {boolean}
	 *
	 * @memberOf Anticipainter
	 */
	static frozen = false

	// region Properties
	/**
	 * Reference to the {@link PIXI.Application} instance
	 * @type {PIXI.Application}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	app
	/**
	 * Reference to the {@link EventBus} module
	 * @type {EventBus}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	eventBus
	/**
	 * Reference to the {@link Graphics} module
	 * @type {Graphics}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	graphics
	/**
	 * Reference to the {@link Input} module
	 * @type {Input}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	input
	/**
	 * Reference to the {@link Controls} module
	 * @type {Controls}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	controls
	/**
	 * Reference to the {@link Level} instance
	 * @type {Level}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	level
	/**
	 * The index of the {@link Level}
	 * @type {number}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	levelIndex
	/**
	 * Set of all the [Entities]{@link Entity} currently active
	 * @type {Set<Entity>}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	entities
	/**
	 * If the game has finished initializing all the textures and the {@link Level}
	 * @type {boolean}
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	ready
	lastFrameTime
	// endregion

	constructor(app, levelIndex) {
		this.app = app
		this.levelIndex = levelIndex
		this.eventBus = new EventBus(this)
		this.graphics = new Graphics(this)
		this.input = new Input(this)
		this.controls = new Controls(this)
		this.entities = new Set()
		this.ready = false
		this.checkFrozenLoop()
	}

	/**
	 * Called once the resources are loaded
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	start() {
		if (this.levelIndex === undefined) return
		this.level = new levels[this.levelIndex](this)
		this.level.stage.forEachTile(tile => {
			this.entities.add(tile)
			tile.constructor.subscribeEvents(tile)
			tile.createSprite()
			Graphics.addSprite(tile)
		})
		this.level.stage.forEachWall(wall => {
			this.entities.add(wall)
			wall.constructor.subscribeEvents(wall)
			wall.createSprite()
			Graphics.addSprite(wall)
		})
		Player.subscribeEvents(this.level.player)
		this.level.player.createSprite()
		Graphics.addSprite(this.level.player)

		this.ready = true
		this.lastFrameTime = Date.now()
		this.app.ticker.add(() => {
			if (!Anticipainter.frozen) this.update()
		})
	}

	/**
	 * Called once per frame
	 *
	 * @memberOf Anticipainter
	 * @instance
	 */
	update() {
		let now = Date.now()
		let deltaTime = (now - this.lastFrameTime) / 1000
		this.lastFrameTime = now
		if (!this.ready) return
		let specific = EventBus.listeners.onUpdateNormal
		if (GameMode.equal(this.level.gameMode, GameMode.EXECUTION)) specific = EventBus.listeners.onUpdateExecute
		else if (GameMode.equal(this.level.gameMode, GameMode.DEATH)) specific = EventBus.listeners.onUpdateDeath
		else if (GameMode.equal(this.level.gameMode, GameMode.VICTORY)) specific = EventBus.listeners.onUpdateVictory

		let event = new EventUpdate(deltaTime)
		this.level.onUpdate(event)
		this.eventBus.callEvent(EventBus.listeners.onUpdate, event)
		this.eventBus.callEvent(specific, event)
	}

	checkFrozenLoop() {
		let last = new Date(), times = [0, 0, 0]
		setInterval(() => {
			let now = new Date()
			times.shift()
			times.push(now - last)
			last = now
			Anticipainter.frozen = Math.max(...times) > 500
		}, 250)
	}
}
