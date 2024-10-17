export const distanceFromCenter = (x: number, y: number, width: number, height: number) => {
  return Math.sqrt(
    Math.pow(x - (width - 1) / 2, 2) + Math.pow(y - (height - 1) / 2, 2)
  );
};