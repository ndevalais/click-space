
const port = process.env.PORT || 1338;
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./routes")(app);

app.get("*", (req, res) => {
  res.send("LaikAD!");
});

function initExpress() {
  console.log('Iniciando Express');
  app.listen(port, () => {
    console.log(`Server running on port ${port} at ${(new Date()).toString()}`);
    process.on("SIGINT", closeApp);
    process.on("SIGTERM", closeApp);
  });
}

function closeApp() {
  mongo.disconnect()
    .then(() => process.exit(0));
    console.log('Close app');
}

initExpress();
