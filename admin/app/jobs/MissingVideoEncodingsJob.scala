package jobs

import common.{Edition, Logging, ExecutionContexts, AkkaAgent}
import conf.switches.Switches
import model.{Content, Video}
import scala.language.postfixOps
import conf.LiveContentApi
import LiveContentApi.getResponse
import scala.concurrent.{Future, Await}
import scala.concurrent.duration._
import akka.util.Timeout
import play.api.libs.ws.WS
import play.api.Play.current
import services.MissingVideoEncodings
import model.diagnostics.video.DynamoDbStore


object VideoEncodingsJob extends ExecutionContexts with Logging  {

  private val videoEncodingsAgent = AkkaAgent[Map[String, List[MissingEncoding]]](Map.empty)
  implicit val timeout = Timeout(5 seconds)

  def getReport(report: String): Option[List[MissingEncoding]] = videoEncodingsAgent().get(report)

  def doesEncodingExist(encodingUrl: String) : Future[Boolean]= {
     val sanitizedUrl = encodingUrl.filter( _ != '\n')    //For octopus
     val response = WS.url(sanitizedUrl).head()
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
        .showElements("all")
        .pageSize(100)
     ) map {
        response =>
            response.results.map(Content.apply).collect { case v: Video => v }
     }

     apiVideoResponse.onSuccess {
       case allVideoContent =>
         val missingVideoEncodings = Future.sequence(allVideoContent.map { video =>
           val videoAssets = video.elements.videos.filter(_.properties.isMain).flatMap(_.videos.videoAssets).map(_.url).flatten

           val missingVideoAsssets = Future.sequence(
             videoAssets.map { encoding =>
               doesEncodingExist(encoding) map {
                 case true => Some(encoding)
                 case false => None
               }
             }).map(_.flatten)

           missingVideoAsssets.map {
             missingEncodings => missingEncodings.map { missingEncoding => new MissingEncoding(video, missingEncoding)}
           }
         }).map(_.flatten)

         missingVideoEncodings.onSuccess { case missingEncodings =>
           missingEncodings.map { case missingEncoding: MissingEncoding =>
             DynamoDbStore.haveSeenMissingEncoding(missingEncoding.encodingSrc, missingEncoding.url) map {
               case true => log.debug(s"Already seen missing encoding: ${missingEncoding.encodingSrc} for url: ${missingEncoding.url}")
               case false =>
                 log.info(s"Send notification for missing video encoding: ${missingEncoding.encodingSrc} for url: ${missingEncoding.url}")
                 MissingVideoEncodings.sendMessage(missingEncoding.encodingSrc, missingEncoding.url, missingEncoding.title)
                 DynamoDbStore.storeMissingEncoding(missingEncoding.encodingSrc, missingEncoding.url)
             }
           }
           videoEncodingsAgent.send(old => old + ("missing-encodings" -> List()))
         }
     }

     apiVideoResponse.onFailure{
       case error: Throwable =>
         log.error(s"Unable to retrieve video content from api: ${error.getMessage}")
     }
  }
}

case class MissingEncoding(video: Video, encodingSrc: String) {
    lazy val url = video.metadata.webUrl
    lazy val title = video.metadata.webTitle
}
