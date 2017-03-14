package layout

case class EmailCardStyle(
  image: Boolean = false,
  trailText: Boolean = false,
  largeHeadline: Boolean = false
)

case class EmailLayout(
  name: String,
  firstCard: EmailCardStyle,
  otherCards: EmailCardStyle
)

object EmailLayouts {
  private val slow = EmailLayout(
    name = "slow",
    firstCard = EmailCardStyle(image = true, trailText = true, largeHeadline = true),
    otherCards = EmailCardStyle(trailText = true)
  )

  private val medium = EmailLayout(
    name = "medium",
    firstCard = EmailCardStyle(image = true, trailText = true, largeHeadline = true),
    otherCards = EmailCardStyle()
  )

  private val fast = EmailLayout(
    name = "fast",
    firstCard = EmailCardStyle(image = true),
    otherCards = EmailCardStyle()
  )

  private val fastImages = EmailLayout(
    name = "fast-images",
    firstCard = EmailCardStyle(image = true),
    otherCards = EmailCardStyle(image = true)
  )

  private val layouts = Map(
    slow.name -> slow,
    medium.name -> medium,
    fast.name -> fast,
    fastImages.name -> fastImages
  )

  def layoutByName(name: String): EmailLayout =
    layouts.getOrElse(name, slow)
}
