const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 64;
canvas.height = 64;

export function getAverageColor(video) {

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let r = 0, g = 0, b = 0;
  let count = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: r / count / 255,
    g: g / count / 255,
    b: b / count / 255
  };
}