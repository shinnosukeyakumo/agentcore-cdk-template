# ===================================================
# AgentCore Runtime エントリポイント
# Strands Agent を使ってClaudeと会話する
# ===================================================

from strands import Agent
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# --------------------------------------------------
# Strands Agent の初期化
# ここでモデルやシステムプロンプト、ツールを設定する
# --------------------------------------------------
agent = Agent()  # デフォルト: Claude Sonnet（us-west-2）

# --------------------------------------------------
# AgentCore アプリの初期化
# FastAPIのラッパー。/invocations と /ping を自動で作成する
# --------------------------------------------------
app = BedrockAgentCoreApp()

# --------------------------------------------------
# エントリポイント
# AgentCore Runtimeから呼び出されるメイン関数
# payload: CLIや呼び出し元から送られてくるJSON
# --------------------------------------------------
@app.entrypoint
def invoke(payload):
    user_message = payload.get("prompt", "")  # "prompt" キーでメッセージを受け取る
    response = agent(user_message)
    return str(response)

# --------------------------------------------------
# サーバー起動
# --------------------------------------------------
if __name__ == "__main__":
    app.run()
