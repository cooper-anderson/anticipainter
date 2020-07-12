import {Game} from "./game/game.js"

let body = $("body")

body.fadeTo("slow", 1, () => {

})

const app = new PIXI.Application({
	antialias: true,
	backgroundColor: 0x263238
})

let view = $("#game")
view.append(app.view)
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.renderer.resize(view.innerWidth(), view.innerHeight());

let game = new Game(app)

let keys = []
$(document).on("keydown", function(event) {
	console.log(event)
	if (event.which === 27) {
		body.fadeTo("slow", 0, () => {
			window.location = "menu.html"
		})
	}
	if (!keys.includes(event.which)) {
		keys.push(event.which)
		game.keyPress(event.which)
	}
})

$(document).on("keyup", function(event) {
	keys = keys.filter(key => key !== event.which)
})

$(document).on("blur", function() {
	keys.length = 0
})
