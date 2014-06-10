package feed

import common.{Edition, ExecutionContexts, Logging, AkkaAgent}
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import java.net.URL
import scala.concurrent.Future
import model.Content
import conf.ContentApi
import scala.util.{Failure, Success}


//TODO - move to trait
object SociallyReferredContentAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Seq[Content]](Seq.empty)


  def update() {

    log.info("Refreshing most socially referred")

    val ophanQuery = OphanApi.getMostReferredFromSocialMedia(7)

    ophanQuery.map {
      ophanResults =>

        val socialReferrals: Seq[Future[Option[Content]]] = for {
          item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
          url <- ( item \ "url").asOpt[String]
        } yield {
          ContentApi.item(UrlToContentPath(url), Edition.defaultEdition).response.map( _.content.map( Content(_)))
        }

        val content: Seq[Content] = Seq.empty

        Future.sequence(socialReferrals) map { contentSeq =>
          val validContents = contentSeq.flatten
          if(validContents.size > 0) {
            agent.send ( currentMap => {
              content ++ contentSeq.flatten
            })
          }
        }
        agent.update(content)
    }
  }

  def getReferrals: Seq[Content] = {
    agent.get()
  }

  def stop() {
    agent.close()
  }

  private def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if(contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
  }

}