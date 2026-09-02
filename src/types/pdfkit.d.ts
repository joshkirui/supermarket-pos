declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  class PDFDocument extends EventEmitter {
    x: number;
    y: number;
    constructor(options?: any);
    pipe(dest: any): this;
    addPage(options?: any): this;
    fontSize(size: number): this;
    font(name: string): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;
    text(text: string, options?: any): this;
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    end(): this;
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export default PDFDocument;
}
