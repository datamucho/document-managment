const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require("./utils/appError");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const DB =
  `mongodb+srv://admin-Data:${process.env.PASSWORD}@cluster0.oisq9.mongodb.net/chat?retryWrites=true&w=majority`;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful!"));

app.get("/", (req, res) => {
  res.send("API Is running");
});

app.use("/api/user", userRoutes);
app.use("/api/docs", documentRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

app.listen(port, console.log(`server is running on port: ${port}`));
