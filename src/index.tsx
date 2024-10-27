"use client";
import { useEffect, useRef, useState } from "react";
import { handleHover, resetZoom, setCanvasDimensions } from "./utils";

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

enum InputMethod {
  Mouse = "Mouse",
  Touch = "Touch",
}

const INPUTMETHODLIFESPAN = 200; //ms
const RESOLUTIONTOZOOMMULTIPLIER = 100;

export function ZoomableImage(props: ZoomableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoomPoint, setZoomPoint] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [mouseLocation, setMouseLocation] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [inputMethodTimestamp, setInputMethodTimestamp] = useState<number>(0);

  //touch screen state vars
  const [previousPosition, setPerviousPosition] = useState<Point | null>(null);
  const [previousDistance, setPreviousDistance] = useState<number | null>(null);

  const updatePreviousPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (previousPosition) {
      let newX = zoomPoint.x - (x - previousPosition.x) / zoomLevel;
      if (newX < 0) newX = 0;
      if (newX > rect.width) newX = rect.width;
      let newY = zoomPoint.y - (y - previousPosition.y) / zoomLevel;
      if (newY < 0) newY = 0;
      if (newY > rect.height) newY = rect.height;

      setZoomPoint({
        x: newX,
        y: newY,
      });
    }
    setPerviousPosition({ x: x, y: y });
  };

  // Function to handle mouse move
  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    if (
      inputMethod != InputMethod.Mouse &&
      inputMethod != null &&
      Date.now() - inputMethodTimestamp < INPUTMETHODLIFESPAN
    ) {
      return;
    }

    const eventX = event.clientX;
    const eventY = event.clientY;
    setMouseLocation({
      x: eventX,
      y: eventY,
    });

    handleHover(
      eventX,
      eventY,
      canvasRef.current,
      image,
      zoomLevel,
      true,

      props.width,
      props.height,
    );
  };

  const handleMouseEnter = () => {
    if (
      inputMethod != InputMethod.Mouse &&
      inputMethod != null &&
      Date.now() - inputMethodTimestamp < INPUTMETHODLIFESPAN
    ) {
      return;
    }
    setZoomLevel(props.zoom);
  };

  const handleMouseLeave = () => {
    if (
      inputMethod != InputMethod.Mouse &&
      inputMethod != null &&
      Date.now() - inputMethodTimestamp < INPUTMETHODLIFESPAN
    ) {
      return;
    }
    resetZoom(canvasRef.current, image, props.width, props.height);
    setZoomLevel(props.zoom);
  };

  const handleMouseScroll = (event: React.WheelEvent) => {
    let newZoom = 1;
    if (event.deltaY < 0) {
      newZoom = Math.min(Math.max(1, zoomLevel + props.step), props.maxZoom);
    } else {
      newZoom = Math.min(Math.max(1, zoomLevel - props.step), props.maxZoom);
    }
    setZoomLevel(newZoom);

    handleHover(
      mouseLocation.x,
      mouseLocation.y,
      canvasRef.current,
      image,
      newZoom,
      true,

      props.width,
      props.height,
    );
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
    setCanvasDimensions(canvasRef.current, image, props.width, props.height);
    //image onload is not triggered for base64 images
    if (image != null) {
      resetZoom(canvasRef.current, image, props.width, props.height);
    }
  }, [image, props.width, props.height]);

  //touch screen events
  const handleSingleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0]!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(400, Math.max(0, touch.clientX - rect.left));
    const y = Math.min(400, Math.max(0, touch.clientY - rect.top));

    updatePreviousPosition(x, y);

    handleHover(
      zoomPoint.x,
      zoomPoint.y,
      canvasRef.current,
      image,
      zoomLevel,
      false,

      props.width,
      props.height,
    );
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

    updatePreviousPosition(x, y);
    console.log(midpointY - rect.top);
    let newZoomLevel = zoomLevel;

    if (previousDistance) {
      newZoomLevel =
        zoomLevel +
        (currentDistance - previousDistance) /
          Math.max(rect.width, rect.height);
      newZoomLevel = Math.max(1, Math.min(props.maxZoom, newZoomLevel));
      setZoomLevel(newZoomLevel);
    }
    setPreviousDistance(currentDistance);

    handleHover(
      zoomPoint.x,
      zoomPoint.y,
      canvasRef.current,
      image,
      newZoomLevel,
      false,

      props.width,
      props.height,
    );
  };

  const handleDragMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length === 1) handleSingleTouchMove(event);
    if (event.touches.length === 2) handlePinchZoomMove(event);
  };

  const resetDrag = (event: React.TouchEvent<HTMLCanvasElement>) => {
    setPerviousPosition(null);
    setPreviousDistance(null);

    setInputMethod(InputMethod.Touch);
    setInputMethodTimestamp(Date.now());
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/*
      <p>Touch and drag to move, pinch to zoom.</p>
      <p>
        Drag Position: X: {zoomPoint.x.toFixed(0)}, Y:{" "}
        {zoomPoint.y.toFixed(0)}
      </p>
      <p>Zoom Level: {zoomLevel.toFixed(2)}</p>*/}

      <a /*href={props.src} target={"_blank"}*/>
        <canvas
          style={{ touchAction: "none" }} //disable browser window scroll on mobile
          ref={canvasRef}
          width={props.width ? props.width : 1}
          height={props.height ? props.height : 1}
          onWheel={handleMouseScroll}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove} // Track mouse movement
          onMouseLeave={handleMouseLeave} // Handle mouse leave
          onTouchStart={resetDrag}
          onTouchMove={handleDragMove}
          onTouchEnd={resetDrag}
          aria-label={props.alt ? props.alt : ""}
        />
      </a>
    </div>
  );
}
