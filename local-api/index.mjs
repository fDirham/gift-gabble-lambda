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

app.post("/", async (request, response) => {
  try {
    console.log("Starting recommend", { body: request.body });
    const res = await recommendLogic(request.body);

    response.status(res.statusCode);
    response.send(res.body);

    console.log(res);
  } catch (err) {
    console.log({ error: err });
    response.status(500);
    response.send({ error: err });
  }
});
