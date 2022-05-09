const availableChars = "abcdefghijklmnopqrstuvwxyz0123456789!?";
const captchaLength = 7;
const size = {width: 300, height: 90};
const fontSize = 70;
const strokeWidth = {min: 5, max: 25};

// const amount = Number(window.prompt("Anzahl der Captchas:", "1"));
//
// const timestamp = new Date().getTime();

// HTML references
const title = document.querySelector('#title');

let currentCaptcha;
let captchaResult;

const redrawCaptcha = () => {
	// Remove old stuff
	document.querySelectorAll("canvas").forEach(canvas => document.body.removeChild(canvas));

	// calculate captcha
	currentCaptcha = '';
	for (let i = 0; i < captchaLength; i++) {
		currentCaptcha += availableChars[randInt(0, availableChars.length - 1)];
	}
	// currentCaptcha = "pu!i?km";
	title.textContent = currentCaptcha;

	const backgroundCanvas = generateBackground();
	const chars = [...currentCaptcha].map((currentChar, index) => generateChar(currentChar, index));
	// generateChar(currentCaptcha[0], 0);

	const resultUnsalted = combineBgAndChars(backgroundCanvas, chars);

	const result = saltCanvas(resultUnsalted);

	const base64 = result.toDataURL();

	captchaResult = {text: currentCaptcha, base64};
	return captchaResult;
};

const generateBackground = () => {
	const canvas = document.createElement("canvas");
	canvas.style.display = "none";
	canvas.height = size.height;
	canvas.width = size.width;

	const ctx = canvas.getContext('2d');
	const center = [randInt(0, size.width * 1.7) / 2, size.height + randInt(0, size.height)];
	const [x, y] = center;
	ctx.ellipse(x, y, Math.max(x - randInt(0, size.width / 2), 100), Math.max(y - randInt(0, size.height / 2), 50), 0, 0, 2 * Math.PI);
	ctx.lineWidth = randInt(strokeWidth.min, strokeWidth.max);
	ctx.stroke();

	document.body.appendChild(canvas);
	return canvas;
};

const generateChar = (c) => {
	const canvas = document.createElement("canvas");
	canvas.style.display = 'none';
	const canvasSize = size.height;
	canvas.height = canvasSize;
	canvas.width = canvasSize;

	const ctx = canvas.getContext('2d');
	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height * 0.75);
	ctx.rotate(randFloat(-Math.PI / 6, Math.PI / 6));
	ctx.translate(-canvas.width / 2, -canvas.height * 0.75);
	ctx.font = `${fontSize}px Arial`;
	ctx.textAlign = 'center';
	ctx.fillStyle = "#000";
	ctx.fillText(c, canvas.width / 2, canvas.height * 0.75);
	ctx.restore();

	document.body.appendChild(canvas);
	return canvas;
};

const charToFullSizeCanvas = (char, position) => {
	const canvas = document.createElement("canvas");
	canvas.height = size.height;
	canvas.width = size.width;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(char, position * (canvas.width / (captchaLength + 1)), 0);

	return canvas;
};

const combineBgAndChars = (background, chars) => {
	const canvas = document.createElement("canvas");
	canvas.height = size.height;
	canvas.width = size.width;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(background, 0, 0);
	const finalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const fullSizeChars = chars.map(charToFullSizeCanvas);
	fullSizeChars.forEach(char => {
		const charContext = char.getContext('2d');
		const charImageData = charContext.getImageData(0, 0, canvas.width, canvas.height);
		for (let i = 3; i < charImageData.data.length; i += 4) {
			const shouldBeVisible = charImageData.data[i] ? !finalImageData.data[i] : finalImageData.data[i];
			finalImageData.data[i] = shouldBeVisible ? 255 : 0;
		}
	});

	ctx.putImageData(finalImageData, 0, 0);

	canvas.style.transform = "translate(-50%, 110%)";
	canvas.style.background = "red";
	canvas.style.display = 'none';
	document.body.appendChild(canvas);
	return canvas;
};

const saltCanvas = (input) => {
	const canvas = document.createElement("canvas");
	canvas.height = size.height;
	canvas.width = size.width;

	const ctx = canvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.stroke();
	ctx.drawImage(input, 0, 0);

	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < data.data.length; i += 4) {
		let isBlack = data.data[i] < 50;
		if (Math.random() < 0.02) {
			isBlack = !isBlack;
		}
		data.data[i] = isBlack ? randInt(0, 80) : 255 - randInt(0, 80);
		data.data[i + 1] = data.data[i];
		data.data[i + 2] = data.data[i];
	}

	ctx.putImageData(data, 0, 0);

	canvas.style.transform = "translate(-50%, 270%)";
	document.body.appendChild(canvas);
	return canvas;
};

const randInt = (min, max) => { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
};

const randFloat = (min, max) => { // min and max included
	return Math.random() * (max - min) + min;
};

const downloadImage = (fileName, base64Img) => {
	const a = document.createElement('a');
	a.download = fileName;
	a.href = base64Img;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

// const downloadString = (text, fileType, fileName) => {
//     const blob = new Blob([text], {type: fileType});
//
//     const a = document.createElement('a');
//     a.download = fileName;
//     a.href = URL.createObjectURL(blob);
//     a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
//     a.style.display = "none";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     setTimeout(() => {
//         URL.revokeObjectURL(a.href);
//     }, 1500);
// };
//
// const result = [];
// for (let i = 0; i < amount; i++) {
//     result.push(redrawCaptcha());
// }

// console.log(`Laufzeit für ${amount} captchas: ${(new Date().getTime() - timestamp) / 1000}s`);
// if (result.length > 0)
//     downloadString(JSON.stringify(result), "application/json", "captchas.json");
// else
//     redrawCaptcha();
redrawCaptcha();

const generateCaptchas = (n) => {
	const timestamp = new Date().getTime();
	const result = [];
	for (let i = 0; i < n; i++) {
		result.push(redrawCaptcha());
	}
	console.log(`Laufzeit für ${n} captchas: ${(new Date().getTime() - timestamp) / 1000}s`);
	return result;
};

const downloadCaptcha = () => {
	downloadImage(`${captchaResult.text}.png`, captchaResult.base64);
};

const initializedDiv = document.createElement("div");
initializedDiv.id = "initialized";
document.body.appendChild(initializedDiv);
