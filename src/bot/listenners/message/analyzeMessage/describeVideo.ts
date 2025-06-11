import { Transcript } from 'assemblyai';
import { extractVideoFramesFromURL } from './extractFrames';

import { aiChat, groq } from '../../../../groq';
import { ChatCompletionContentPartImage } from 'groq-sdk/resources/chat/completions';

// В документации было написано, что количество изображений неограничено,
// но приходит "400 - Too many images provided. This model supports up to 5 images"
const FRAMES_PER_REQUEST = 5;

export async function describeVideo(
  url: string,
  duration: number,
  transcription: Transcript
) {
  const { frames, fps } = await extractVideoFramesFromURL(url, duration);

  const framesDescriptionsPromises: Promise<string | null>[] = [];

  for (let i = 0; i < frames.length; i += FRAMES_PER_REQUEST) {
    const curFrames = frames.slice(i, i + FRAMES_PER_REQUEST);
    const curTranscriptionText = getTranscriptionTextForTimeInteval(
      transcription,
      i / fps,
      (i + FRAMES_PER_REQUEST) / fps
    );

    const prompt = `
    Ты — помощник, который подробно и понятно описывает происходящее в видео, чтобы даже тот, кто не видел видео, мог легко представить себе ситуацию.
    
    - Видео длится ${Math.ceil(frames.length / fps)} секунд и разбито на ${
      frames.length
    } кадров, по ${fps} кадров на каждую секунду, с номерами от 1 до ${
      frames.length
    }.
    - Сейчас нужно описать отрывок видео длиной ${
      curFrames.length
    } секунд — кадры с ${i + 1} по ${i + curFrames.length + 1}.
    - В описании следует сосредоточиться только на кадрах с  ${i + 1} по ${
      i + curFrames.length + 1
    }, без упоминания остальных.
    ${
      curTranscriptionText.length
        ? `- В описании обязательно учитывай произнесенные слова, распознанные на этих кадрах: «${curTranscriptionText}»`
        : ''
    }.
    - Опиши происходящее в группе кадров максимально понятно и логично, чтобы создавалась цельная картина.
    - Описание группы кадров должно быть не больше двух коротких предложений.
    - В описании не используй переносы строк.
    - В ответе не должно быть ничего, кроме самого описания отрывка видео.`.trim();

    const images = curFrames.map(
      (buffer) =>
        ({
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${buffer.toString('base64')}`,
          },
        } as ChatCompletionContentPartImage)
    );

    framesDescriptionsPromises.push(
      aiChat({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: prompt }, ...images],
          },
        ],
        temperature: 0.2,
      }).then((response) => response.choices[0].message.content)
    );
  }

  const description = (await Promise.all(framesDescriptionsPromises))
    .filter(Boolean)
    .join(' ');

  console.log(
    '[bot] described video { duration: ' +
      duration +
      's, frames: ' +
      frames.length +
      ' }'
  );

  return description;
}

export async function describeAnimation(url: string) {
  // NOT IMPLEMENTED
  return undefined;
}

function getTranscriptionTextForTimeInteval(
  transcription: Transcript,
  start: number,
  end: number
) {
  if (!transcription.words) return '';

  const startMs = start * 1000;
  const endMs = end * 1000;

  const result: string[] = [];

  let i = transcription.words.findIndex((word) => word.start >= startMs);

  while (transcription.words[i] && transcription.words[i].start < endMs) {
    result.push(transcription.words[i].text);
    i++;
  }

  return result.join(' ');
}
