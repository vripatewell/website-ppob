
// src/app/api/create-panel/route.js
import { NextResponse } from 'next/server';
import {
  EGG_ID_V3,
  NEST_ID_V3,
  LOCATION_ID_V3,
  DOMAIN_V3,
  API_KEY_V3, // API Key ptla (Application API Key)
} from './src/lib/constants';

export async function POST(req) {
  try {
    const { orderId, username, password } = await req.json();

    if (!orderId || !username || !password) {
      return NextResponse.json({ message: 'Data yang diperlukan tidak lengkap (orderId, username, password).' }, { status: 400 });
    }

    // --- LOGIC VALIDASI ORDER DAN BUAT PANEL ---
    // 1. Validasi Order: Di PRODUKSI, pastikan `orderId` ini memang ada di database Anda
    //    dan status pembayarannya sudah 'confirmed' atau 'completed'.
    //    Ini adalah langkah krusial untuk mencegah pembuatan panel tanpa pembayaran sah.
    //    Contoh: const order = await db.getOrder(orderId);
    //    if (!order || order.status !== 'confirmed') { ... return error ... }

    console.log(`Simulating panel creation for orderId: ${orderId}, username: ${username}`);

    // Ini adalah SIMULASI PANGGILAN API PANEL (misalnya Pterodactyl API).
    // DI PRODUKSI, GANTI DENGAN KODE NYATA UNTUK MEMANGGIL API PANEL ANDA.
    // Contoh Pterodactyl API:
    // Langkah 1: Buat user di Pterodactyl (jika belum ada)
    // const userPayload = {
    //   email: `${username}@${DOMAIN_V3.replace('https://', '').split('.')[0]}.com`,
    //   username: username,
    //   first_name: username,
    //   last_name: 'PanelUser',
    //   password: password,
    //   external_id: `order-${orderId}`,
    // };
    // const createUserResponse = await fetch(`${DOMAIN_V3}/api/application/users`, {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${API_KEY_V3}`, // ptla API Key dari environment variables
    //   },
    //   body: JSON.stringify(userPayload),
    // });
    // if (!createUserResponse.ok) {
    //   const errorData = await createUserResponse.json();
    //   console.error('Pterodactyl Create User Error:', errorData);
    //   return NextResponse.json({ message: 'Gagal membuat user panel di Pterodactyl.', details: errorData }, { status: 500 });
    // }
    // const userData = await createUserResponse.json();
    // const userId = userData.data.id;

    // Langkah 2: Buat server untuk user yang baru dibuat
    // const serverPayload = {
    //   name: `${username}-server`,
    //   user: userId,
    //   egg: parseInt(EGG_ID_V3),
    //   nest: parseInt(NEST_ID_V3),
    //   location: parseInt(LOCATION_ID_V3),
    //   limits: { memory: 1024, swap: 0, disk: 5120, io: 500, cpu: 100 },
    //   startup: `java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar`,
    //   environment: { SERVER_JARFILE: "server.jar" },
    //   start_on_completion: true,
    //   docker_image: "ghcr.io/pterodactyl/yolks:java_17",
    //   external_id: `server-${orderId}`,
    // };
    // const createServerResponse = await fetch(`${DOMAIN_V3}/api/application/servers`, {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${API_KEY_V3}`,
    //   },
    //   body: JSON.stringify(serverPayload),
    // });
    // if (!createServerResponse.ok) {
    //   const errorData = await createServerResponse.json();
    //   console.error('Pterodactyl Create Server Error:', errorData);
    //   return NextResponse.json({ message: 'Gagal membuat server panel di Pterodactyl.', details: errorData }, { status: 500 });
    // }
    // const serverData = await createServerResponse.json();
    // const serverId = serverData.data.id;

    // Setelah panel berhasil dibuat, update status order di database Anda menjadi 'completed'
    // dan simpan detail panel yang dibuat (userId, serverId, panelLink, dll.).

    const panelLinkToReturn = DOMAIN_V3; // Ini harus link ke panel Anda yang sebenarnya

    return NextResponse.json({
      message: 'Panel berhasil dibuat dan data telah disimpan.',
      panelLink: panelLinkToReturn,
      username: username,
      password: password,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/create-panel:', error);
    return NextResponse.json({ message: 'Internal server error saat membuat panel.' }, { status: 500 });
  }
}

