export default function deepEqual(
  a: Record<string, string | undefined>,
  b: Record<string, string | undefined>
): boolean {
  let match = true;

  for (const key in a) {
    match = match && a[key] === b[key];
  }
  return match;
}
