package layout.slices

case class EmailLayout(
    name: String,
    firstCard: EmailCardStyle,
    otherCards: EmailCardStyle,
)

object EmailLayouts {
  private val slow = EmailLayout(
    name = "slow",
    firstCard = EmailFaciaCard(image = true, trailText = true, largeHeadline = true),
    otherCards = EmailFaciaCard(trailText = true),
  )

  private val medium = EmailLayout(
    name = "medium",
    firstCard = EmailFaciaCard(image = true, trailText = true, largeHeadline = true),
    otherCards = EmailFaciaCard(),
  )

  private val fast = EmailLayout(
    name = "fast",
    firstCard = EmailFaciaCard(image = true),
    otherCards = EmailFaciaCard(),
  )

  private val fastImages = EmailLayout(
    name = "fast-images",
    firstCard = EmailFaciaCard(image = true),
    otherCards = EmailFaciaCard(image = true),
  )

  private val freeText = EmailLayout(
    name = "free-text",
    firstCard = EmailFreeText,
    otherCards = EmailHidden,
  )

  val all = Map(
    slow.name -> slow,
    medium.name -> medium,
    fast.name -> fast,
    fastImages.name -> fastImages,
    freeText.name -> freeText,
  )

  def layoutByName(name: String): EmailLayout =
    all.getOrElse(name, slow)
}
