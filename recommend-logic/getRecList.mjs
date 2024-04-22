import OpenAI from "openai";
import { DUMMY_REC_LIST } from "../constants/dummy.mjs";

export default async function getRecList(searchParams) {
  const returnDummy = searchParams["returnDummy"];
  const isDummy = returnDummy === "1";
  if (isDummy) return { isError: false, recList: DUMMY_REC_LIST };

  let who = searchParams["who"];
  let why = searchParams["why"];
  let whyExtra = searchParams["whyExtra"];
  let desc = searchParams["desc"];
  let budget = searchParams["budget"];
  let pronouns = searchParams["pronouns"];

  const openai = new OpenAI();

  const systemPrompt = `
  You are a creative gift recommendation machine. When prompted, you output 10 interesting and personal gift recommendations in JSON list format. The gifts have to be products purchasable online. Keep responses short. Here is an example output format:
###
[
"rec1",
"rec2",
...
]
###
  `;

  let extendedWhy = why;
  switch (extendedWhy) {
    case "bday":
      extendedWhy = ". Their birthday is coming up";
      break;
    case "anniversary":
      extendedWhy = ". Our anniversary is coming up";
      break;
    case "wedding":
      extendedWhy = ". Their wedding is coming up";
      break;
    case "other":
      if (whyExtra) {
      }
      extendedWhy = ". Why? " + whyExtra;
    case "na":
      extendedWhy = "";
      break;
    default:
      extendedWhy = "";
      break;
  }

  let extendedBudget = budget;
  if (budget) {
    if (budget !== "0") {
      extendedBudget = `I only have a budget of $${budget}.`;
    } else {
      extendedBudget = " ";
    }
  }

  let extendedDesc = desc;
  extendedDesc = extendedDesc.trim();

  const userPrompt = `
  I want to get a gift for my ${who}${extendedWhy}. A little about my ${who}: ${desc?.trim()}.${extendedBudget}What should I get?
  `;

  let openaiRes = "";

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    openaiRes = completion.choices[0].message.content;
  } catch (e) {
    console.error("Openai failed", e);
    return { isError: true, statusCode: 500, errorObj: { error: e } };
  }

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

  return { isError: false, recList };
}
