export const setCanvasDimensions = (
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
	w?: number,
	h?: number,
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
  
  export const handleHover = (
	eventX: number,
	eventY: number,
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
	zoom: number,
	w?: number,
	h?: number,
  ) => {
	if (!canvas) return;
  
	const ctx = canvas.getContext("2d");
  
	if (!ctx) return;
	if (image != null) {
	  // Get the canvas bounding rectangle for accurate calculations
	  const rect = canvas.getBoundingClientRect();
  
	  // Calculate mouse X and Y relative to the canvas
	  const mouseX = eventX - rect.left;
	  const mouseY = eventY - rect.top;
  
	  const x = -(mouseX / rect.width) * (zoom * rect.width - rect.width);
	  const y = -(mouseY / rect.height) * (zoom * rect.height - rect.height);
	  ctx.clearRect(0, 0, rect.width, rect.height);
	  ctx.drawImage(image, x, y, rect.width * zoom, rect.height * zoom);
	}
  };
  
  export const resetZoom = (
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
	w?: number,
	h?: number,
  ) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
  
	if (image != null) {
	  const rect = canvas.getBoundingClientRect();
	  ctx.clearRect(0, 0, rect.width, rect.height);
	  ctx.drawImage(image, 0, 0, rect.width, rect.height);
	}
  };
  