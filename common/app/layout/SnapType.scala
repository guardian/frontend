package layout

sealed trait SnapType

case object FrontendLatestSnap extends SnapType
case object FrontendLinkSnap extends SnapType
case object FrontendOtherSnap extends SnapType
