# react-image-zoom-in-place

A work in progress (WIP) react component do display zoomable images.

The zoom works both on mouse & touchscreen, and is done within the original bounds of the image.

## TODO:

* Fix some glitches in the pinch zoom and dragging.

## Behavior

#### Mouse

* Hover over image to zoom
* Reset when mouse leaves image boundary
* Panning the image based on cursor position
* Scroll to +/- zoom within bounds

#### Touchscreen

* Pinch gesture to zoom image
* Drag to pan image.

## Props

| Name     | Type    | Optional | Description |
| -------- | ------- | -------  | ------- |
| src      | string  |          |url or base64 string for the image|
| alt      | string  |   x      |alt text for the image (using an aria-label)|
| zoom     | number  |          |default zoom on mouse hover|
| maxZoom  | number  |          |maximum allowed zoom muliplication by scroll or touch pinch|
| step     | number  |          |zoom step on mouse scroll|
| width    | number  |   x      |override default width|
| height   | number  |   x      |override default height|

Width and height parameters are optional, but using them can avoid layout shift when the image loads.
If only one is defined, the second one is derived from the image aspect ratio.

## Usage

```
import { ZoomableImage } from "react-image-zoom-in-place";


export default function Home() {
  return (
      <div >
        <ZoomableImage
          src={"<image url or base64 here>"}
          alt="alt text"
          zoom={2}
          maxZoom={10}
          step={0.1}
        />
      </div>
  );
}

```

## License

MIT

# Git

[https://github.com/MilanFIN/react-image-zoom-in-place](https://github.com/MilanFIN/react-image-zoom-in-place) 

## NPM

[https://www.npmjs.com/package/react-image-zoom-in-place](https://www.npmjs.com/package/react-image-zoom-in-place) 