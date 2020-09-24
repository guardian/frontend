package business

import common.Logging
import play.api.libs.json.{Json, JsString, JsValue, Writes}

import scala.util.Try

object Trend {
  implicit val jsonWrites = new Writes[Trend] {
    override def writes(o: Trend): JsValue =
      o match {
        case Negative => JsString("negative")
        case Positive => JsString("positive")
        case Level    => JsString("level")
      }
  }

  def fromDouble(n: Double): Trend =
    n match {
      case 0          => Level
      case x if x > 0 => Positive
      case _          => Negative
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
    price: Double,
    change: Double,
    trend: Trend,
    closed: Boolean,
)

object Stocks extends Logging {
  implicit val jsonWrites = Json.writes[Stocks]

  private val Commas = """,+""".r

  private def withoutCommas(s: String) =
    Commas.replaceAllIn(s, "")

  def fromFingerpost(indices: Indices): Stocks = {
    Stocks(indices.indices flatMap { index =>
      val maybePrice = Try { withoutCommas(index.value.price).toDouble }.toOption

      if (maybePrice.isEmpty) {
        log.error(s"Could not read price value from Fingerpost data ${index.value.price}")
      }

      val maybeChange = Try { withoutCommas(index.value.change.day).toDouble }.toOption

      if (maybeChange.isEmpty) {
        log.error(s"Could not read change value from Fingerpost data ${index.value.change.day}")
      }

      val maybeTrend = index.value.change.trendday match {
        case "up"        => Some(Positive)
        case "down"      => Some(Negative)
        case "unchanged" => Some(Level)
        case _           => None
      }

      if (maybeTrend.isEmpty) {
        log.error(s"Could not read trend from Fingerpost data ${index.value.change.trendday}")
      }

      val closed = index.marketclosed match {
        case "Closed" => true
        case _        => false
      }

      for {
        price <- maybePrice
        change <- maybeChange
        trend <- maybeTrend
      } yield StockValue(index.name, price, change, trend, closed)
    })
  }
}

case class Stocks(stocks: Seq[StockValue])
