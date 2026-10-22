export type Tool = {
  slug: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  popular?: boolean;
};

export const tools: Tool[] = [
  { slug: "tiktok-downloader", name: "TikTok", desc: "No WM + HD + Slide", icon: "Video", category: "Media", popular: true },
  { slug: "youtube-downloader", name: "YouTube", desc: "MP4 & MP3 320kbps", icon: "Youtube", category: "Media", popular: true },
  { slug: "pinterest-downloader", name: "Pinterest", desc: "Gambar HD 1080p", icon: "Image", category: "Media", popular: true },
  { slug: "instagram-downloader", name: "Instagram", desc: "Reels, Foto, Story", icon: "Instagram", category: "Media", popular: true },
  { slug: "spotify-downloader", name: "Spotify", desc: "Unduh Lagu MP3", icon: "Music", category: "Media", popular: true },
  { slug: "all-media-downloader", name: "All Media", desc: "Downloader Universal", icon: "DownloadCloud", category: "Media", popular: true },
  
  { slug: "image-compressor", name: "Kompres Gambar", desc: "Kecilkan ukuran foto", icon: "Image", category: "Image" },
  { slug: "qr-generator", name: "QR Generator", desc: "Buat QR Code instan", icon: "QrCode", category: "Misc" },
  { slug: "password-generator", name: "Password", desc: "Buat sandi aman", icon: "Key", category: "Misc" },
  { slug: "case-converter", name: "Case Converter", desc: "Ubah huruf besar/kecil", icon: "Type", category: "Text" },
  { slug: "word-counter", name: "Word Counter", desc: "Hitung kata & karakter", icon: "FileText", category: "Text" },
  { slug: "base64", name: "Base64 Encode", desc: "Encode/decode Base64", icon: "Code", category: "Text" },
];
