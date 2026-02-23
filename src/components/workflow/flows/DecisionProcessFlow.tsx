'use client';

import { type FC } from 'react';
import WorkflowCanvas from '../WorkflowCanvas';
import { getDecisionProcessNodes, getDecisionProcessEdges } from '../constants/flowData';

interface Props {
  locale: 'ko' | 'en';
}

const DecisionProcessFlow: FC<Props> = ({ locale }) => {
  const nodes = getDecisionProcessNodes(locale);
  const edges = getDecisionProcessEdges(locale);

  return <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />;
};

export default DecisionProcessFlow;
