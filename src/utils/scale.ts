export const scale = (fromRange: [number, number], toRange: [number, number]) => {
  const d = (toRange[1] - toRange[0]) / (fromRange[1] - fromRange[0]);
  return (from: number) => (from - fromRange[0]) * d + toRange[0];
};
