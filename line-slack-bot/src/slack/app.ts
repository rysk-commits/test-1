import { App, ExpressReceiver } from "@slack/bolt";
import { config } from "../config";

export const receiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  endpoints: "/webhook/slack/events",
});

export const slackApp = new App({
  token: config.slack.botToken,
  receiver,
});
