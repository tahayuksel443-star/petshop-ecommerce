import Iyzipay from 'iyzipay';

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
});

export interface IyzicoPaymentRequest {
  price: string;
  paidPrice: string;
  currency: string;
  installment: string;
  basketId: string;
  paymentChannel: string;
  paymentGroup: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    lastLoginDate?: string;
    registrationDate?: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

export async function createThreeDSPayment(request: IyzicoPaymentRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.threedsInitialize.create(request, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function completeThreeDSPayment(data: {
  locale: string;
  conversationId: string;
  paymentId: string;
  conversationData: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.threedsPayment.create(data, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function retrievePayment(paymentId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.payment.retrieve(
      {
        locale: 'tr',
        conversationId: paymentId,
        paymentId,
      },
      (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}

export default iyzipay;
