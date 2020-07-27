import Entity from "../entity/entity.js"
import RenderLayer from "../util/render-layer.js"

/**
 * Abstract Tile class for creating tiles
 * @class Tile
 * @abstract
 */
export default class Tile extends Entity {
	// region Properties
	/**
	 * If this tile is currently activated
	 * @property activated
	 * @type {boolean}
	 * @private
	 */
	activated = false
	// endregion

	/**
	 * Get the activation state of this {@link Tile}
	 * @returns {boolean}
	 */
	getActivated() {
		return this.activated
	}

	/**
	 * Set the activation state of this {@link Tile}
	 * @param {boolean} state
	 */
	setActivated(state) {
		this.activated = state
	}

	createSprite() {
		super.createSprite();
		this.sprite.alpha = 0
		setTimeout(() => {
			this.animate("fadeIn", 500, now => {
				this.sprite.alpha = now * 0.15
			})
		}, 600 * Math.random())
	}

// region Event listeners

	/**
	 * Called when the {@link Player} is attempting to move over this {@link Tile}
	 * @listens {@link EventPlayerMove}
	 * @param {EventPlayerMove} event
	 */
	onTryPlayerMove(event) { }
	/**
	 * Called when the {@link Player} successfully moves over this {@link Tile}
	 * @listens {@link EventPlayerMove}
	 * @param {EventPlayerMove} event
	 */
	onPlayerMove(event) { }

	/**
	 * Called when the {@link Player} is attempting to arrive on this {@link Tile}
	 * @listens {@link EventPlayerArrive}
	 * @param {EventPlayerArrive} event
	 */
	onTryPlayerArrive(event) { }
	/**
	 * Called when the {@link Player} successfully arrives on this {@link Tile}
	 * @listens {@link EventPlayerArrive}
	 * @param {EventPlayerArrive} event
	 */
	onPlayerArrive(event) { }

	/**
	 * Called when the {@link Player} is attempting to leave from this {@link Tile}
	 * @listens {@link EventPlayerLeave}
	 * @param {EventPlayerLeave} event
	 */
	onTryPlayerLeave(event) { }
	/**
	 * Called when the {@link Player} successfully leaves from this {@link Tile}
	 * @listens {@link EventPlayerLeave}
	 * @param {EventPlayerLeave} event
	 */
	onPlayerLeave(event) { }

	// endregion

	static getRenderLayer() {
		return RenderLayer.TILE
	}
}