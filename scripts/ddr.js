let reducedGraphics = false;
let gamePaused = false;
let pauseTime = 0;

let pauseButton = document.getElementById("pause-button");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");


class Arrow {
	constructor(key) {
		this.key = key;
		this.time = 4; // how long it takes to reach bottom
		this.src = `assets/arrow_${key}.png`;
		this.left = { l: "0%", d: "25%", u: "50%", r: "75%" }[key];
		this.build();
	}
	build() {
		// construct the arrow img element
		let parent = document.getElementById("arrow_parent");
		this.elem = document.createElement("img");
		this.elem.src = this.src;
		this.elem.className = "arrow";
		this.elem.style.left = this.left;
		parent.appendChild(this.elem);

		// start the arrow moving downwards
		setTimeout(() => {
			this.elem.style.bottom = "0%";
		}, 10);

		// check gesture at end
		setTimeout(() => {
			// gets first letter of gesture from pose.js and checks against key
			if (gesture[0] == this.key) {
				if (!reducedGraphics) {
					new Cloud(this.left);
				}
				new Message("fantastico! 🎉");
				score += 10 * multiplier;
				consecutive += 1;
				if (consecutive == 24) {
					multiplier = 5;
					new LargeMessage("8x 😆");
				} else if (consecutive == 12) {
					multiplier = 4;
					new LargeMessage("6x 😁");
				} else if (consecutive == 6) {
					multiplier = 3;
					new LargeMessage("4x 😊");
				} else if (consecutive == 3) {
					multiplier = 2;
					new LargeMessage("2x 🙌");
				}
			} else {
				if (gesture_log.includes(this.key)) {
					new Message("Bien!");
					score += 5 * multiplier;
				} else {
					setTimeout(() => {
						if (gesture_log.includes(this.key)) {
							new Message("Bien!");
							score += 6 * multiplier;
						} else {
							new Message("Desacierto! 😭");
							// var audio = new Audio("../assets/wrong.mp3");
                            // audio.volume = 0.5;
							// audio.play();
							// score -= 2;
							// score = Math.max(0, score);
							consecutive = 0;
							multiplier = 1;
						}
					}, 200);
				}
			}
			document.getElementById("score").innerHTML = score;
            document.getElementById("last-score").innerHTML = score;
			document.getElementById("arrow_parent").removeChild(this.elem);
		}, this.time * 1000);
	}
}

class Message {
	constructor(text) {
		this.text = text;

		let parent = document.getElementById("arrow_parent");
		this.elem = document.createElement("div");
		this.elem.innerHTML = this.text;
		this.elem.className = "message";
		parent.appendChild(this.elem);

		if (!reducedGraphics) {
			setTimeout(() => {
				this.elem.style.transform = "translate(-50%, -50%) scale(1.5)";
				this.elem.style.opacity = "0%";
			}, 10);
		}
		setTimeout(() => {
			document.getElementById("arrow_parent").removeChild(this.elem);
		}, 3000);
	}
}

class LargeMessage {
	constructor(text) {
		this.text = text;

		let parent = document.getElementById("arrow_parent");
		this.elem = document.createElement("div");
		this.elem.innerHTML = this.text;
		this.elem.className = "large-message";
		parent.appendChild(this.elem);

		setTimeout(() => {
			this.elem.style.transform = "translate(-50%, -50%) scale(1.5)";
			this.elem.style.opacity = "0%";
		}, 10);
		setTimeout(() => {
			document.getElementById("arrow_parent").removeChild(this.elem);
		}, 5000);
	}
}

class Cloud {
	constructor(left) {
		this.left = `${parseInt(left.slice(0, 2)) + 25 / 2}%`;
		let parent = document.getElementById("arrow_parent");
		this.elem = document.createElement("img");
		this.elem.src = "assets/cloud.png";
		this.elem.className = "cloud";
		this.elem.style.left = this.left;
		parent.appendChild(this.elem);

		setTimeout(() => {
			this.elem.style.transform = "translate(-50%, -50%) scale(5.0)";
			this.elem.style.opacity = "0%";
		}, 10);
		setTimeout(() => {
			document.getElementById("arrow_parent").removeChild(this.elem);
		}, 3000);
	}
}

let score = 0;
let consecutive = 0;
let multiplier = 1;
let playing = false;

async function play() {
	// play music (4 second delay to match up the timings)
	setTimeout(() => {
		audio.play();
	}, 4000);

	// ready set go
	let dingsound = new Audio("assets/chime.wav");
	dingsound.volume = 0.2;
	setTimeout(() => {
		new Message("Preparado!");
		dingsound.cloneNode().play();
		setTimeout(() => {
			new Message("Listo!");
			dingsound.cloneNode().play();
			setTimeout(() => {
				new Message("Estirate!");
				dingsound.cloneNode().play();
			}, 1000);
		}, 1000);
	}, 1000);

	// Start falling notes

	let start_time = Date.now(); // used to account for lag
	let accumulated_time = 0;
	let current_time;
    let totalDuration = track.reduce((total, note) => total + note[1], 0);

	for (let note of track) {
		// sleep
		current_time = Date.now();
		let drift = current_time - (start_time + accumulated_time);
		let delay = note[1] - drift;
		accumulated_time += note[1];
		// console.log(drift);
        // Update progress bar
        let progress = (accumulated_time / totalDuration) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.innerHTML = `${Math.round(progress)}%`;

		await new Promise((r) => setTimeout(r, delay));
		// create arrow
		new Arrow(note[0]);
	}
	playing = false;
	await new Promise((r) => setTimeout(r, 8000));
	reset();
}

 

async function start() {
	score = 0;
	playing = true;
	while (true) {
		if (loaded) {
			new Message("Levanta los 2 brazos para empezar");
		}
		if (gesture == "up") {
			document.getElementById("score").innerHTML = score;
			play();
			break;
		}
		// sleep
		await new Promise((r) => setTimeout(r, 1000));
	}
}
