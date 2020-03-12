package layout

sealed trait FaciaHeaderImageType

/** TODO fancy cut out version */
case object ContributorCutOutImage extends FaciaHeaderImageType

case object ContributorCircleImage extends FaciaHeaderImageType
case object FootballBadge extends FaciaHeaderImageType

case class FaciaHeaderImage(
  url: String,
  imageType: FaciaHeaderImageType
) {
  def cssClasses: Seq[String] = Seq(
    "index-page-header__image-wrapper",
    imageType match {
      case ContributorCircleImage => "index-page-header__image-wrapper--contributor-circle"
      case ContributorCutOutImage => "index-page-header__image-wrapper--contributor-cut-out"
      case FootballBadge => "index-page-header__image-wrapper--football-badge"
    }
  )
}

