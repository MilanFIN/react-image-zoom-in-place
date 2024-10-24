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

  const [firstPoint, setFirstPoint] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [secondPoint, setSecondPoint] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [mouseLocation, setMouseLocation] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [previousPinchDistance, setPreviousPinchDistance] = useState<number>(0);

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [inputMethodTimestamp, setInputMethodTimestamp] = useState<number>(0);

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

    handleHover(eventX, eventY, canvasRef.current, image, zoomLevel, props.width, props.height);
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
      props.width,
      props.height
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

  const handleDragStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      setFirstPoint({
        x: event.touches[0]!.clientX,
        y: event.touches[0]!.clientY,
      });
    } else if (event.touches.length === 2) {
      setPreviousPinchDistance(
        Math.abs(event.touches[0]!.clientX - event.touches[1]!.clientX) +
          Math.abs(event.touches[0]!.clientY - event.touches[1]!.clientY),
      );
      setSecondPoint({
        x: event.touches[1]!.clientX,
        y: event.touches[1]!.clientY,
      });
    }
  };

  const handleDragMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (event.touches.length >= 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const changeX = firstPoint.x - event.touches[0]!.clientX;
      let newX = zoomPoint.x + changeX / props.zoom;
      newX = Math.max(0, Math.min(newX, rect.width));
      const changeY = firstPoint.y - event.touches[0]!.clientY;
      let newY = zoomPoint.y + changeY / props.zoom;
      newY = Math.max(0, Math.min(newY, rect.height));

      setZoomPoint({
        x: newX,
        y: newY,
      });
      setFirstPoint({
        x: event.touches[0]!.clientX,
        y: event.touches[0]!.clientY,
      });

      setInputMethod(InputMethod.Touch);
      setInputMethodTimestamp(Date.now());

      handleHover(
        newX,
        newY,
        canvasRef.current,
        image,
        zoomLevel,
        props.width,
        props.height,
      ); //props.zoom
    }
    if (event.touches.length >= 2) {
      const dist =
        Math.abs(firstPoint.x - event.touches[1]!.clientX) +
        Math.abs(firstPoint.y - event.touches[1]!.clientY);

      const newZoom =
        zoomLevel + (dist - previousPinchDistance) / RESOLUTIONTOZOOMMULTIPLIER;
      setPreviousPinchDistance(dist);
      setSecondPoint({
        x: event.touches[1]!.clientX,
        y: event.touches[1]!.clientY,
      });

      if (newZoom > 1 && newZoom < props.maxZoom) {
        setZoomLevel(newZoom);

        handleHover(
          zoomPoint.x,
          zoomPoint.y,
          canvasRef.current,
          image,
          newZoom,
          props.width,
          props.height,
        );
      }
    }
  };

  const handleDragEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    setFirstPoint(secondPoint);
    setInputMethod(InputMethod.Touch);
    setInputMethodTimestamp(Date.now());
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
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
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          aria-label={props.alt ? props.alt : ""}
        />
      </a>
    </div>
  );
}
