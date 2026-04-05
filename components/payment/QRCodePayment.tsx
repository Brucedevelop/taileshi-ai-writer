'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { CREDIT_PACKAGES } from '@/lib/billing/credits';

interface QRCodePaymentProps {
  onSuccess?: (credits: number) => void;
}

export function QRCodePayment({ onSuccess }: QRCodePaymentProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>(CREDIT_PACKAGES[0].id);
  const [payType, setPayType] = useState<'wxpay' | 'alipay'>('wxpay');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  const pollPaymentStatus = useCallback(async () => {
    if (!orderId) return;
    const response = await fetch(`/api/payment/status?orderId=${orderId}`);
    const data = await response.json() as { status: string; credits: number };
    if (data.status === 'paid') {
      setPaymentStatus('success');
      onSuccess?.(data.credits);
    }
  }, [orderId, onSuccess]);

  useEffect(() => {
    if (paymentStatus !== 'pending' || !orderId) return;
    const interval = setInterval(pollPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentStatus, orderId, pollPaymentStatus]);

  const handleCreatePayment = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: selectedPackage, payType }),
    });

    const data = await response.json() as { qrCodeUrl?: string; orderId?: string; error?: string };

    if (!response.ok) {
      setError(data.error ?? 'Payment creation failed');
      setLoading(false);
      return;
    }

    setQrCodeUrl(data.qrCodeUrl ?? null);
    setOrderId(data.orderId ?? null);
    setPaymentStatus('pending');
    setLoading(false);
  };

  const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage);

  if (paymentStatus === 'success') {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-500">Credits have been added to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Select Package</h3>
        <div className="grid grid-cols-2 gap-3">
          {CREDIT_PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPackage(p.id)}
              className={`p-3 border-2 rounded-lg text-left transition ${
                selectedPackage === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm">{p.name}</div>
              <div className="text-2xl font-bold text-blue-600">¥{p.price}</div>
              <div className="text-xs text-gray-500">{p.credits} credits</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Payment Method</h3>
        <div className="flex gap-3">
          {(['wxpay', 'alipay'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPayType(method)}
              className={`flex-1 py-2 border-2 rounded-lg text-sm font-medium transition ${
                payType === method ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              {method === 'wxpay' ? '💚 WeChat Pay' : '🔵 Alipay'}
            </button>
          ))}
        </div>
      </div>

      {!qrCodeUrl ? (
        <button
          onClick={handleCreatePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating payment...' : `Pay ¥${pkg?.price ?? 0}`}
        </button>
      ) : (
        <div className="text-center">
          <div className="inline-block p-4 bg-white border rounded-lg mb-3">
            <QRCode value={qrCodeUrl} size={200} />
          </div>
          <p className="text-sm text-gray-500">
            Scan with {payType === 'wxpay' ? 'WeChat' : 'Alipay'} to pay ¥{pkg?.price}
          </p>
          <p className="text-xs text-gray-400 mt-1 animate-pulse">Waiting for payment...</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
