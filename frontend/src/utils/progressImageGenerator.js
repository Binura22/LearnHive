/**
 * Utility function to render a progress image on a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} courseTitle - The title of the course
 */
export const renderProgressImage = (canvas, progress, courseTitle) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw progress bar
  ctx.fillStyle = '#4CAF50';
  const barWidth = (progress / 100) * (canvas.width - 40);
  ctx.fillRect(20, 60, barWidth, 30);
  
  // Draw border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 60, canvas.width - 40, 30);
  
  // Add text
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${courseTitle}`, canvas.width/2, 30);
  ctx.fillText(`Progress: ${progress}%`, canvas.width/2, 120);
};

/**
 * Creates a file from a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas element to create image from
 * @returns {Promise<File>} - A File object containing the image
 */
export const canvasToFile = async (canvas) => {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
  
  return new File([blob], 'progress.png', { type: 'image/png' });
}; 