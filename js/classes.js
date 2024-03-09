export class Canvas {
    #filterContainer;
    #canvas;
    #context;
    #padding;
    #img;
    #imgContainer;
    #filterType;
    #brightnessRange;

    constructor(canvasId = "canvas", imgContainerId = "#imgContainer", padding = 20) {
        this.#canvas = document.querySelector(canvasId);

        this.#padding = padding;
        if (!(this.#canvas instanceof HTMLCanvasElement)) {
            throw new Error("No se ha detectado un elemento canvas válido");
        }

        this.#context = this.#canvas.getContext("2d");
        this.#img = new Image();
        this.#filterType = null;

        this.addImgContainer(imgContainerId);

        let defaultImg = document.querySelector(`${imgContainerId} img`);
        this.drawImage(defaultImg.src);

        this.#filterContainer = document.querySelector('header');

        const filterElements = this.#filterContainer.querySelectorAll('.iconContainer');
        filterElements.forEach(element => {
            element.addEventListener('click', () => {
                this.setFilterTypeFromDataAttribute(element);
                this.filterSet();
            });
        });

        this.#context.willReadFrequently = true;
        this.#brightnessRange = document.querySelector('#brightnessRange');
    }

    disguiseBrightness() {
        if (this.#brightnessRange) {
            this.#brightnessRange.style.display = "none";
            this.#brightnessRange.value = 0;
        } else {
            console.error("Elemento no encontrado");
        }
    }

    drawImage(src) {
        this.#img.src = src;
        this.#img.onload = () => {
            this.#canvas.width = this.#img.width + 2 * this.#padding;
            this.#canvas.height = this.#img.height + 2 * this.#padding;

            this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#context.fillStyle = "#466362";
            this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

            this.#context.drawImage(
                this.#img,
                this.#padding,
                this.#padding,
                this.#img.width,
                this.#img.height
            );
        };
    }

    createFilter(filterType) {
        switch (filterType) {
            case 'bright':
                return new Bright(this.#canvas);
            case 'greyscale':
                return new Greyscale();
            case 'negative':
                return new Negative();
            case 'mirror':
                return new Mirror();
            case 'clear':
                return new Clear();
            case 'sepia':
                return new Sepia();
            case 'invertedGreyscale':
                return new InvertedGreyscale();
            default:
                throw new Error(`Tipo de filtro no reconocido: ${filterType}`);
        }
    }

    addImgContainer(imgContainer = "#imgContainer") {
        this.#imgContainer = document.querySelector(imgContainer);
        this.#imgContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.drawImage(e.target.src);
                this.disguiseBrightness();
            }
        });

        const brightnessRange = document.querySelector("#brightnessRange");
        brightnessRange.addEventListener('input', (event) => {
            this.updateBrightness(parseInt(event.target.value));
        });
    }

    updateBrightness(value) {
        const filter = this.createFilter('bright');
        filter.updateBrightness(value);
    }

    get filterContainer() {
        return this.#filterContainer;
    }

    get canvas() {
        return this.#canvas;
    }

    get context() {
        return this.#context;
    }

    get padding() {
        return this.#padding;
    }

    set padding(value) {
        this.#padding = value;
    }

    get img() {
        return this.#img;
    }

    get imgContainer() {
        return this.#imgContainer;
    }

    get filterType() {
        return this.#filterType;
    }

    set filterType(value) {
        this.#filterType = value;
    }

    get brightnessRange() {
        return this.#brightnessRange;
    }

    set brightnessRange(value) {
        this.#brightnessRange = value;
    }

    getFilterTypeFromDataAttribute(element) {
        return element.dataset.filter;
    }

    setFilterTypeFromDataAttribute(element) {
        if (element.dataset.filter) {
            this.#filterType = element.dataset.filter;
        }
    }

    filterSet() {
        if (this.#filterType == 'download') {
            this.downloadCanvas();
        } else {
            const filter = this.createFilter(this.#filterType);
            filter.filterSet(this.#img, this.#context);
        }

    }

    getContext() {
        return this.#context;
    }

    downloadCanvas(){
            var link = document.createElement('a');
            link.download = 'img.png';
            link.href = document.getElementById('canvas').toDataURL()
            link.click();
    }

}

class Filter {
    constructor() {
        this.padding = 20;
        this.brightnessRange = document.querySelector('#brightnessRange');
    }

    showBrightness() {
        if (this.brightnessRange) { 
            this.brightnessRange.style.display = "block";
        } else {
            console.error("Elemento no encontrado");
        }
    }

    disguiseBrightness() {
        if (this.brightnessRange) {
            this.brightnessRange.style.display = "none";
            this.brightnessRange.value = 0;
        } else {
            console.error("Elemento no encontrado");
        }
    }

    setBackground(ctx) {
        ctx.fillStyle = "#466362";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    filterSet(img, ctx) {
        if (ctx.canvas.width !== (img.width + 2 * this.padding) * 2) {
            ctx.canvas.width = (img.width + 2 * this.padding) * 2;
        }

        this.setBackground(ctx);

        ctx.drawImage(img, this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        this.applyImageFilter(ctx);
    }

    applyImageFilter(ctx) {}
}

class Sepia extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        const imageData = ctx.getImageData(this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = data.slice(i, i + 3);

            const tr = 0.393 * r + 0.769 * g + 0.189 * b;
            const tg = 0.349 * r + 0.686 * g + 0.168 * b;
            const tb = 0.272 * r + 0.534 * g + 0.131 * b;

            data[i] = Math.min(tr, 255);
            data[i + 1] = Math.min(tg, 255);
            data[i + 2] = Math.min(tb, 255);
        }

        const destX = ctx.canvas.width / 2 + this.padding;
        const destY = this.padding;

        ctx.putImageData(imageData, destX, destY);
    }
}

class InvertedGreyscale extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        const imageData = ctx.getImageData(this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

            data[i] = 255 - avg;
            data[i + 1] = 255 - avg;
            data[i + 2] = 255 - avg;
        }

        const destX = ctx.canvas.width / 2 + this.padding;
        const destY = this.padding;

        ctx.putImageData(imageData, destX, destY);
    }
}

