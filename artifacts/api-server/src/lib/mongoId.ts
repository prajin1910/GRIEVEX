export function mongoIdToInt(mongoId: string): number {
  return parseInt(mongoId.slice(-8), 16);
}
