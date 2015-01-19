package business

import common.ResourcesHelper
import org.scalatest.{Matchers, FlatSpec}

class R2StocksParserTest extends FlatSpec with Matchers with ResourcesHelper {
  "parse" should "parse the R2 business front for stocks correctly" in {
    val stocks = R2StocksParser.parse(slurpOrDie("r2-business.html"))

    stocks.stocks.length shouldEqual 3

    stocks.stocks.head shouldEqual StockValue(
      "FTSE 100",
      6481.66,
      93.2,
      Positive,
      closed = false
    )
  }
}
