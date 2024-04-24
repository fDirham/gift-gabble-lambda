import OpenAI from "openai";
import { DUMMY_REC_LIST } from "../constants/dummy.mjs";

export default async function getRecList(args) {
  // Some params
  const { formResponse, isDummy, size } = args;
  if (isDummy) return { isError: false, recList: DUMMY_REC_LIST };

  let who = formResponse["who"];
  let why = formResponse["why"];
  let whyExtra = formResponse["whyExtra"];
  let desc = formResponse["desc"];
  let budget = formResponse["budget"];
  let giftNotes = formResponse["giftNotes"];
  let pronouns = formResponse["pronouns"];

  const openai = new OpenAI();

  const systemPrompt = `
  You are a highly creative gift recommendation machine. When asked, you output ${size} personalized and unique gift recommendations in JSON list format. These gifts must be material goods. Keep responses short. Here is an example output format:
###
[
"rec1",
"rec2",
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

  const userPrompt = userPromptComponents.join(". ");
  let openaiRes = "";
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "gpt-4-turbo",
    });

    openaiRes = completion.choices[0].message.content;
    promptTokens = completion.usage.prompt_tokens;
    completionTokens = completion.usage.completion_tokens;
  } catch (e) {
    console.error("Openai failed", e);
    return { isError: true, statusCode: 500, errorObj: { error: e } };
  }

  openaiRes = openaiRes.replaceAll("###", "");
  let recList = [];
  try {
    recList = JSON.parse(openaiRes);
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

  if (!recList.length) {
    console.error("No recommendations");
    return {
      isError: true,
      statusCode: 404,
      errorObj: { error: "No recommendations." },
    };
  }

  return { isError: false, recList, promptTokens, completionTokens };
}
