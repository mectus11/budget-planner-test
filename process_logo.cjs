const { Jimp } = require('jimp');

async function processImage() {
    try {
        const image = await Jimp.read('logo-base.png');

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            if (red > 240 && green > 240 && blue > 240) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0
            }
        });

        await image.write('client/public/logo-transparent.png');
        console.log('Logo processed successfully!');
    } catch (err) {
        console.error(err);
    }
}

processImage();
