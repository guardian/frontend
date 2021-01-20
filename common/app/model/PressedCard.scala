package model.pressed

import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi, utils => fapiutils}
import model.{CardStylePicker}
import org.joda.time.DateTime

final case class PressedCard(
    id: String,
    cardStyle: CardStyle,
    webPublicationDateOption: Option[DateTime],
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
  def make(content: fapi.FaciaContent): PressedCard =
    PressedCard(
      id = FaciaContentUtils.id(content),
      cardStyle = CardStyle.make(CardStylePicker(content)),
      isLive = FaciaContentUtils.isLive(content),
      webPublicationDateOption = FaciaContentUtils.webPublicationDateOption(content),
      mediaType = fapiutils.MediaType.fromFaciaContent(content).map(MediaType.make),
      shortUrl = FaciaContentUtils.shortUrl(content),
      shortUrlPath = FaciaContentUtils.shortUrlPath(content),
      group = FaciaContentUtils.group(content),
      trailText = FaciaContentUtils.trailText(content),
      starRating = FaciaContentUtils.starRating(content),
    )
}
