import md5 from 'md5';

export interface PaymentParams {
  orderId: string;
  amount: number;
  subject: string;
  payType: 'wxpay' | 'alipay';
  notifyUrl: string;
  returnUrl: string;
}

export interface PaymentResult {
  success: boolean;
  qrCodeUrl?: string;
  payUrl?: string;
  error?: string;
}

export interface CallbackParams {
  trade_order_id: string;
  total_fee: string;
  transaction_id: string;
  time_end: string;
  trade_status: string;
  nonce_str: string;
  sign: string;
  [key: string]: string;
}

const HUPIJIAO_API = 'https://api.xunhupay.com/payment/do.html';

export function generateSign(params: Record<string, string>, appSecret: string): string {
  // Sort params alphabetically, join with &, append appSecret, MD5
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== '')
    .sort();

  const signStr = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + appSecret;

  return md5(signStr).toLowerCase();
}

export async function createPayment(params: PaymentParams): Promise<PaymentResult> {
  const appId = process.env.HUPIJIAO_APP_ID!;
  const appSecret = process.env.HUPIJIAO_APP_SECRET!;

  const requestParams: Record<string, string> = {
    appid: appId,
    out_trade_no: params.orderId,
    total_fee: params.amount.toFixed(2),
    title: params.subject,
    time: Math.floor(Date.now() / 1000).toString(),
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    type: params.payType,
    nonce_str: Math.random().toString(36).substring(2, 18),
  };

  requestParams.sign = generateSign(requestParams, appSecret);

  const response = await fetch(HUPIJIAO_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(requestParams),
  });

  const data = await response.json() as {
    errcode: number;
    errmsg?: string;
    url?: string;
    pay_url?: string;
  };

  if (data.errcode !== 0) {
    return { success: false, error: data.errmsg || 'Payment creation failed' };
  }

  return {
    success: true,
    qrCodeUrl: data.url,
    payUrl: data.pay_url,
  };
}

export function verifyCallback(params: CallbackParams, appSecret: string): boolean {
  const { sign, ...rest } = params;
  const computedSign = generateSign(rest as Record<string, string>, appSecret);
  return computedSign === sign.toLowerCase();
}
