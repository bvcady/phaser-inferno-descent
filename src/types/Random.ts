export type AleaRandom = {
  (): number;
  next(): number;
  uint32(): number;
  fract53(): number;
  version: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];
  exportState(): [number, number, number, number];
  importState(state: [number, number, number, number]): void;
};
