import type { Model } from '@shared/data/types/model'
import { documentExts, imageExts, textExts } from '@shared/utils/file/fileExtensions'
import { useMemo } from 'react'

export interface ComposerFileCapabilities {
  canAddImageFile: boolean
  canAddTextFile: boolean
  supportedExts: string[]
}

interface ComposerFileCapabilitiesArgs {
  /** Mentioned models — vision/image support requires ALL of them to qualify. */
  models: Model[]
  /** Model used when no models are mentioned (the assistant/agent model). */
  fallbackModel: Model | undefined
}

/**
 * Derives which file kinds the composer accepts from the active model(s).
 *
 * Agent passes a single resolved `model`; chat passes its mentioned `models` plus a
 * `fallbackModel` (the assistant model used when nothing is mentioned).
 *
 * Note: image upload is now enabled for ALL models — we don't gate on capability
 * labels because third-party API proxies may serve models without correct capability
 * tags. The API endpoint itself is responsible for rejecting unsupported inputs.
 */
export function useComposerFileCapabilities(model: Model | undefined): ComposerFileCapabilities
export function useComposerFileCapabilities(args: ComposerFileCapabilitiesArgs): ComposerFileCapabilities
export function useComposerFileCapabilities(
  _: Model | undefined | ComposerFileCapabilitiesArgs
): ComposerFileCapabilities {
  void _

  // Always allow image + document + text uploads for all models.
  // Capability-based gating was unreliable with third-party API proxies.
  const canAddImageFile = true
  const canAddTextFile = true

  const supportedExts = useMemo(() => {
    return [...imageExts, ...documentExts, ...textExts]
  }, [])

  return { canAddImageFile, canAddTextFile, supportedExts }
}
