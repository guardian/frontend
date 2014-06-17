package feed

import common.{Edition, ExecutionContexts, Logging, AkkaAgent}
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import java.net.URI
import scala.concurrent.Future
import model.Content
import conf.LiveContentApi
import scala.util.Failure

object SociallyReferredContentAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Seq[Content]](Nil)


  def update() {

    log.info("Refreshing most socially referred")

    val ophanQuery = OphanApi.getMostReferredFromSocialMedia(7)

    ophanQuery.map {
      ophanResults =>

        val socialReferrals: Seq[Future[Option[Content]]] = for {
          item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
          url <- ( item \ "url").asOpt[String]
        } yield {
          LiveContentApi.item(UrlToContentPath(url), Edition.defaultEdition).response.map( _.content.map( Content(_)))
        }

        val content: Seq[Content] = Nil

        Future.sequence(socialReferrals) map { contentSeq =>
          val validContents = contentSeq.flatten
          if(validContents.size > 0) {
            agent.send ( currentMap => {
              content ++ validContents
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

  private def UrlToContentPath(url: String): String = new URI(url).getPath


}