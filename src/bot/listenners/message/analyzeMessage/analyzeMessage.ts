import { ChatHistoryMessageContent } from '../../../../db/documents';
import { tg } from '../../../telegram';
import { MessageContent } from '../messageContent';
import { describeAnimation, describeVideo } from './describeVideo';
import { transcribe } from './transcibeAudio';

export async function getAnalyzedMessageContent(
  ctxContent: MessageContent
): Promise<ChatHistoryMessageContent> {
  switch (ctxContent.type) {
    case 'text':
      return { type: 'text', text: ctxContent.text! };

    case 'photo':
      return {
        type: 'photo',
        fileId: ctxContent.photo!.file_id,
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
      };

    case 'video':
      const videoUrl = (await tg.getFileLink(ctxContent.video!.file_id)).href;
      const videoTranscription = await transcribe(videoUrl);
      const videoDescription = await describeVideo(
        videoUrl,
        ctxContent.video!.duration,
        videoTranscription
      );
      return {
        type: 'video',
        fileId: ctxContent.video!.file_id,
        duration: ctxContent.video!.duration,
        transcription: videoTranscription.text || '',
        description: videoDescription,
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
        ...(ctxContent.video?.file_name
          ? { fileName: ctxContent.video.file_name }
          : {}),
        ...(ctxContent.video?.thumbnail
          ? { thumbnailFileId: ctxContent.video.thumbnail.file_id }
          : {}),
      };

    case 'audio':
      const audioUrl = (await tg.getFileLink(ctxContent.audio!.file_id)).href;
      const audioTranscription = await transcribe(audioUrl);
      return {
        type: 'audio',
        fileId: '',
        duration: ctxContent.audio!.duration,
        transcription: audioTranscription.text || '',
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
        ...(ctxContent.audio?.file_name
          ? { fileName: ctxContent.audio.file_name }
          : {}),
      };

    case 'document':
      return {
        type: 'document',
        fileId: ctxContent.document!.file_id,
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
        ...(ctxContent.document!.file_name
          ? { fileName: ctxContent.document!.file_name }
          : {}),
        ...(ctxContent.document!.file_size
          ? { fileSize: ctxContent.document!.file_size }
          : {}),
      };

    case 'voice':
      const voiceUrl = (await tg.getFileLink(ctxContent.voice!.file_id)).href;
      const voiceTranscription = await transcribe(voiceUrl);
      return {
        type: 'voice',
        fileId: ctxContent.voice!.file_id,
        duration: ctxContent.voice!.duration,
        transcription: voiceTranscription.text || '',
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
      };

    case 'videoNote':
      const videoNoteUrl = (await tg.getFileLink(ctxContent.videoNote!.file_id))
        .href;
      const videoNoteTranscription = await transcribe(videoNoteUrl);
      const videoNoteDescription = await describeVideo(
        videoNoteUrl,
        ctxContent.videoNote!.duration,
        videoNoteTranscription
      );
      return {
        type: 'videoNote',
        fileId: ctxContent.videoNote!.file_id,
        duration: ctxContent.videoNote!.duration,
        description: videoNoteDescription,
        transcription: videoNoteTranscription.text || '',
        ...(ctxContent.videoNote?.thumbnail
          ? { thumbnailFileId: ctxContent.videoNote.thumbnail.file_id }
          : {}),
      };

    case 'sticker':
      const stickerUrl = (await tg.getFileLink(ctxContent.sticker!.file_id))
        .href;
      const isAnimated =
        ctxContent.sticker!.is_animated || ctxContent.sticker!.is_video;
      let stickerDescription: string | undefined;
      if (isAnimated) {
        stickerDescription = await describeAnimation(stickerUrl);
      }
      return {
        type: 'sticker',
        fileId: ctxContent.sticker!.file_id,
        animated: isAnimated,
        ...(stickerDescription ? { description: stickerDescription } : {}),
        ...(ctxContent.sticker?.thumbnail && isAnimated
          ? { thumbnailFileId: ctxContent.sticker.thumbnail.file_id }
          : {}),
      };

    case 'animation':
      const animationUrl = (await tg.getFileLink(ctxContent.animation!.file_id))
        .href;
      const animationDescription = await describeAnimation(animationUrl);
      return {
        type: 'animation',
        fileId: ctxContent.animation!.file_id,
        description: animationDescription,
        duration: ctxContent.animation!.duration,
        ...(ctxContent.animation?.thumbnail
          ? { thumbnailFileId: ctxContent.animation.thumbnail.file_id }
          : {}),
        ...(ctxContent.text ? { caption: ctxContent.text } : {}),
        ...(ctxContent.animation?.file_name
          ? { fileName: ctxContent.animation.file_name }
          : {}),
      };

    default:
      throw new Error('Cannot analyze message ' + ctxContent);
  }
}
