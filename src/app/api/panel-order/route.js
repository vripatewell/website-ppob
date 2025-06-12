
// src/app/api/panel-order/route.js
import { NextResponse } from 'next/server';
import {
  MERCHANT_ID_ORDER_KUOTA,
  API_ORDER_KUOTA,
  QRIS_ORDER_KUOTA, // Untuk demo, tapi idealnya QRIS dari respons API OrderKuota
} from '../../../lib/constants';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username dan password diperlukan.' }, { status: 400 });
    }

    // --- LOGIC INTEGRASI ORDER KUOTA ---
    // Di sini Anda akan memanggil API OrderKuota untuk membuat transaksi
    // Contoh payload ke OrderKuota (sesuaikan dengan dokumentasi OrderKuota)
    const uniqueOrderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderKuotaPayload = {
      merchantId: MERCHANT_ID_ORDER_KUOTA,
      orderId: uniqueOrderId,
      amount: 10000, // Contoh: Harga panel (sesuaikan dengan harga asli produk Anda)
      description: `Pembelian panel untuk username: ${username}`,
      // callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/orderkuota-webhook`, // URL webhook Anda jika ada
    };

    // Ini adalah SIMULASI PANGGILAN API OrderKuota.
    // DI PRODUKSI, GANTI DENGAN KODE NYATA UNTUK MEMANGGIL API ORDERKUOTA.
    // Contoh:
    // const orderKuotaResponse = await fetch('https://api.orderkuota.com/create-payment', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${API_ORDER_KUOTA}`, // Gunakan API_ORDER_KUOTA dari environment variables
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(orderKuotaPayload),
    // });
    // if (!orderKuotaResponse.ok) {
    //   const errorData = await orderKuotaResponse.json();
    //   console.error('OrderKuota API Error:', errorData);
    //   return NextResponse.json({ message: 'Gagal memproses pembayaran dengan OrderKuota.', details: errorData }, { status: 500 });
    // }
    // const orderKuotaData = await orderKuotaResponse.json();
    // const qrisUrl = orderKuotaData.qrisUrl; // Asumsi OrderKuota mengembalikan URL QRIS
    // const realOrderId = orderKuotaData.orderId; // Asumsi OrderKuota mengembalikan Order ID

    // Untuk demo, kita akan menggunakan QRIS statis dan Order ID dummy
    const qrisUrlToReturn = QRIS_ORDER_KUOTA;
    const orderIdToReturn = uniqueOrderId;

    // Di sini Anda juga idealnya akan menyimpan informasi order ke database Anda sendiri
    // (misalnya: orderId, username, password, status: 'pending', timestamp, dll.)
    // Ini penting untuk pelacakan dan konfirmasi pembayaran di sisi server.

    return NextResponse.json({
      message: 'Order berhasil dibuat. Silakan lakukan pembayaran.',
      qrisUrl: qrisUrlToReturn,
      orderId: orderIdToReturn,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/panel-order:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

