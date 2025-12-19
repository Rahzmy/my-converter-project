const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileNameDisplay = document.getElementById('fileName');
const convertBtn = document.getElementById('convertBtn');
const statusMsg = document.getElementById('statusMessage');
const downloadArea = document.getElementById('downloadArea');
const downloadLink = document.getElementById('downloadLink');

// Trigger input file saat area diklik
dropZone.addEventListener('click', () => fileInput.click());

// Update nama file saat dipilih
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
        convertBtn.disabled = false;
    }
});

// Logic Tombol Konversi
convertBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // UI Loading State
    convertBtn.disabled = true;
    convertBtn.textContent = "Sedang Memproses...";
    statusMsg.textContent = "Mengupload dan mengonversi...";
    statusMsg.classList.remove('hidden');
    downloadArea.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Kirim ke Backend (Worker)
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Gagal memproses file");

        const data = await response.json();

        // Sukses
        statusMsg.textContent = "Selesai!";
        downloadLink.href = data.downloadUrl;
        downloadArea.classList.remove('hidden');
    } catch (error) {
        statusMsg.textContent = "Error: " + error.message;
        console.error(error);
    } finally {
        convertBtn.textContent = "Konversi Sekarang";
        convertBtn.disabled = false;
    }
});
