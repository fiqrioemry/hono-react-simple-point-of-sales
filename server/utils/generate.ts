export function generateAvatarUrl(name: string): string {
  const baseUrl = "https://ui-avatars.com/api/";
  const params = new URLSearchParams({
    name: name,
    background: "random",
    color: "fff",
    size: "128",
  });
  return `${baseUrl}?${params.toString()}`;
}
