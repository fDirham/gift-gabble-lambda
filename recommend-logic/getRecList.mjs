import OpenAI from "openai";
import { DUMMY_REC_LIST } from "../constants/dummy.mjs";
import { getTimeDifference } from "../utilities/helpers.mjs";

export default async function getRecList(args) {
  // Some params
  const { formResponse, isDummy, size, oldResponses } = args;
  if (isDummy) return { isError: false, recList: DUMMY_REC_LIST };

  const startDate = new Date();

  let who = formResponse["who"];
  let why = formResponse["why"];
  let whyExtra = formResponse["whyExtra"];
  let desc = formResponse["desc"];
  let budget = formResponse["budget"];
  let giftNotes = formResponse["giftNotes"];
  let pronouns = formResponse["pronouns"];

  const openai = new OpenAI();

  const systemPrompt = `
  You are a highly creative gift recommendation machine. When asked, you output ${size} random, whacky, and wild gift recommendations in json format. These recommendations must be physical goods. Make sure each response is short and simple. Use this output format:
###
gift_recs: [
  "rec1",
  "rec2",
  "rec3",
  ...
]
###
  `;

  const userPromptComponents = [];

  const extendedWho = `I want to get a gift for my ${who}`;
  userPromptComponents.push(extendedWho);

  let extendedWhy = why;
  switch (extendedWhy) {
    case "bday":
      extendedWhy = "Their birthday is coming up";
      break;
    case "anniversary":
      extendedWhy = "Our anniversary is coming up";
      break;
    case "wedding":
      extendedWhy = "Their wedding is coming up";
      break;
    case "other":
      extendedWhy = "Why? " + whyExtra;
      if (extendedWhy.endsWith(".")) {
        extendedWhy = extendedWhy.slice(0, extendedWhy.length - 1);
      }
    case "na":
      extendedWhy = "";
      break;
    default:
      extendedWhy = "";
      break;
  }
  if (extendedWhy) {
    userPromptComponents.push(extendedWhy);
  }

  let extendedDesc = `A little bit about my ${who}: `;
  extendedDesc += desc.trim();

  userPromptComponents.push(extendedDesc);

  let extendedBudget = budget;
  if (budget) {
    if (budget !== "0") {
      extendedBudget = `I only have a budget of $${budget}`;
    } else {
      extendedBudget = "";
    }
  }
  if (extendedBudget) {
    userPromptComponents.push(extendedBudget);
  }

  let extendedGiftNotes = giftNotes;
  if (extendedGiftNotes) {
    extendedGiftNotes = "Some notes about the gift: " + extendedGiftNotes;
    if (extendedGiftNotes.endsWith(".")) {
      extendedGiftNotes = extendedGiftNotes.slice(
        0,
        extendedGiftNotes.length - 1
      );
    }
    userPromptComponents.push(extendedGiftNotes);
  }

  userPromptComponents.push(`Give me ${size} gift recommendations`);

  const userPrompt = userPromptComponents.join(". ");
  let openaiRes = "";
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    const messagesToChat = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    if (oldResponses) {
      const OLD_RESPONSES_WINDOW_SIZE = 20;
      let fOldResponses = oldResponses;
      if (fOldResponses.length > OLD_RESPONSES_WINDOW_SIZE) {
        const diff = fOldResponses.length - OLD_RESPONSES_WINDOW_SIZE;
        fOldResponses = fOldResponses.slice(diff);
      }
      messagesToChat.push({
        role: "assistant",
        content: JSON.stringify(oldResponses, null, 3),
      });
      messagesToChat.push({
        role: "user",
        content: "Can you give me new reccomendations?",
      });
    }

    const completion = await openai.chat.completions.create({
      messages: messagesToChat,
      model: "gpt-3.5-turbo",
      frequency_penalty: 2,
      presence_penalty: 2,
      top_p: 0.1,
      response_format: { type: "json_object" },
    });

    openaiRes = completion.choices[0].message.content;
    promptTokens = completion.usage.prompt_tokens;
    completionTokens = completion.usage.completion_tokens;
  } catch (e) {
    console.error("Openai failed", e);
    return { isError: true, statusCode: 500, errorObj: { error: e } };
  }

  let recList = [];
  try {
    recList = JSON.parse(openaiRes).gift_recs;
  } catch (e) {
    console.error(
      "Parsing recommendations failed",
      { openaiRes, userPrompt },
      e
    );

    return {
      isError: true,
      statusCode: 500,
      errorObj: { error: "Unable to parse recommendations." },
    };
  }

  if (!recList || !recList.length) {
    console.error("No recommendations", recList);
    return {
      isError: true,
      statusCode: 404,
      errorObj: { error: "No recommendations." },
    };
  }

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, recList, promptTokens, completionTokens, timeDiff };
}
