// iPhone-Fotos (HEIC/HEIF) clientseitig zu JPEG konvertieren
// (ARCHITECTURE.md §5). heic-to bringt eine aktuelle libheif mit und liest
// auch moderne iPhone-HEICs (iOS 17/18, HDR); die Bibliothek wird erst bei
// Bedarf geladen.

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const { heicTo } = await import("heic-to/next");
  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.85,
  });
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
  });
}
