export const setCanvasDimensions = (
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
  ) => {
	if (!canvas) return;
  
	if (image == null) return;
  
	const w =
	  image.width >= image.height ? 100 : (image.width / image.height) * 100;
	const h =
	  image.height >= image.width ? 100 : (image.height / image.width) * 100;
  
	canvas.style.width = w + "%";
	canvas.style.height = h + "%";
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
  };
  
  export const handleHover = (
	eventX: number,
	eventY: number,
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
	zoom: number
  ) => {
	if (!canvas) return;
  
	// Get the canvas bounding rectangle for accurate calculations
	const rect = canvas.getBoundingClientRect();
  
	// Calculate mouse X and Y relative to the canvas
	const mouseX = eventX - rect.left;
	const mouseY = eventY - rect.top;
  
	const ctx = canvas.getContext("2d");
  
	if (!ctx) return;
	if (image != null) {
	  setCanvasDimensions(canvas, image);
  
	  const x = -(mouseX / rect.width) * (zoom * rect.width - rect.width);
	  const y =
		-(mouseY / rect.height) * (zoom * rect.height - rect.height);
  
	  ctx.drawImage(
		image,
		x,
		y,
		rect.width * zoom,
		rect.height * zoom,
	  );
	}
  };
  
  export const resetZoom =(
	canvas: HTMLCanvasElement | null,
	image: HTMLImageElement | null,
  ) => {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
  
	if (image != null) {
	  setCanvasDimensions(canvas, image);
	  const rect = canvas.getBoundingClientRect();
  
	  ctx.drawImage(image, 0, 0, rect.width, rect.height);
	}
  }