package model.pressed

// EnrichedContent is an optionally-present field of the PressedContent class.
// It contains additional content that has been pre-fetched by facia-press, to
// enable facia-server-side rendering of FAPI content, such as embeds.
final case class EnrichedContent(
    embedHtml: Option[String],
    embedCss: Option[String],
    embedJs: Option[String],
)

object EnrichedContent {
  val empty = EnrichedContent(None, None, None)
}
