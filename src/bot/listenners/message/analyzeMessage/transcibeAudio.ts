import { AssemblyAI } from 'assemblyai';
import { config } from '../../../../config';

export const client = new AssemblyAI({
  apiKey: config.assemblyAiApiKey,
});

export async function transcribe(url: string) {
  const result = await client.transcripts.transcribe({
    audio_url: url,
    language_code: 'ru',
  });

  console.log(
    '[bot] transcribed audio { duration: ' + result.audio_duration + 's }'
  );

  return result;
}
