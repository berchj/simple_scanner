const express = require("express");
const app = express();
const port = 4550;
const userRouter = require("./routes/user");
const scannerRouter = require("./routes/scanner");
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", scannerRouter);
app.listen(port, () => {
  console.info(`server running on ${port}`);
});
