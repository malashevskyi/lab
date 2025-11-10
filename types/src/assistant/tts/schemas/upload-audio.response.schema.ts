import z from 'zod';

export const uploadAudioResponseSchema = z.object({
  audioUrl: z.string(),
  storagePath: z.string(),
  expiresAt: z.string(),
});

export type UploadAudioResponse = z.infer<typeof uploadAudioResponseSchema>;
