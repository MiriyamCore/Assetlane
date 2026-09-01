import type { Product } from '@prisma/client';

export type ProductDownloadFile = {
  id: string;
  fileName: string;
  sortOrder: number;
};

type ListedProductFile = {
  id: string;
  fileName: string;
  sortOrder: number;
};

type StoredProductFile = ListedProductFile & {
  filePath: string;
};

type ProductWithListedFiles = Pick<Product, 'id' | 'digitalFilePath' | 'digitalFileName'> & {
  files?: ListedProductFile[];
};

type ProductWithStoredFiles = Pick<Product, 'digitalFilePath' | 'digitalFileName'> & {
  files?: StoredProductFile[];
};

export const listProductDownloadFiles = (product: ProductWithListedFiles) => {
  const files: ProductDownloadFile[] = [];

  if (product.digitalFilePath && product.digitalFileName) {
    files.push({
      id: 'primary',
      fileName: product.digitalFileName,
      sortOrder: -1,
    });
  }

  for (const file of product.files || []) {
    files.push({
      id: file.id,
      fileName: file.fileName,
      sortOrder: file.sortOrder,
    });
  }

  return files.sort((left, right) => left.sortOrder - right.sortOrder);
};

export const resolveProductFilePath = (product: ProductWithStoredFiles, fileId: string) => {
  if (fileId === 'primary') {
    if (!product.digitalFilePath || !product.digitalFileName) {
      return null;
    }

    return {
      filePath: product.digitalFilePath,
      fileName: product.digitalFileName,
    };
  }

  const match = (product.files || []).find((file) => file.id === fileId);
  if (!match) {
    return null;
  }

  return {
    filePath: match.filePath,
    fileName: match.fileName,
  };
};
