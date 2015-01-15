package business

import play.api.libs.json.{Json, JsString, JsValue, Writes}

object Trend {
  implicit val jsonWrites = new Writes[Trend] {
    override def writes(o: Trend): JsValue = o match {
      case Negative => JsString("negative")
      case Positive => JsString("positive")
      case Level => JsString("level")
    }
  }
}

sealed trait Trend

case object Negative extends Trend
case object Positive extends Trend
case object Level extends Trend

object StockValue {
  implicit val jsonWrites = Json.writes[StockValue]
}

case class StockValue(
  name: String,
  value: Double,
  change: Double,
  trend: Trend,
  closed: Boolean
)

object Stocks {
  implicit val jsonWrites = Json.writes[Stocks]
}

case class Stocks(stocks: Seq[StockValue])
