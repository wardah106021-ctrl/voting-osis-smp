let dataSuara = { kandidat1: 0, kandidat2: 0 };
let logDaftarPemilih = {};
let siswaAktifNama = "";
let siswaAktifKelas = "";

// KUNCI PASSWORD ADMIN: Kamu bisa bebas mengganti teks kata sandi ini
const PASSWORD_ADMIN_RAHASIA = "adminrpl123"; 

function prosesLogin(event) {
    event.preventDefault();
    const namaInput = document.getElementById("input-nama").value.trim();
    const kelasInput = document.getElementById("input-kelas").value;

    if (logDaftarPemilih[namaInput]) {
        alert("Sistem Menolak! Atas nama " + namaInput + " terdeteksi sudah pernah melakukan voting sebelumnya.");
        return;
    }

    siswaAktifNama = namaInput;
    siswaAktifKelas = kelasInput;

    document.getElementById("user-aktif").innerHTML = siswaAktifNama;
    document.getElementById("kelas-aktif").innerHTML = siswaAktifKelas;

    document.getElementById("layar-login").classList.add("sembunyi");
    document.getElementById("layar-voting").classList.remove("sembunyi");
}

function kirimSuara(idKandidat) {
    dataSuara[idKandidat] += 1;

    // Catat identitas ke log riwayat sistem
    logDaftarPemilih[siswaAktifNama] = {
        kelas: siswaAktifKelas,
        status: "Sudah Memilih"
    };

    alert("Suara dari " + siswaAktifNama + " (" + siswaAktifKelas + ") berhasil direkam. Terima kasih!");
    risetUlangFormKeAwal();
}

function risetUlangFormKeAwal() {
    document.getElementById("input-nama").value = "";
    document.getElementById("input-kelas").value = "";
    document.getElementById("layar-voting").classList.add("sembunyi");
    document.getElementById("layar-login").classList.remove("sembunyi");
    siswaAktifNama = "";
    siswaAktifKelas = "";
}

// ===================================================
// LOGIKA FITUR UTAMA BARU: SECURITY BACKDOOR ADMIN
// ===================================================

// Fungsi memicu kotak validasi password admin
function aksesPanelAdmin() {
    // Memunculkan kotak isian pop-up prompt bawaan browser
    const inputPassword = prompt("Masukkan Kata Sandi Otoritas Admin OSIS:");

    // Validasi kecocokan nilai input teks
    if (inputPassword === PASSWORD_ADMIN_RAHASIA) {
        alert("Akses Diterima! Membuka Panel Monitoring.");
        
        // Sembunyikan layar login pemilih, tampilkan dashboard admin
        document.getElementById("layar-login").classList.add("sembunyi");
        document.getElementById("layar-voting").classList.add("sembunyi");
        document.getElementById("layar-admin").classList.remove("sembunyi");

        // Jalankan fungsi pengisian data ke dalam grafik dan tabel admin
        hitungDanUpdateGrafikAdmin();
        updateTabelAuditAdmin();
    } else if (inputPassword !== null) {
        // Jika salah isi dan tidak menekan tombol batalkan (cancel)
        alert("Akses Ditolak! Kata sandi salah.");
    }
}

// Fungsi menutup halaman monitor dan mengembalikan ke layar login biasa
function tutupPanelAdmin() {
    document.getElementById("layar-admin").classList.add("sembunyi");
    document.getElementById("layar-login").classList.remove("sembunyi");
}

// Fungsi memproses kalkulasi matematika persentase grafik suara paslon
function hitungDanUpdateGrafikAdmin() {
    let totalSuara = dataSuara.kandidat1 + dataSuara.kandidat2;
    
    document.getElementById("suara-01").innerHTML = dataSuara.kandidat1;
    document.getElementById("suara-02").innerHTML = dataSuara.kandidat2;

    let persen01 = totalSuara > 0 ? Math.round((dataSuara.kandidat1 / totalSuara) * 100) : 0;
    let persen02 = totalSuara > 0 ? Math.round((dataSuara.kandidat2 / totalSuara) * 100) : 0;

    const bar01 = document.getElementById("bar-01");
    bar01.style.width = persen01 + "%";
    bar01.innerHTML = persen01 + "%";

    const bar02 = document.getElementById("bar-02");
    bar02.style.width = persen02 + "%";
    bar02.innerHTML = persen02 + "%";
}

// Fungsi menyuntikkan data riwayat nama log pemilih ke dalam tabel HTML admin
function updateTabelAuditAdmin() {
    const tbody = document.getElementById("isiTabelAudit");
    tbody.innerHTML = ""; // Sterilkan baris lama

    // Melakukan perulangan isi objek logDaftarPemilih
    for (let namaSiswa in logDaftarPemilih) {
        const data = logDaftarPemilih[namaSiswa];
        
        const barisHTML = `
            <tr>
                <td><strong>${namaSiswa}</strong></td>
                <td>${data.kelas}</td>
                <td><span class="badge-success">${data.status}</span></td>
            </tr>
        `;
        tbody.innerHTML += barisHTML;
    }
}
