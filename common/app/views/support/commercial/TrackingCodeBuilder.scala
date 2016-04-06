package views.support.commercial

import common.Edition
import common.commercial.{CardContent, ContainerModel}
import play.api.mvc.RequestHeader

object TrackingCodeBuilder {

  def mkInteractionTrackingCode(frontId: String,
                                containerIndex: Int,
                                container: ContainerModel,
                                card: CardContent)(implicit request: RequestHeader): String = {
    val sponsor = container.branding.flatMap(_.sponsor) orElse card.branding.flatMap(_.sponsor) getOrElse ""
    val cardIndex =
      (container.content.fixed.initialCards ++
        container.content.dynamic.hugeCards ++
        container.content.dynamic.veryBigCards ++
        container.content.dynamic.bigCards ++
        container.content.showMoreCards).indexWhere(_.headline == card.headline)
    Seq(
      "Labs front container",
      Edition(request).id,
      frontId,
      s"container-${containerIndex + 1}",
      container.content.title,
      sponsor,
      s"card-${cardIndex + 1}",
      card.headline
    ) mkString " | "
  }
}
