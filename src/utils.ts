export const setCanvasDimensions = (
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement | null,
    w?: number,
    h?: number
) => {
    if (!canvas) return;

    if (image == null) return;

    if (w && h) {
        canvas.width = w;
        canvas.height = h;
    } else if (w && !h) {
        canvas.width = w;
        canvas.height = (image.height / image.width) * w;
    } else if (!w && h) {
        canvas.width = (image.width / image.height) * h;
        canvas.height = h;
    } else {
        canvas.width = image.width;
        canvas.height = image.height;
    }
};

export const renderAtPointAndZoom = (
    x: number,
    y: number,
    zoom: number,
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement | null
) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    if (image != null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, x, y, canvas.width * zoom, canvas.height * zoom);
    }
};

export function mouseLocationToImageOffset(
    eventX: number,
    eventY: number,
    zoom: number,
    canvas: HTMLCanvasElement | null
): [number, number] {
    if (!canvas) return [0, 0];

    const rect = canvas.getBoundingClientRect();

    // Calculate mouse X and Y relative to the canvas
    const mouseX = eventX - rect.left;
    const mouseY = eventY - rect.top;

    const x = -(mouseX / rect.width) * (zoom * rect.width - rect.width);
    const y = -(mouseY / rect.height) * (zoom * rect.height - rect.height);
    return [x, y];
}

export function calculateNewZoomPosition(
    x: number,
    y: number,
    previousZoom: number,
    newZoom: number,
    previousPosition: { x: number; y: number },
    imageOffset: { x: number; y: number },
    width: number,
    height: number
) {
    const zoomRatio = newZoom / previousZoom;

    const deltaX = x - previousPosition.x;
    const deltaY = y - previousPosition.y;

    const newOffset = {
        x: imageOffset.x - (x - imageOffset.x) * (zoomRatio - 1) + deltaX,
        y: imageOffset.y - (y - imageOffset.y) * (zoomRatio - 1) + deltaY,
    };

    newOffset.x = Math.min(
        0,
        Math.max(newOffset.x, width - width * newZoom)
    );
    newOffset.y = Math.min(
        0,
        Math.max(newOffset.y, height - height * newZoom)
    );

    return newOffset;
}


