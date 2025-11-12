declare module 'pdf-parse' {
  interface PDFInfo {
    [key: string]: any;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: any
  ): Promise<PDFData>;

  export = pdfParse;
}
