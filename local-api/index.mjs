import express from "express";
import "dotenv/config";
import cors from "cors";
import mainAPI from "../recommend-logic/index.mjs";
import { getTimeDifference } from "../utilities/helpers.mjs";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.post("/", async (request, response) => {
  try {
    console.log("Starting recommend", { body: request.body });
    const startDate = new Date();

    const res = await mainAPI(request.body);

    response.status(res.statusCode);
    response.send(res.body);

    const endDate = new Date();
    const timeDiff = getTimeDifference(startDate, endDate);

    console.log("Finished", timeDiff + " seconds");
  } catch (err) {
    console.log({ error: err });
    response.status(500);
    response.send({ error: err });
  }
});
