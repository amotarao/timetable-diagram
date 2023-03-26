export const getArraySet = <T = unknown>(array: T[]): [T, T][] => {
  if (array.length <= 1) {
    return [];
  }
  return array.slice(0, array.length - 1).map((item, i) => [item, array[i + 1] as T]);
};
