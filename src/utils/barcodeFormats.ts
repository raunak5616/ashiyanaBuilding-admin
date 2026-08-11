import { BarcodeFormat } from '@zxing/library';

export const SUPPORTED_BARCODE_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
];

export const getBarcodeFormatName = (format: BarcodeFormat): string => {
  switch (format) {
    case BarcodeFormat.EAN_13:
      return 'EAN-13';
    case BarcodeFormat.EAN_8:
      return 'EAN-8';
    case BarcodeFormat.UPC_A:
      return 'UPC-A';
    case BarcodeFormat.UPC_E:
      return 'UPC-E';
    case BarcodeFormat.CODE_128:
      return 'Code 128';
    case BarcodeFormat.CODE_39:
      return 'Code 39';
    default:
      return 'Unknown';
  }
};
