declare module '*kaliReply.js' {
  export function kaliReply(
    text: string,
    options?: { profile?: unknown; locale?: string },
  ): string;
}
