"use client";
import { useEffect, useRef, useState } from "react";
import {
  mouseLocationToImageOffset,
  renderAtPointAndZoom,
  setCanvasDimensions,
} from "./utils";

type ZoomableProps = {
  src: string;
  alt?: string;
  zoom: number;
  maxZoom: number;
  step: number;
  width?: number;
  height?: number;
};

type Point = {
  x: number;
  y: number;
};

export function ZoomableImage(props: ZoomableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageOffset, setImageOffset] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  //touch screen state vars
  const [previousPosition, setPerviousPosition] = useState<Point | null>(null);
  const [previousDistance, setPreviousDistance] = useState<number | null>(null);

  if (image) {
    renderAtPointAndZoom(
      imageOffset.x,
      imageOffset.y,
      zoomLevel,
      canvasRef.current,
      image,
    );
  }

  const updateLocation = (x: number, y: number, zoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (previousPosition) {
      const zoomRatio = zoom / zoomLevel;

      const deltaX = x - previousPosition.x;
      const deltaY = y - previousPosition.y;

      const newOffset = {
        x: imageOffset.x - (x - imageOffset.x) * (zoomRatio - 1) + deltaX,
        y: imageOffset.y - (y - imageOffset.y) * (zoomRatio - 1) + deltaY,
      };

      newOffset.x = Math.min(
        0,
        Math.max(newOffset.x, canvas.width - canvas.width * zoom),
      );
      newOffset.y = Math.min(
        0,
        Math.max(newOffset.y, canvas.height - canvas.height * zoom),
      );

      setImageOffset(newOffset);
    }
    setPerviousPosition({ x: x, y: y });
    setZoomLevel(zoom);
  };

  useEffect(() => {
    if (props.src == null) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const rect = canvas.getBoundingClientRect();
      setCanvasDimensions(canvasRef.current, image, props.width, props.height);

      ctx.drawImage(image, 0, 0, rect.width, rect.height);
    };

    // If the image fails to load, you can handle it here
    image.onerror = () => {
      console.error("Failed to load image");
    };

    // Start loading the image from the provided URL
    image.src = props.src;

    setImage(image);
  }, [props.src]);

  useEffect(() => {
    if (!canvasRef.current) return;
    setCanvasDimensions(canvasRef.current, image, props.width, props.height);
    //image onload is not triggered for base64 images
    if (image != null) {
      setImageOffset({x:0, y:0})
      setZoomLevel(1);
    }
  }, [image, props.width, props.height]);

  //mouse events

  const handleMouseEnter = () => {
    setZoomLevel(props.zoom);
  };

  // Function to handle mouse move
  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    const eventX = event.clientX;
    const eventY = event.clientY;

    const [x, y] = mouseLocationToImageOffset(
      eventX,
      eventY,
      zoomLevel,
      canvasRef.current,
    );
    setImageOffset({
      x: x,
      y: y,
    });
    setPerviousPosition(null);
  };

  const handleMouseLeave = () => {
    setImageOffset({
      x: 0,
      y: 0,
    });
    setZoomLevel(1);
    setPerviousPosition(null);
  };

  const handleMouseScroll = (event: React.WheelEvent) => {
    let newZoom = 1;
    if (event.deltaY < 0) {
      newZoom = Math.min(Math.max(1, zoomLevel + props.step), props.maxZoom);
    } else {
      newZoom = Math.min(Math.max(1, zoomLevel - props.step), props.maxZoom);
    }
    
    const [x, y] = mouseLocationToImageOffset(
      event.clientX,
      event.clientY,
      newZoom,
      canvasRef.current,
    );
    setImageOffset({
      x: x,
      y: y,
    });
    setZoomLevel(newZoom);

    setPerviousPosition(null);

  }

  //touch screen events
  const handleSingleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0]!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(400, Math.max(0, touch.clientX - rect.left));
    const y = Math.min(400, Math.max(0, touch.clientY - rect.top));

    updateLocation(x, y, zoomLevel);
  };

  const handlePinchZoomMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || e.touches.length !== 2) return;

    const touch1 = e.touches[0]!;
    const touch2 = e.touches[1]!;
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY,
    );

    const midpointX = (touch1.clientX + touch2.clientX) / 2;
    const midpointY = (touch1.clientY + touch2.clientY) / 2;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(400, Math.max(0, midpointX - rect.left));
    const y = Math.min(400, Math.max(0, midpointY - rect.top));

    let newZoomLevel = zoomLevel;

    if (previousDistance) {
      newZoomLevel =
        zoomLevel +
        (currentDistance - previousDistance) /
          Math.max(rect.width, rect.height);
      newZoomLevel = Math.max(1, Math.min(props.maxZoom, newZoomLevel));
    }

    updateLocation(x, y, newZoomLevel);
    setPreviousDistance(currentDistance);

  };

  const handleDragMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length === 1) handleSingleTouchMove(event);
    if (event.touches.length === 2) handlePinchZoomMove(event);
  };

  const resetDrag = (event: React.TouchEvent<HTMLCanvasElement>) => {
    setPerviousPosition(null);
    setPreviousDistance(null);
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>

        <canvas
          style={{ touchAction: "none" }} //disable browser window scroll on mobile
          ref={canvasRef}
          width={props.width ? props.width : 1}
          height={props.height ? props.height : 1}
          onTouchStart={resetDrag}
          onTouchMove={handleDragMove}
          onTouchEnd={resetDrag}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleMouseScroll}
          aria-label={props.alt ? props.alt : ""}
        />
    </div>
  );
}
