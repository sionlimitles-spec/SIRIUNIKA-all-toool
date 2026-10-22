export type Tool = {
  slug: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  popular?: boolean;
};

export const tools: Tool[] = [
  { slug: "tiktok-downloader", name: "TikTok Downloader", desc: "Video & Slide tanpa watermark", icon: "Video", category: "Media", popular: true },
  { slug: "youtube-downloader", name: "YouTube Downloader", desc: "Unduh Video MP4 & Audio MP3", icon: "Youtube", category: "Media", popular: true },
  { slug: "pinterest-downloader", name: "Pinterest HD", desc: "Unduh gambar & video HD 1080p", icon: "Image", category: "Media", popular: true },
  { slug: "instagram-downloader", name: "IG Downloader", desc: "Unduh foto & video IG", icon: "Instagram", category: "Media", popular: true },
  { slug: "spotify-downloader", name: "Spotify Downloader", desc: "Unduh lagu dari Spotify", icon: "Music", category: "Media", popular: true },
  { slug: "all-media-downloader", name: "All Media", desc: "Downloader serba bisa", icon: "DownloadCloud", category: "Media", popular: true },
  
  { slug: "image-compressor", name: "Kompres Gambar", desc: "Kecilkan ukuran foto", icon: "Image", category: "Image" },
  { slug: "qr-generator", name: "QR Generator", desc: "Buat QR Code kustom", icon: "QrCode", category: "Misc" },
  { slug: "password-generator", name: "Password", desc: "Buat sandi aman", icon: "Key", category: "Misc" },
  { slug: "case-converter", name: "Case Converter", desc: "Ubah huruf besar/kecil", icon: "Type", category: "Text" },
  { slug: "word-counter", name: "Word Counter", desc: "Hitung kata & karakter", icon: "FileText", category: "Text" },
  { slug: "base64", name: "Base64 Encode", desc: "Encode/decode Base64", icon: "Code", category: "Text" },
  
  // ===== TAMBAHKAN TOOLS BARU DI BAWAH SINI =====
];
