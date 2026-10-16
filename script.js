// ===================================================
// KONFIGURASI KONEKSI DATABASE ONLINE GOOGLE FIREBASE
// ===================================================
const firebaseConfig = {
    // Tempelkan URL Realtime Database yang kamu dapat dari Firebase Console di bawah ini
    databaseURL: "PASTE_URL_DATABASE_FIREBASE_KAMU_DISINI"
};

// Inisialisasi Firebase aplikasi
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Variabel Kontrol Lokal Aplikasi
let siswaAktifNama = "";
let siswaAktifKelas = "";
const PASSWORD_ADMIN_RAHASIA = "adminrpl123"; 

// ===================================================
// LOGIKA SISI PEMILIH (CLIENT VOTE)
// ===================================================

function prosesLogin(event) {
    event.preventDefault();
    const namaInput = document.getElementById("input-nama").value.trim();
    const kelasInput = document.getElementById("input-kelas").value;

    // CEK DOUBLE VOTE SECARA REAL-TIME DARI INTERNET SERVER
    // Membaca folder database 'logDaftarPemilih' di internet secara spesifik berdasarkan nama siswa
    database.ref('logDaftarPemilih/' + namaInput).once('value', function(snapshot) {
        if (snapshot.exists()) {
            alert("Sistem Menolak! Atas nama " + namaInput + " terdeteksi sudah pernah melakukan voting di HP/perangkat lain.");
        } else {
            // Jika nama belum ada di server internet, izinkan masuk bilik suara
            siswaAktifNama = namaInput;
            siswaAktifKelas = kelasInput;

            document.getElementById("user-aktif").innerHTML = siswaAktifNama;
            document.getElementById("kelas-aktif").innerHTML = siswaAktifKelas;

            document.getElementById("layar-login").classList.add("sembunyi");
            document.getElementById("layar-voting").classList.remove("sembunyi");
        }
    });
}

function kirimSuara(idKandidat) {
    // Kunci tombol agar tidak di-klik ganda saat proses pengiriman internet sedang berjalan
    document.getElementById("btn-01").disabled = true;
    document.getElementById("btn-02").disabled = true;

    // 1. Kirim data log audit pemilih ke database Firebase internet
    let dataPemilih Baru = {};
    dataPemilihBaru['logDaftarPemilih/' + siswaAktifNama] = {
        kelas: siswaAktifKelas,
        status: "Sudah Memilih"
    };
    database.ref().update(dataPemilihBaru);

    // 2. Tambah nilai perolehan suara paslon di server internet menggunakan transaksi atomik (anti tabrakan data)
    database.ref('dataSuara/' + idKandidat).transaction(function(suaraSekarang) {
        return (suaraSekarang || 0) + 1;
    }, function(error, committed, snapshot) {
        if (committed) {
            alert("Suara dari " + siswaAktifNama + " (" + siswaAktifKelas + ") BERHASIL dikirim secara online!");
        } else {
            alert("Terjadi gangguan koneksi internet, silakan coba lagi.");
        }
        
        // Kembalikan tombol ke keadaan normal dan riset ke halaman login
        document.getElementById("btn-01").disabled = false;
        document.getElementById("btn-02").disabled = false;
        risetUlangFormKeAwal();
    });
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
// LOGIKA SISI PANEL MONITORING ADMIN (REAL-TIME ONLINE)
// ===================================================

function aksesPanelAdmin() {
    const inputPassword = prompt("Masukkan Kata Sandi Otoritas Admin OSIS:");

    if (inputPassword === PASSWORD_ADMIN_RAHASIA) {
        alert("Akses Diterima! Membuka Dashboard sinkronisasi real-time.");
        
        document.getElementById("layar-login").classList.add("sembunyi");
        document.getElementById("layar-voting").classList.add("sembunyi");
        document.getElementById("layar-admin").classList.remove("sembunyi");

        // AKTIFKAN FITUR MENDENGARKAN (LISTEN) DATA SECARA LIVE DARI INTERNET
        // Fungsi .on() akan berjalan otomatis setiap kali ada perubahan angka di HP siswa
        database.ref().on('value', function(snapshot) {
            const semuaData = snapshot.val() || {};
            
            // Ambil data suara paslon dari server internet
            const dataSuaraServer = semuaData.dataSuara || { kandidat1: 0, kandidat2: 0 };
            const logPemilihServer = semuaData.logDaftarPemilih || {};

            // Render grafik batang admin
            renderGrafikLive(dataSuaraServer);
            
            // Render baris tabel audit admin
            renderTabelLive(logPemilihServer);
        });

    } else if (inputPassword !== null) {
        alert("Akses Ditolak! Kata sandi salah.");
    }
}

function tutupPanelAdmin() {
    // Matikan fitur pemantauan live agar menghemat kuota internet laptop saat keluar panel admin
    database.ref().off();
    document.getElementById("layar-admin").classList.add("sembunyi");
    document.getElementById("layar-login").classList.remove("sembunyi");
}

function renderGrafikLive(dataSuara) {
    let vote01 = dataSuara.kandidat1 || 0;
    let vote02 = dataSuara.kandidat2 || 0;
    let totalSuara = vote01 + vote02;
    
    document.getElementById("suara-01").innerHTML = vote01;
    document.getElementById("suara-02").innerHTML = vote02;

    let persen01 = totalSuara > 0 ? Math.round((vote01 / totalSuara) * 100) : 0;
    let persen02 = totalSuara > 0 ? Math.round((vote02 / totalSuara) * 100) : 0;

    const bar01 = document.getElementById("bar-01");
    bar01.style.width = persen01 + "%";
    bar01.innerHTML = persen01 + "%";

    const bar02 = document.getElementById("bar-02");
    bar02.style.width = persen02 + "%";
    bar02.innerHTML = persen02 + "%";
}

function renderTabelLive(logDaftarPemilih) {
    const tbody = document.getElementById("isiTabelAudit");
    tbody.innerHTML = ""; 

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
