const { Spot }= require("@binance/connector");
const client = new Spot();

async function Scrapper(startDate, endDate) {
  try {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const limit = parseInt(1 + (endTime / 1000 / 60) - (startTime / 1000 / 60));

    const { data: candles } = await client.klines('BTCUSDT', '1m', { startTime, endTime, limit })

    return candles;
  } catch (e) {
    console.error(e);
  }
}

module.exports = Scrapper;
