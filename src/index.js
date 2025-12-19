// Import aset frontend sebagai text raw (perlu konfigurasi rules di wrangler, 
// tapi untuk simplifikasi kita copy paste string atau gunakan logika routing sederhana)
// CATATAN: Untuk production yang proper, gunakan 'Cloudflare Pages' untuk hosting aset statis.
// Di sini saya buatkan Worker yang bertindak sebagai API sekaligus File Server sederhana.

import html from '../public/index.html';
import css from '../public/style.css';
import js from '../public/script.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- 1. ROUTING FRONTEND (Melayani HTML/CSS/JS) ---
    if (url.pathname === '/') {
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    if (url.pathname === '/style.css') {
      return new Response(css, { headers: { 'Content-Type': 'text/css' } });
    }
    if (url.pathname === '/script.js') {
      return new Response(js, { headers: { 'Content-Type': 'application/javascript' } });
    }

    // --- 2. ROUTING API (Backend Logic) ---
    
    // A. Handle Upload & Convert
    if (request.method === 'POST' && url.pathname === '/api/upload') {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) return new Response("No file", { status: 400 });

      // Simpan File Asli ke R2
      const filename = file.name;
      await env.MY_BUCKET.put(filename, file.stream());

      // == [AREA LOGIKA KONVERSI] ==
      // Disini Anda bisa memanggil API eksternal atau memproses file.
      // Untuk contoh ini, kita anggap konversi "sukses" dan file hasil namanya "converted-"
      // (Pada realitanya, Anda harus mengupload file hasil konversi ke R2 juga)
      const convertedName = `converted-${filename}`;
      
      // MOCK: Kita copy file asli jadi file 'converted' untuk simulasi
      const originalObj = await env.MY_BUCKET.get(filename);
      await env.MY_BUCKET.put(convertedName, originalObj.body);

      return new Response(JSON.stringify({
        message: "Success",
        downloadUrl: `/api/download/${convertedName}`
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // B. Handle Download
    if (request.method === 'GET' && url.pathname.startsWith('/api/download/')) {
      const filename = url.pathname.split('/').pop();
      const object = await env.MY_BUCKET.get(filename);

      if (!object) return new Response("File not found", { status: 404 });

      return new Response(object.body, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
