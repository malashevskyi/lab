import { z } from 'zod';

export const updateAudioRecordSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty.'),
  dictionaryEntryId: z.uuid(),
});

export type UpdateAudioRecordType = z.infer<typeof updateAudioRecordSchema>;
