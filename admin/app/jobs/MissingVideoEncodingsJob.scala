package jobs

import common.{Edition, Logging, ExecutionContexts, AkkaAgent}
import scala.language.postfixOps
import conf.LiveContentApi
import LiveContentApi.getResponse
import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.Content
import scala.xml.XML
import play.api._

import scala.util.{Failure, Success}
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._
import akka.util.Timeout
import org.joda.time.Seconds
import play.api.libs.ws.WS
import play.api.Play.current


object VideoEncodingsJob extends ExecutionContexts with Logging  {

  private val videoEncodingsAgent = AkkaAgent[Map[String, List[(String, String)]]](Map.empty)
  implicit val timeout = Timeout(5 seconds)

  def getReport(feature: String): List[(String, String)] = videoEncodingsAgent().get(feature).getOrElse(List(("Not","Ready")))
  def doesEncodingExist(encodingUrl: String) : Future[Boolean]= {
    log.info("++ URL: " + encodingUrl)
     val response = WS.url(encodingUrl).head()
     response.map{ r =>
        r.status == 404
     }
  }


  def run () {

     log.info("Looking for missing video encodings")

     val apiVideoResponse = getResponse(LiveContentApi.search(Edition.defaultEdition)
          .tag("type/video")
          .showFields("body")
          .pageSize(100)
     ) map {
       response =>
         response.results map {
           Video(_)
         }
     }

     val videos = Await.result(apiVideoResponse.map{  actualVideo =>
       actualVideo map ( video => video )
     }, 5.seconds )

     val missingEncodingsData = Future.sequence(videos.map { video =>
         val missingEncodingsForVideo = Future.sequence(video.encodings map { encoding =>
           doesEncodingExist(encoding) map {
             case true => Some(encoding)
             case false => None
           }
         }).map(_.flatten)
         missingEncodingsForVideo.map {
           missingEncodings => missingEncodings.map{ missing => (video.webTitle, missing) }

         }
       }
     ).map(_.flatten)
     missingEncodingsData.onSuccess{case xs => videoEncodingsAgent.send( old => old+("missing-encodings" -> xs)) }
     log.info("++ Missing video encodings loaded")
  }
}

object Video extends Logging {
  def apply(delegate: Content) = {
    new Video(delegate)
  }
}
class Video(delegate: Content) {
  lazy val body = delegate.safeFields("body")
  lazy val webTitle: String = delegate.webTitle
  def encodings(): Seq[String] = {
    val doc = XML.loadString(body)

    (doc \\ "source") map {
      source =>
        (source \\ "@src").text.trim()
    }
  }
}


