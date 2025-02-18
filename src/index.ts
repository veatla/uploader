import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";

const app = express();
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Hi')
});

const server = http.createServer(app);
const listener = server.listen(4000, () => {
  const address = listener.address();
  if (typeof address === "string") process.exit(1);
  console.log(`Server started on http://localhost:${address?.port}`);
});