class Bright extends Filter {
    constructor(canvas) {
        super();
        this.brightnessValue = 0;
        this.canvas = canvas;
        this.showBrightness();
    }

    applyImageFilter(ctx) {
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        const originalImageData = ctx.getImageData(0, 0, this.canvas.width / 2, this.canvas.height);
        const originalData = originalImageData.data;

        for (let y = 20; y < this.canvas.height - 20; y++) {
            for (let x = this.canvas.width / 2 + 20; x < this.canvas.width - 20; x++) {
                const index = (y * this.canvas.width + x) * 4;
                const originalIndex = (y * (this.canvas.width / 2) + (x - this.canvas.width / 2)) * 4;

                data[index] = originalData[originalIndex] + this.brightnessValue;
                data[index + 1] = originalData[originalIndex + 1] + this.brightnessValue;
                data[index + 2] = originalData[originalIndex + 2] + this.brightnessValue;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    updateBrightness(value) {
        this.brightnessValue = value;
        this.applyImageFilter(this.canvas.getContext('2d'));
    }
}

class Greyscale extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        const imageData = ctx.getImageData(this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        const destX = ctx.canvas.width / 2 + this.padding;
        const destY = this.padding;

        ctx.putImageData(imageData, destX, destY);
    }
}

class Negative extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        const originalImageData = ctx.getImageData(this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        const originalData = originalImageData.data;

        const negativeImageData = new ImageData(new Uint8ClampedArray(originalData), originalImageData.width, originalImageData.height);
        const negativeData = negativeImageData.data;

        for (let i = 0; i < negativeData.length; i += 4) {
            negativeData[i] = 255 - negativeData[i];
            negativeData[i + 1] = 255 - negativeData[i + 1];
            negativeData[i + 2] = 255 - negativeData[i + 2];
        }

        const destXOriginal = this.padding;
        const destYOriginal = this.padding;
        const destXNegative = ctx.canvas.width / 2 + this.padding;
        const destYNegative = this.padding;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "#466362";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.putImageData(originalImageData, destXOriginal, destYOriginal);
        ctx.putImageData(negativeImageData, destXNegative, destYNegative);
    }
}

class Mirror extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        const imageData = ctx.getImageData(this.padding, this.padding, ctx.canvas.width / 2 - 2 * this.padding, ctx.canvas.height - 2 * this.padding);
        const data = imageData.data;

        const mirroredImageData = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
        const mirroredData = mirroredImageData.data;

        for (let y = 0; y < mirroredImageData.height; y++) {
            for (let x = 0; x < mirroredImageData.width; x++) {
                const sourceIndex = (y * mirroredImageData.width + x) * 4;
                const destinationIndex = (y * mirroredImageData.width + mirroredImageData.width - x - 1) * 4;

                mirroredData[destinationIndex] = data[sourceIndex];
                mirroredData[destinationIndex + 1] = data[sourceIndex + 1];
                mirroredData[destinationIndex + 2] = data[sourceIndex + 2];
                mirroredData[destinationIndex + 3] = data[sourceIndex + 3];
            }
        }

        const destXOriginal = this.padding;
        const destYOriginal = this.padding;
        const destXMirrored = ctx.canvas.width / 2 + this.padding;
        const destYMirrored = this.padding;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "#466362";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.putImageData(imageData, destXOriginal, destYOriginal);
        ctx.putImageData(mirroredImageData, destXMirrored, destYMirrored);
    }
}

class Clear extends Filter {
    constructor() {
        super();
        this.disguiseBrightness();
    }

    applyImageFilter(ctx) {
        ctx.canvas.width = 900;
        ctx.clearRect(0, 0, 900, 900);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 900, 900);
    }
}