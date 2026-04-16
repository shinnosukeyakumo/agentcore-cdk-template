// ===================================================
// AgentCore CDK スタック
// DockerイメージをビルドしてAgentCore Runtimeにデプロイする
// ===================================================

import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets'; // Dockerイメージ → ECR
import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha'; // AgentCore Runtime
import * as iam from 'aws-cdk-lib/aws-iam'; // IAM権限管理

export class AgentcoreCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --------------------------------------------------
    // ① Dockerイメージのビルド & ECRへのプッシュ
    // agent/ フォルダの Dockerfile を使って自動ビルドする
    // cdk deploy 時に実行される
    // --------------------------------------------------
    const agentImage = new ecr_assets.DockerImageAsset(this, 'AgentImage', {
      directory: 'agent',                        // agent/Dockerfile を使う
      platform: ecr_assets.Platform.LINUX_ARM64, // AgentCoreはARM64が必要
    });

    // --------------------------------------------------
    // ② AgentCore Runtime の作成
    // ECRのDockerイメージを使ってRuntimeを起動する
    // --------------------------------------------------
    const runtime = new agentcore.Runtime(this, 'AgentRuntime', {
      runtimeName: 'agentcore_cdk',  // Runtime名（英字・数字・アンダースコアのみ）

      // ①で作ったECRイメージを指定
      agentRuntimeArtifact: agentcore.AgentRuntimeArtifact.fromEcrRepository(
        agentImage.repository,
        agentImage.imageTag,
      ),

      // インターネットから呼び出せるようにする
      // 認証が必要な場合は usingCognito() に変更する
      networkConfiguration: agentcore.RuntimeNetworkConfiguration.usingPublicNetwork(),
    });

    // --------------------------------------------------
    // ③ RuntimeにBedrockの呼び出し権限を付与
    // AWSはデフォルトで何も許可しないため明示的に設定が必要
    // --------------------------------------------------
    runtime.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',                   // 通常の呼び出し
        'bedrock:InvokeModelWithResponseStream',  // ストリーミング呼び出し
      ],
      resources: [
        'arn:aws:bedrock:*::foundation-model/*',      // 全リージョンの基盤モデル
        'arn:aws:bedrock:*:*:inference-profile/*',    // 推論プロファイル（クロスリージョン用）
      ],
    }));

    // --------------------------------------------------
    // ④ デプロイ後にARNをターミナルに表示
    // RuntimeをCLIやフロントエンドから呼び出す際に必要
    // --------------------------------------------------
    new cdk.CfnOutput(this, 'AgentRuntimeArn', {
      value: runtime.agentRuntimeArn,
    });
  }
}
