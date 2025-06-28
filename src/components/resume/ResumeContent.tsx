import type { FC } from 'react';
import type { ResumeData, ResumeStyle } from '../../types/resume';
import { StandardStyle } from './styles/StandardStyle';
import { TraditionalStyle } from './styles/TraditionalStyle';
import { NeoBrutalistStyle } from './styles/NeoBrutalistStyle';
import { NamasteStyle } from './styles/NamasteStyle';
import { ZineStyle } from './styles/ZineStyle';
import { EnterpriseStyle } from './styles/EnterpriseStyle';

interface ResumeContentProps {
  data: ResumeData;
  style: ResumeStyle;
}

export const ResumeContent: FC<ResumeContentProps> = ({ data, style }) => {
  switch (style) {
    case 'traditional':
      return <TraditionalStyle data={data} />;
    case 'neo-brutalist':
      return <NeoBrutalistStyle data={data} />;
    case 'namaste':
      return <NamasteStyle data={data} />;
    case 'zine':
      return <ZineStyle data={data} />;
    case 'enterprise':
      return <EnterpriseStyle data={data} />;
    case 'standard':
    default:
      return <StandardStyle data={data} />;
  }
};