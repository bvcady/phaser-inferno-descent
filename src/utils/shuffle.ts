import { AleaRandom } from "../types/Random";

export function shuffle<T>(_array: T[], random: AleaRandom): T[] {
  const array = [..._array];
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
