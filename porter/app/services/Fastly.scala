package services

import common.{ Logging, ExecutionContexts }
import conf.PorterConfiguration
import com.amazonaws.services.cloudwatch.model.{ Dimension, MetricDatum }
import org.joda.time.DateTime
import play.api.libs.ws.WS
import play.api.libs.json.{ JsArray, JsObject, JsValue, Json, JsNull }
import scala.concurrent.Future

case class FastlyStatistic(service: String, region: String, timestamp: Long, name: String, value: String) {
  lazy val key: (String, String, String) = (service, name, region)

  lazy val metric = new MetricDatum().
    withMetricName(name).
    withDimensions(new Dimension().withName("service").withValue(service),
                   new Dimension().withName("region").withValue(region)).
    withTimestamp(new DateTime(timestamp).toDate).
    withValue(value.toDouble)
}

object Fastly extends ExecutionContexts with Logging {

  private val regions = List("usa", "europe", "ausnz", "apac")

  def apply(): Future[List[FastlyStatistic]] = {

    val futureResponses: Future[List[String]] = Future.sequence( regions map { region =>
        WS.url(s"https://api.fastly.com/stats?by=minute&from=45+minutes+ago&to=15+minutes+ago&region=${region}"
        ).withHeaders("Fastly-Key" -> PorterConfiguration.fastly.key).get() map { _.body } })

    futureResponses map { responses =>

      responses flatMap { body =>
        val json: JsValue = Json.parse(body)
        val services: List[JsValue] = (json \ "data").as[JsObject].values.toList
        val blocks: List[JsObject] = services flatMap { _.as[JsArray].value } map { _.as[JsObject] }
        val region: String = (json \ "meta" \ "region").as[String]

        log.info(s"Loaded ${blocks.size} Fastly statistics results for region: ${region}")

        blocks flatMap { block =>
          val service: String = (block \ "service_id").as[String]
          val timestamp: Long = (block \ "start_time").as[Long] * 1000
          val statistics: List[(String, JsValue)] = block.fieldSet.toList

          val filtered = statistics filter {
            case ("service_id", _) => false
            case ("start_time", _) => false
            case (_, JsNull) => false
            case _ => true
          }

          filtered map {
            case (name, stat) => FastlyStatistic(service, region, timestamp, name, stat.asOpt[Double].map(_.toString) getOrElse stat.as[String])
          }
        }
      }
    }
  }
}