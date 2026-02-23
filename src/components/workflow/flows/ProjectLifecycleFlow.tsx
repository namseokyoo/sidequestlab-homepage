'use client';

import { type FC } from 'react';
import WorkflowCanvas from '../WorkflowCanvas';
import { getProjectLifecycleNodes, getProjectLifecycleEdges } from '../constants/flowData';

interface Props {
  locale: 'ko' | 'en';
}

const ProjectLifecycleFlow: FC<Props> = ({ locale }) => {
  const nodes = getProjectLifecycleNodes(locale);
  const edges = getProjectLifecycleEdges(locale);

  return <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />;
};

export default ProjectLifecycleFlow;
