package model.pressed

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.CapiModelEnrichment.RichCapiDateTime
import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.utils.FaciaContentUtils.fold
import com.gu.facia.api.{models => fapi, utils => fapiutils}
import model.CardStylePicker
import org.joda.time.DateTime

final case class PressedCard(
    id: String,
    cardStyle: CardStyle,
    webPublicationDateOption: Option[DateTime],
    lastModifiedOption: Option[DateTime],
    trailText: Option[String],
    mediaType: Option[MediaType],
    starRating: Option[Int],
    shortUrlPath: Option[String],
    shortUrl: String,
    group: String,
    isLive: Boolean,
) {
  def withoutTrailText: PressedCard = copy(trailText = None)
}

object PressedCard {
  def make(content: fapi.FaciaContent): PressedCard = {

    def lastModifiedOption(fc: FaciaContent): Option[DateTime] = {
      fold(fc)(
        curatedContent => curatedContent.content.fields.flatMap(_.lastModified),
        supportingCuratedContent => supportingCuratedContent.content.fields.flatMap(_.lastModified),
        _ => None,
        latestSnap => latestSnap.latestContent.flatMap(_.fields.flatMap(_.lastModified)),
      ).map(_.toJodaDateTime)
    }

    PressedCard(
      id = FaciaContentUtils.id(content),
      cardStyle = CardStyle.make(CardStylePicker(content)),
      isLive = FaciaContentUtils.isLive(content),
      webPublicationDateOption = FaciaContentUtils.webPublicationDateOption(content),
      lastModifiedOption = lastModifiedOption(content),
      mediaType = fapiutils.MediaType.fromFaciaContent(content).map(MediaType.make),
      shortUrl = FaciaContentUtils.shortUrl(content),
      shortUrlPath = FaciaContentUtils.shortUrlPath(content),
      group = FaciaContentUtils.group(content),
      trailText = FaciaContentUtils.trailText(content),
      starRating = FaciaContentUtils.starRating(content),
    )
  }
}
