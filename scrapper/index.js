const Scrapper = require("./src/index");

Scrapper(new Date("2022-12-01T00:01:00.000Z"), new Date("2022-12-01T00:03:00.000Z")).then(console.log).catch(console.error);
