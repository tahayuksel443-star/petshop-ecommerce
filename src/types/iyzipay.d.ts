declare module 'iyzipay' {
  interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  class Iyzipay {
    constructor(options: IyzipayOptions);
    threedsInitialize: {
      create(request: any, callback: (err: any, result: any) => void): void;
    };
    threedsPayment: {
      create(request: any, callback: (err: any, result: any) => void): void;
    };
    payment: {
      retrieve(request: any, callback: (err: any, result: any) => void): void;
      create(request: any, callback: (err: any, result: any) => void): void;
    };
  }

  export = Iyzipay;
}
