'use client';

import { type FC } from 'react';
import WorkflowCanvas from '../WorkflowCanvas';
import { getTechReviewNodes, getTechReviewEdges } from '../constants/flowData';

interface Props {
  locale: 'ko' | 'en';
}

const TechReviewFlow: FC<Props> = ({ locale }) => {
  const nodes = getTechReviewNodes(locale);
  const edges = getTechReviewEdges(locale);

  return <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />;
};

export default TechReviewFlow;
