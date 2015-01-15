package business

import play.api.libs.json.{JsString, JsValue, Writes}

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

case class StockValue(
  name: String,
  value: Double,
  change: Double,
  trend: Trend,
  closed: Boolean
)

case class Stocks(stocks: Seq[StockValue])
