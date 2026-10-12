import type { CharacterDraft } from '../../types/game'

export interface StepProps {
  draft: CharacterDraft
  update: (patch: Partial<CharacterDraft>) => void
}
