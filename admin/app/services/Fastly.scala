package services

import common.{ Logging, ExecutionContexts }
import conf.AdminConfiguration.fastly
import com.amazonaws.services.cloudwatch.model.{ Dimension, MetricDatum }
import org.joda.time.DateTime
import play.api.libs.ws.WSClient
import play.api.libs.json.{JsValue, Json}

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

case class FastlyStatisticService(wsClient: WSClient) extends ExecutionContexts with Logging {

  private case class FastlyApiStat(
    hits: Int,
    miss: Int,
    errors: Int,
    service_id: String,
    start_time: Long
  )

  private implicit val FastlyApiStatFormat = Json.format[FastlyApiStat]

  private val regions = List("usa", "europe", "ausnz")

  def fetch(): Future[List[FastlyStatistic]] = {

    val futureResponses: Future[List[String]] = Future.sequence{
      regions map { region =>
        val request = wsClient.url(s"https://api.fastly.com/stats/service/${fastly.serviceId}?by=minute&from=45+minutes+ago&to=15+minutes+ago&region=$region")
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
        val samples: List[FastlyApiStat] = (json \ "data").validate[List[FastlyApiStat]].getOrElse(Nil)
        val region: String = (json \ "meta" \ "region").as[String]

        log.info(s"Loaded ${samples.size} Fastly statistics results for region: $region")

        samples flatMap { sample: FastlyApiStat =>
          val service: String = sample.service_id
          val timestamp: Long = sample.start_time * 1000
          val statistics: List[(String, String)] = List(
            ("hits", sample.hits.toString),
            ("miss", sample.miss.toString),
            ("errors", sample.errors.toString)
          )

          statistics map {
            case (name, stat) => FastlyStatistic(service, region, timestamp, name, stat)
          }
        }
      }
    }
  }
}
