package views.support.commercial

import common.Edition
import common.commercial.{CardContent, ContainerModel}
import conf.switches.Switches.staticBadgesSwitch
import play.api.mvc.RequestHeader

object TrackingCodeBuilder extends implicits.Requests {

  def mkInteractionTrackingCode(frontId: String,
                                containerIndex: Int,
                                container: ContainerModel,
                                card: CardContent)(implicit request: RequestHeader): String = {
    val sponsor = {
      if (staticBadgesSwitch.isSwitchedOn) {
        container.branding.map(_.sponsorName) orElse card.branding.map(_.sponsorName) getOrElse ""
      } else {
        container.brandingAttributes.flatMap(_.sponsor) getOrElse ""
      }
    }
    val cardIndex =
      (container.content.initialCards ++ container.content.showMoreCards).indexWhere(_.headline == card.headline)
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

  def paidCard(articleTitle: String)(implicit request: RequestHeader): String = {
    def param(name: String) = request.getParameter(name) getOrElse "unknown"
    val section = param("s")
    val sponsor = param("brand")
    s"GLabs-native-traffic-card | ${Edition(request).id} | $section | $articleTitle | $sponsor"
  }
}
