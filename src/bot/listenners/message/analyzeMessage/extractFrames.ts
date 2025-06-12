import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';
import { config } from '../../../../config';

const FFMPEG_COMMAND = config.env === 'prod' ? 'ffmpeg' : ffmpegPath;

export async function extractVideoFramesFromURL(
  videoUrl: string,
  duration: number
): Promise<{ frames: Buffer[]; fps: number }> {
  let fps = 0.1;
  if (duration <= 10) fps = 2;
  else if (duration <= 60) fps = 1;
  else if (duration <= 120) fps = 0.5;
  else if (duration <= 300) fps = 0.25;

  const frames = splitPngFrames(
    await ffmpegExtractFramesToBuffer(videoUrl, fps)
  );

  return { frames, fps };
}

function ffmpegExtractFramesToBuffer(url: string, fps: number) {
  const args = [
    '-i',
    url,
    '-vf',
    `fps=${fps},scale=640:-1`, // сжатие до 640px в ширину (высота:auto)
    '-f',
    'image2pipe',
    '-c:v',
    'png',
    '-compression_level',
    '6',
    '-',
  ];

  const ffmpeg = spawn(FFMPEG_COMMAND, args, {
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  let bufferChunks: Uint8Array[] = [];
  ffmpeg.stdout.on('data', (chunk) => {
    bufferChunks.push(chunk);
  });

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const fullBuffer = Buffer.concat(bufferChunks);
        resolve(fullBuffer);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

const PNG_HEADER = Buffer.from('\x89PNG\r\n\x1A\n', 'binary');

function splitPngFrames(buffer: Buffer) {
  const frames = [];
  let offset = 0;

  while (offset < buffer.length) {
    const nextHeaderPos = buffer.indexOf(PNG_HEADER, offset + 1);
    const frameEnd = nextHeaderPos !== -1 ? nextHeaderPos : buffer.length;
    frames.push(buffer.subarray(offset, frameEnd));
    offset = frameEnd;
  }

  return frames;
}
