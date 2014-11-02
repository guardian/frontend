package layout

import common.LinkTo
import model.Trail
import play.api.mvc.RequestHeader
import views.support.ItemKicker

object Sublink {
  def fromTrail(trail: Trail) =
    Sublink(ItemKicker.fromTrail(trail, None), trail.headline, { rh: RequestHeader =>
      LinkTo(trail)(rh)
    })
}

case class Sublink(kicker: Option[ItemKicker], text: String, url: RequestHeader => Option[String])



case class FaciaCard(
  id: String,

  itemTypes: ItemClasses,

  sublinks: Seq[Sublink]
)
