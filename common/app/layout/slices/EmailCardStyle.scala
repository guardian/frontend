package layout.slices

sealed trait EmailCardStyle

case class EmailFaciaCard(
  image: Boolean = false,
  trailText: Boolean = false,
  largeHeadline: Boolean = false
) extends EmailCardStyle
case object EmailFreeText extends EmailCardStyle
case object EmailHidden extends EmailCardStyle
