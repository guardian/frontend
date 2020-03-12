package layout.slices

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore
