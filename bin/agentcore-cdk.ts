#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AgentcoreCdkStack } from '../lib/agentcore-cdk-stack';

const app = new cdk.App();
new AgentcoreCdkStack(app, 'AgentcoreCdkStack', {
  env: { region: 'us-west-2' }, // デプロイ先リージョン
});
