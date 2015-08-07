package cards

sealed trait CardType {
  val cssClassName: String

  case class VideoPlayerMode(show: Boolean, showEndSlate: Boolean)

  def videoPlayer = this match {
    case FullMedia50 | FullMedia75 | FullMedia100 =>
      VideoPlayerMode(show = true, showEndSlate = true)
    case ThreeQuarters | ThreeQuartersRight | Half | Third | Standard =>
      VideoPlayerMode(show = true, showEndSlate = false)
    case _ =>
      VideoPlayerMode(show = false, showEndSlate = false)
  }

  def showCutOut = this match {
    case ListItem => false
    case _ => true
  }

  /** To actually find out if media is shown you would also need to check whether there is an image (or video) and
    * whether image hide setting is on.
    *
    * But some card sizes can never show media, regardless of those options, and this is what this represents.
    */
  def canShowMedia = this match {
    case ListItem => false
    case _ => true
  }

  def showStandfirst = this match {
    case Fluid | FullMedia100 | FullMedia75 | FullMedia50 | Half | ThreeQuarters | ThreeQuartersRight | Standard | SavedForLater => true
    case _ => false
  }

  def canShowSlideshow = this match {
    case Half | ThreeQuarters | ThreeQuartersRight | ThreeQuartersTall | FullMedia50 | FullMedia75 | FullMedia100 => true
    case _ => false
  }

  def savedForLater = this match {
    case SavedForLater => true
    case _ => false
  }
}

/** This is called ListItem because List is already taken */
case object ListItem extends CardType {
  override val cssClassName = "list"
}

case object MediaList extends CardType {
  override val cssClassName = "list-media"
}

case object Standard extends CardType {
  override val cssClassName = "standard"
}

case object Half extends CardType {
  override val cssClassName = "half"
}

case object ThreeQuarters extends CardType {
  override val cssClassName: String = "three-quarters"
}

case object ThreeQuartersRight extends CardType {
  override val cssClassName: String = "three-quarters-right"
}

case object ThreeQuartersTall extends CardType {
  override val cssClassName: String = "three-quarters-tall"
}

case object FullMedia50 extends CardType {
  override val cssClassName: String = "full-media-50"
}

case object FullMedia75 extends CardType {
  override val cssClassName: String = "full-media-75"
}

case object FullMedia100 extends CardType {
  override val cssClassName: String = "full-media-100"
}

case object Fluid extends CardType {
  override val cssClassName: String = "fluid"
}

case object Third extends CardType {
  override val cssClassName: String = "third"
}

case object SavedForLater extends CardType {
  override val cssClassName: String = "saved-for-later"
}
