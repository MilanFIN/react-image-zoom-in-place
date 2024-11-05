import { describe, it, expect, beforeEach } from "vitest";
import {
    mouseLocationToImageOffset,
    calculateNewZoomPosition,
    setCanvasDimensions,
} from "../utils";

describe("mouseLocationToImageOffset", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
        mockCanvas = {
            getBoundingClientRect: () => ({
                left: 0,
                top: 0,
                width: 500,
                height: 500,
            }),
        } as HTMLCanvasElement;
    });

    it("imageoffset is [0, 0] if canvas is null", () => {
        expect(mouseLocationToImageOffset(100, 100, 2, null)).toEqual([0, 0]);
    });

    it("imageoffset is [0,0] offset when zoom is 0", () => {
        const result = mouseLocationToImageOffset(250, 250, 1, mockCanvas);
        expect(result[0]).toBeCloseTo(0, 0.1); //x
        expect(result[0]).toBeCloseTo(0, 0.1); //y
    });

    it("for zoom = 2, mouse at center should return offset of [-250, -250]", () => {
        const result = mouseLocationToImageOffset(250, 250, 2, mockCanvas);
        expect(result[0]).toBeCloseTo(-250, 0.1); //x
        expect(result[1]).toBeCloseTo(-250, 0.1); //y
    });

    it("for zoom = 2, mouse at bottom right corner should return offset of [-500, -500]", () => {
        const result = mouseLocationToImageOffset(500, 500, 2, mockCanvas);
        expect(result[0]).toBeCloseTo(-500, 0.1); //x
        expect(result[1]).toBeCloseTo(-500, 0.1); //y
    });
});

describe("calculateNewZoomPosition", () => {
    it("returns correct offset when there is no zoom change", () => {
        const result = calculateNewZoomPosition(
            100,
            100,
            1,
            1,
            { x: 100, y: 100 },
            { x: 0, y: 0 },
            500,
            500
        );
        expect(result).toEqual({ x: 0, y: 0 });
    });

    it("zooms in from center of canvas and calculates offset correctly", () => {
        const result = calculateNewZoomPosition(
            250,
            250,
            1,
            2,
            { x: 250, y: 250 },
            { x: 0, y: 0 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(-250, 0.1);
        expect(result.y).toBeCloseTo(-250, 0.1);
    });

    it("zooms out from center of canvas and calculates offset correctly", () => {
        const result = calculateNewZoomPosition(
            250,
            250,
            2,
            1,
            { x: 250, y: 250 },
            { x: -250, y: -250 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(0, 0.1);
        expect(result.y).toBeCloseTo(0, 0.1);
    });

    it("applies boundaries correctly when zooming in and clamping offset", () => {
        const result = calculateNewZoomPosition(
            0,
            0,
            1,
            3,
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(0, 0.1);
        expect(result.y).toBeCloseTo(0, 0.1);
    });

    it("applies boundaries correctly when zooming out and clamping offset", () => {
        const result = calculateNewZoomPosition(
            500,
            500,
            3,
            1,
            { x: 500, y: 500 },
            { x: 500, y: 500 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(0, 0.1); // Right boundary
        expect(result.y).toBeCloseTo(0, 0.1); // Bottom boundary
    });

    it("calculates correct offset when panning without zoom change", () => {
        const result = calculateNewZoomPosition(
            200,
            200,
            2,
            2,
            { x: 150, y: 150 },
            { x: -250, y: -250 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(-200, 0.1);
        expect(result.y).toBeCloseTo(-200, 0.1);
    });

    it("calculates correct offset when zooming and panning simultaneously", () => {
        const result = calculateNewZoomPosition(
            300,
            300,
            1,
            2,
            { x: 200, y: 200 },
            { x: 0, y: 0 },
            500,
            500
        );
        expect(result.x).toBeCloseTo(-200, 0.1);
        expect(result.y).toBeCloseTo(-200, 0.1);
    });
});

describe("setCanvasDimensions", () => {
    // Mock canvas and image elements
    let mockCanvas: HTMLCanvasElement;
    let mockImage: HTMLImageElement;

    beforeEach(() => {
        // Mock canvas object with width and height properties
        mockCanvas = {
            width: 0,
            height: 0,
        } as HTMLCanvasElement;

        // Mock image object with width and height properties
        mockImage = {
            width: 1000,
            height: 500,
        } as HTMLImageElement;
    });

    it("does nothing if canvas is null", () => {
        setCanvasDimensions(null, mockImage, 200, 200);
        expect(mockCanvas.width).toBe(0);
        expect(mockCanvas.height).toBe(0);
    });

    it("does nothing if image is null", () => {
        setCanvasDimensions(mockCanvas, null, 200, 200);
        expect(mockCanvas.width).toBe(0);
        expect(mockCanvas.height).toBe(0);
    });

    it("sets canvas dimensions to provided width and height", () => {
        setCanvasDimensions(mockCanvas, mockImage, 200, 150);
        expect(mockCanvas.width).toBe(200);
        expect(mockCanvas.height).toBe(150);
    });

    it("sets canvas width to provided width and calculates height from image aspect ratio", () => {
        setCanvasDimensions(mockCanvas, mockImage, 200);
        expect(mockCanvas.width).toBe(200);
        expect(mockCanvas.height).toBeCloseTo(100); // 500 / 1000 * 200 = 100
    });

    it("sets canvas height to provided height and calculates width from image aspect ratio", () => {
        setCanvasDimensions(mockCanvas, mockImage, undefined, 300);
        expect(mockCanvas.height).toBe(300);
        expect(mockCanvas.width).toBeCloseTo(600); // 1000 / 500 * 300 = 600
    });

    it("sets canvas dimensions to image dimensions when width and height are not provided", () => {
        setCanvasDimensions(mockCanvas, mockImage);
        expect(mockCanvas.width).toBe(1000);
        expect(mockCanvas.height).toBe(500);
    });
});
