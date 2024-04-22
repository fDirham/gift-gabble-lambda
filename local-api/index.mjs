import express from "express";
import "dotenv/config";
import recommendLogic from "../recommend-logic/index.mjs";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.get("/", async (request, response) => {
  try {
    console.log("Starting recommend", { queryParams: request.query });
    const res = await recommendLogic(request.query);

    response.status(res.statusCode);
    response.send(res.body);

    console.log(res);
  } catch (err) {
    console.log({ error: err });
    response.status(500);
    response.send({ error: err });
  }
});
