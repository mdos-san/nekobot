const Scrapper = require("../src/index");

describe("Binance request", () => {
    it("Can request only one candle", async () => {
        const candles = await Scrapper(new Date("2022-12-01T00:00:00.000Z"), new Date("2022-12-01T00:00:00.000Z"))
        expect(candles.length).toBe(1);
    })

    it("Can request multiple candles", async () => {
        const candles = await Scrapper(new Date("2022-12-01T00:01:00.000Z"), new Date("2022-12-01T00:42:00.000Z"))
        expect(candles.length).toBe(42);
    })
})
