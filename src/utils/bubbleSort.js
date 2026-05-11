export const LIST_SIZE = 10;

export function makeList() {
  const values = new Set();

  while (values.size < LIST_SIZE) {
    values.add(Math.floor(Math.random() * 90) + 10);
  }

  return Array.from(values);
}
