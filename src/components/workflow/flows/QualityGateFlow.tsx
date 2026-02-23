'use client';

import { type FC } from 'react';
import WorkflowCanvas from '../WorkflowCanvas';
import { getQualityGateNodes, getQualityGateEdges } from '../constants/flowData';

interface Props {
  locale: 'ko' | 'en';
}

const QualityGateFlow: FC<Props> = ({ locale }) => {
  const nodes = getQualityGateNodes(locale);
  const edges = getQualityGateEdges(locale);

  return <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />;
};

export default QualityGateFlow;
