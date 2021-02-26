export default function deepEqual(a: Record<string, string | unknown>, b: Record<string, string | unknown>): boolean {
  let match = true;

  for (const key in a) {
    match = match && a[key] === b[key];
  }
  return match;
}
