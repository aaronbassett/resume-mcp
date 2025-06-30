/**
 * Certificate Block Wrapper for block-party integration
 */

import React from 'react';
import { CertificateBlock } from './certificate';
import { BlockType } from '../../config/blockEditorConfig';
import { CertificateBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface CertificateBlockWrapperProps {
  data: CertificateBlockData;
  onUpdate: (data: CertificateBlockData) => void;
  isEditing?: boolean;
}

export function CertificateBlockWrapper({ data, onUpdate, isEditing = false }: CertificateBlockWrapperProps) {
  return (
    <CertificateBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const certificateBlockConfig: BlockConfig<CertificateBlockData> = createBlockConfig(
  BlockType.CERTIFICATE,
  {
    displayName: 'Certifications',
    component: CertificateBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.CERTIFICATE],
    category: 'achievements',
    description: 'Professional certifications and licenses',
    icon: 'Award',
    supportsMultiple: true,
  }
);