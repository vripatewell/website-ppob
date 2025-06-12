
// src/app/api/payment-status/route.js
import { NextResponse } from 'next/server';
import { API_ORDER_KUOTA } from './src/lib/constants';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID diperlukan.' }, { status: 400 });
  }

  try {
    // --- LOGIC CEK STATUS PEMBAYARAN DENGAN ORDER KUOTA ---
    // Di sini Anda akan memanggil API OrderKuota untuk mendapatkan status pembayaran dari `orderId` ini.

    // Ini adalah SIMULASI PANGGILAN API OrderKuota untuk status.
    // DI PRODUKSI, GANTI DENGAN KODE NYATA UNTUK MEMANGGIL API STATUS ORDERKUOTA.
    // Contoh:
    // const orderKuotaStatusResponse = await fetch(`https://api.orderkuota.com/check-status?orderId=${orderId}`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${API_ORDER_KUOTA}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // if (!orderKuotaStatusResponse.ok) {
    //   const errorData = await orderKuotaStatusResponse.json();
    //   console.error('OrderKuota Status API Error:', errorData);
    //   return NextResponse.json({ message: 'Gagal mengecek status pembayaran.', details: errorData }, { status: 500 });
    // }
    // const orderKuotaStatusData = await orderKuotaStatusResponse.json();
    // const paymentStatusFromApi = orderKuotaStatusData.status; // Asumsi OrderKuota mengembalikan 'confirmed', 'pending', 'failed', 'expired'

    // Untuk tujuan DEMO:
    // Simulasi status pembayaran yang akan berubah.
    // Dalam aplikasi nyata, ini akan dibaca dari database Anda
    // atau langsung dari respons OrderKuota API.
    const paymentStatus = Math.random() > 0.7 ? 'confirmed' : 'pending'; // 30% kemungkinan langsung confirmed untuk demo

    return NextResponse.json({ status: paymentStatus }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/payment-status:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

