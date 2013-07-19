package services

import common.{ Logging, ExecutionContexts }
import conf.PorterConfiguration
import com.amazonaws.services.cloudwatch.model.{ Dimension, MetricDatum }
import org.joda.time.DateTime
import play.api.libs.ws.WS
import play.api.libs.json.{ JsArray, JsObject, JsValue, Json, JsNull }
import scala.concurrent.Future

case class FastlyStatistic(service: String, timestamp: Long, name: String, value: String) {
  lazy val key: (String, String) = (service, name)

  lazy val metric = new MetricDatum().
    withMetricName(name).
    withDimensions(new Dimension().withName("service").withValue(service)).
    withTimestamp(new DateTime(timestamp).toDate).
    withValue(value.toDouble)
}

object Fastly extends ExecutionContexts with Logging {

  def apply(): Future[List[FastlyStatistic]] = {
    val response: Future[String] = WS.url("https://api.fastly.com/stats?by=minute&from=45+minutes+ago&to=15+minutes+ago").withHeaders(
      "Fastly-Key" -> PorterConfiguration.fastly.key
    ).get() map { _.body }

    response map { body =>
      val json: JsValue = Json.parse(body)
      val services: List[JsValue] = (json \ "data").as[JsObject].values.toList
      val blocks: List[JsObject] = services flatMap { _.as[JsArray].value } map { _.as[JsObject] }

      log.info("Loaded %s Fastly statistics results" format blocks.size)

      blocks flatMap { block =>
        val service: String = (block \ "service_id").as[String]
        val timestamp: Long = (block \ "start_time").as[String].toLong * 1000
        val statistics: List[(String, JsValue)] = block.fieldSet.toList

        val filtered = statistics filter {
          case ("service_id", _) => false
          case ("start_time", _) => false
          case (_, JsNull) => false
          case _ => true
        }

        filtered map {
          case (name, json) => FastlyStatistic(service, timestamp, name, json.as[String])
        }
      }
    }
  }
}