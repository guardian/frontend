package services

import common.{ Logging, ExecutionContexts }
import conf.AdminConfiguration.fastly
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
  import play.api.Play.current

  private val regions = List("usa", "europe", "ausnz")

  def apply(): Future[List[FastlyStatistic]] = {

    val futureResponses: Future[List[String]] = Future.sequence{
      regions map { region =>
        val request = WS.url(s"https://api.fastly.com/stats/service/${fastly.serviceId}?by=minute&from=45+minutes+ago&to=15+minutes+ago&region=$region")
          .withHeaders("Fastly-Key" -> fastly.key)
          .withRequestTimeout(20000)

        val response: Future[Option[String]] = request.get().map { resp => Some(resp.body) }.recover {
          case e: Throwable => {
            log.error(s"Error with request to api.fastly.com: ${e.getMessage}")
            None
          }
        }
        response
      }

    }.map(_.flatten)

    futureResponses map { responses =>

      responses flatMap { body =>
        val json: JsValue = Json.parse(body)
        val samples: List[JsObject] = (json \ "data").as[JsObject].values.toList.flatMap {_.as[JsArray].value} map {_.as[JsObject]}
        val region: String = (json \ "meta" \ "region").as[String]

        log.info(s"Loaded ${samples.size} Fastly statistics results for region: $region")

        samples flatMap { block =>
          val service: String = (block \ "service_id").as[String]
          val timestamp: Long = (block \ "start_time").as[Long] * 1000
          val statistics: List[(String, JsValue)] = block.fieldSet.toList

          val filtered = statistics filter {
            case (_, JsNull) => false
            case ("hits", _) => true
            case ("miss", _) => true
            case ("errors", _) => true
            case _ => false
          }

          filtered map {
            case (name, stat) => FastlyStatistic(service, region, timestamp, name, stat.asOpt[Double].map(_.toString) getOrElse stat.as[String])
          }
        }
      }
    }
  }
}
