# react-image-zoomable-in-place

A work in progress (WIP) react component do display zoomable images.

The zoom is done within the original image bounds. The image component scales to the size of the parent component. 

## TODO:

* Make canvas size respect image aspect ratio without relying on the parent component styling
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
| alt      | string  |          |alt text for the image (WIP)|
| zoom     | number  |          |default zoom on mouse hover|
| maxZoom  | number  |          |maximum allowed zoom muliplication by scroll or touch pinch|
| step     | number  |          |zoom step on mouse scroll|

## Usage

```
import { ZoomableImage } from "react-image-zoom-in-place";


export default function Home() {
  return (
      <div style={{ width: '500px', height: "500px"}}>
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

## NPM

[https://www.npmjs.com/package/react-image-zoom-in-place](https://www.npmjs.com/package/react-image-zoom-in-place) 