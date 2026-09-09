import { config } from "./config";
import { receiver, slackApp } from "./slack/app";
import { lineWebhookRouter } from "./line/webhook";
import "./slack/handlers";

// LINE Webhookは、Slack Bolt (ExpressReceiver) が内部で持つExpressアプリに相乗りさせる
receiver.app.use(lineWebhookRouter);

receiver.app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

async function main(): Promise<void> {
  await slackApp.start(config.port);
  console.log(`Server listening on port ${config.port}`);
  console.log(`  LINE webhook:  POST /webhook/line`);
  console.log(`  Slack events:  POST /webhook/slack/events`);
}

main().catch((err) => {
  console.error("起動に失敗しました", err);
  process.exit(1);
});
