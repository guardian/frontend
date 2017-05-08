package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content}
import common.Logging
import common.commercial.hosted.HostedUtils.getAndLog
import model.MetaData

case class HostedArticlePage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val title: String,
  override val standfirst: String,
  body: String,
  override val cta: HostedCallToAction,
  mainPicture: String,
  mainPictureCaption: String,
  override val socialShareText: Option[String],
  override val shortSocialShareText: Option[String],
  override val metadata: MetaData
) extends HostedPage {

  override val imageUrl = mainPicture

}

object HostedArticlePage extends Logging {

  def fromContent(content: Content): Option[HostedArticlePage] = {
    log.info(s"Building hosted article ${content.id} ...")

    val page = for {
      _ <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaign <- HostedCampaign.fromContent(content)
      atoms <- getAndLog(content, content.atoms, "the atoms are missing")
      ctaAtoms <- getAndLog(content, atoms.cta, "the CTA atoms are missing")
      ctaAtom <- getAndLog(content, ctaAtoms.headOption, "the CTA atom is missing")
    } yield {

      val mainImageAsset: Option[Asset] = {
        val optElement = content.elements.flatMap(
          _.find { element =>
            element.`type` == Image && element.relation == "main"
          }
        )
        optElement.map { element =>
          element.assets.maxBy(_.typeData.flatMap(_.width).getOrElse(0))
        }
      }

      HostedArticlePage(
        id = content.id,
        campaign,
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),
        body = content.fields.flatMap(_.body).getOrElse(""),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        mainPicture = mainImageAsset.flatMap(_.file) getOrElse "",
        mainPictureCaption = mainImageAsset.flatMap(_.typeData.flatMap(_.caption)).getOrElse(""),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        metadata = HostedMetadata.fromContent(content).copy(openGraphImages = mainImageAsset.flatMap(_.file).toList)
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedArticlePage from ${content.id}")

    page
  }

}
