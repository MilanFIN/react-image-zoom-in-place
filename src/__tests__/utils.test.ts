import { describe, it, expect } from 'vitest';
import { mouseLocationToImageOffset } from '../utils';

describe('temp', () => {
  it('temp', () => {
    expect(5).toBe(5);
  });
});

describe("mouse to image coordinate conversion", () => {
  const mockCanvas = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 500,
      height: 500,
    }),
  } as HTMLCanvasElement;

  it('offset of [0, 0] if canvas is null', () => {
    expect(mouseLocationToImageOffset(100, 100, 2, null)).toEqual([0, 0]);
  });

  it('[0,0] offset when zoom is 0', () => {
    const result = mouseLocationToImageOffset(250, 250, 1, mockCanvas);
    expect(result[0]).toBeCloseTo(0,0.1); //x
    expect(result[0]).toBeCloseTo(0,0.1); //y
  });

  it('for zoom = 2, mouse at center should return offset of [-250, -250]', () => {
    const result = mouseLocationToImageOffset(250, 250, 2, mockCanvas);
    expect(result[0]).toBeCloseTo(-250, 0.1); //x
    expect(result[1]).toBeCloseTo(-250, 0.1); //y
  });

  it('for zoom = 2, mouse at bottom right corner should return offset of [-500, -500]', () => {
    const result = mouseLocationToImageOffset(500, 500, 2, mockCanvas);
    expect(result[0]).toBeCloseTo(-500, 0.1); //x
    expect(result[1]).toBeCloseTo(-500, 0.1); //y
  });

});