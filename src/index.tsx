"use client";
import { useEffect, useRef, useState } from "react";
import { handleHover, resetZoom, setCanvasDimensions } from "./utils";

type ZoomableProps = {
    src: string;
    alt: string;
    zoom: number;
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

export function Zoomable(props: ZoomableProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoomed, setZoomed] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [dragState, setDragState] = useState<Point>({
        x: 0,
        y: 0,
    });
    const [zoomPoint, setZoomPoint] = useState<Point>({
        x: 0,
        y: 0,
    });
    const [newZoomPoint, setNewZoomPoint] = useState<Point>({
        x: 0,
        y: 0,
    });
    const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
    const [inputMethodTimestamp, setInputMethodTimestamp] = useState<number>(0);

    // Function to handle mouse move
    const handleMouseMove = (
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
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

        handleHover(eventX, eventY, canvasRef.current, image, props.zoom);
    };

    // TODO: this should be in utils and callable here or in handleclick
    const handleMouseLeave = () => {
        if (
            inputMethod != InputMethod.Mouse &&
            inputMethod != null &&
            Date.now() - inputMethodTimestamp < INPUTMETHODLIFESPAN
        ) {
            return;
        }
        resetZoom(canvasRef.current, image);
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
            setCanvasDimensions(canvasRef.current, image);
            //const w = image.width >= image.height ? rect.width : rect.width *

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
        setCanvasDimensions(canvasRef.current, image);
        //image onload is not triggered for base64 images
        if (image != null) {
            resetZoom(canvasRef.current, image);
        }
    }, [image]);

    const handleDragStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
        setDragState({
            x: event.touches[0]!.clientX,
            y: event.touches[0]!.clientY,
        });
        setDragging(false);
        setInputMethod(InputMethod.Touch);
        setInputMethodTimestamp(Date.now());
    };

    const handleDragMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();

        if (zoomed) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();

            let changeX = dragState.x - event.touches[0]!.clientX;
            let newX = zoomPoint.x + changeX / props.zoom;
            newX = Math.max(0, Math.min(newX, rect.width));
            let changeY = dragState.y - event.touches[0]!.clientY;
            let newY = zoomPoint.y + changeY / props.zoom;
            newY = Math.max(0, Math.min(newY, rect.height));

            setNewZoomPoint({
                x: newX,
                y: newY,
            });

            setDragging(true);
            setInputMethod(InputMethod.Touch);
            setInputMethodTimestamp(Date.now());

            handleHover(newX, newY, canvasRef.current, image, props.zoom);
        }
    };

    const handleDragEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!dragging) {
            if (!zoomed) {
                handleHover(
                    dragState.x,
                    dragState.y,
                    canvasRef.current,
                    image,
                    props.zoom
                );
                setZoomPoint(dragState);
            } else {
                resetZoom(canvasRef.current, image);
            }
            setZoomed(!zoomed);
        } else {
            setZoomPoint(newZoomPoint);
        }
        setInputMethod(InputMethod.Touch);
        setInputMethodTimestamp(Date.now());
    };
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <a >
                <canvas
                    style={{ touchAction: "none" }} //disable browser window scroll on mobile
                    ref={canvasRef}
                    width={10}
                    height={10}
                    onMouseMove={handleMouseMove} // Track mouse movement
                    onMouseLeave={handleMouseLeave} // Handle mouse leave
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                />
            </a>
        </div>
    );
}
