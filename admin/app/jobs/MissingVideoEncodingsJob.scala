package jobs

import common.{Edition, Logging, ExecutionContexts, AkkaAgent}
import scala.language.postfixOps
import conf.{Switches, LiveContentApi}
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
import services.MissingVideoEncodings
import model.diagnostics.video.DynamoDbStore


object VideoEncodingsJob extends ExecutionContexts with Logging  {

  private val videoEncodingsAgent = AkkaAgent[Map[String, List[MissingEncoding]]](Map.empty)
  implicit val timeout = Timeout(5 seconds)

  def getReport(report: String): Option[List[MissingEncoding]] = videoEncodingsAgent().get(report)
  def doesEncodingExist(encodingUrl: String) : Future[Boolean]= {
     val response = WS.url(encodingUrl).head()
     response.map { r => r.status == 404 || r.status == 500}
  }

  def run () {
      if( Switches.MissingVideoEndcodingsJobSwitch.isSwitchedOn ) {
          checkForMissingEncodings()
      }
  }

  private def checkForMissingEncodings() {
     log.info("Checking for missing video encodings")

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

     val videos = Await.result(apiVideoResponse.map{ actualVideo =>
       actualVideo map ( video => video )
     }, 10.seconds )

     val missingEncodingsData = Future.sequence(videos.map { video =>
         val missingEncodingsForVideo = Future.sequence(video.encodings map { encoding =>
           doesEncodingExist(encoding) map {
             case true => Some(encoding)
             case false => None
           }
         }).map(_.flatten)
         missingEncodingsForVideo.map {
           missingEncodings => missingEncodings.map{ missingEncoding => MissingEncoding(video, missingEncoding) }
         }
       }
     ).map(_.flatten)



     missingEncodingsData.onSuccess{ case missingEncodings =>

         missingEncodings.map { case missingEncoding: MissingEncoding =>
             DynamoDbStore.haveSeenMissingEncoding(missingEncoding.encodingSrc, missingEncoding.url) map {
                case true => log.debug(s"Already seen missing encoding: ${missingEncoding.encodingSrc} for url: ${missingEncoding.url}")
                case false =>
                  log.info(s"Send notification for missing video encoding: ${missingEncoding.encodingSrc} for url: ${missingEncoding.url}")
                  MissingVideoEncodings.sendMessage(missingEncoding.encodingSrc, missingEncoding.url, missingEncoding.title)
                  DynamoDbStore.storeMissingEncoding(missingEncoding.encodingSrc, missingEncoding.url)
             }
         }
         videoEncodingsAgent.send( old => old + ("missing-encodings" -> List()) )
     }
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
  lazy val webUrl: String = delegate.webUrl

  def encodings(): Seq[String] = {
    val doc = XML.loadString(body)

    (doc \\ "source") map {
      source =>
        (source \\ "@src").text.trim()
    }
  }
}

/*
object MissingEncoding {
  def apply(video: Video, encodingSrc: String) = {
    new MissingEncoding(video, encodingSrc)
  }
}
*/

case class MissingEncoding(video: Video, encodingSrc: String) {
  lazy val url = video.webUrl
  lazy val title = video.webTitle
}
