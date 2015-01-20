package business

import org.jsoup.Jsoup

import scala.collection.JavaConversions._

object R2StocksParser {
  def parse(body: String) = {
    val document = Jsoup.parse(body)
    val indexesElement = document.getElementById("market-indexes")

    Stocks((for {
      index <- indexesElement.select(".marketindex").iterator()
    } yield {
      val indexName = index.select(".indexname a").text()
      val change = index.select(".netchange span").text().toDouble
      val price = index.select("td[title=Price]").text().toDouble
      val closed = index.select("td.timetillclose").text().contains("Closed")

      StockValue(
        indexName,
        price,
        change,
        Trend.fromDouble(change),
        closed
      )
    }).toSeq)
  }
}
