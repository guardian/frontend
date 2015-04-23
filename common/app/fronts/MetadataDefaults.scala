package fronts

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.Comment
import implicits.FaciaContentImplicits._
import model.Content
import views.support.CardStyleForFrontend

/** TODO this needs to be moved to Facia scala client & be integrated with Facia */
object MetadataDefaults {
  // Defaults unaffected by tone of the item
  val ImmutableDefaults = Map(
    ("isBreaking" , false),
    ("isBoosted", false),
    ("imageHide", false),
    ("imageReplace", false),
    ("showKickerSection", false),
    ("showKickerCustom", false),
    ("showBoostedHeadline", false)
  )

  // Defaults affected by tone of the item
  val MutableDefaults = Map(
    ("showMainVideo", false),
    ("showKickerTag", false),
    ("showByline", false),
    ("imageCutoutReplace", false),
    ("showQuotedHeadline", false)
  )

  val Defaults = ImmutableDefaults ++ MutableDefaults

  def apply(content: Content) = CardStyleForFrontend(content) match {
    case _ if content.isCartoon => Defaults ++ Map(
      "showByline" -> true
    )

    case Comment => Defaults ++ Map(
      ("showByline", true),
      ("showQuotedHeadline", true),
      ("imageCutoutReplace", true)
    )

    case _ if content.isVideo => Defaults + ("showMainVideo" -> true)

    case _ => Defaults
  }

  def apply(faciaContent: FaciaContent) = faciaContent.cardStyle match {
    case _ if faciaContent.isCartoon => Defaults ++ Map(
      "showByline" -> true
    )

    case Comment => Defaults ++ Map(
      ("showByline", true),
      ("showQuotedHeadline", true),
      ("imageCutoutReplace", true)
    )

    case _ if faciaContent.isVideo => Defaults + ("showMainVideo" -> true)

    case _ => Defaults
  }
}
