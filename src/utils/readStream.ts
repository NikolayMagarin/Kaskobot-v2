import { ChatCompletionChunk } from 'groq-sdk/resources/chat/completions';

export async function readStream(
  readableStream: ReadableStream,
  onData: (data: ChatCompletionChunk) => void
) {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder();

  let done, value;
  while (!done) {
    ({ value, done } = await reader.read());
    if (done) {
      return;
    }

    const strs = decoder
      .decode(value)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const str of strs) {
      onData(JSON.parse(str));
    }
  }
}
