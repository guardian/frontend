package cards

sealed trait CardType {
  val cssClassName: String

  def showVideoPlayer = this match {
    case Half | ThreeQuarters | ThreeQuartersRight | Full | MegaFull => true
    case _ => false
  }

  def showCutOut = this match {
    case ListItem => false
    case _ => true
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

case object Full extends CardType {
  override val cssClassName: String = "full"
}

case object MegaFull extends CardType {
  override val cssClassName: String = "mega-full"
}

case object Third extends CardType {
  override val cssClassName: String = "third"
}
