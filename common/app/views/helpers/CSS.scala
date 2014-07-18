package views.helpers

object CSS {
  def bigItemCssClass(firstImageAdjust: String, secondImageAdjust: String) =
    (firstImageAdjust, secondImageAdjust) match {
      case ("boost", "boost") => "row-of-two--boost-both"
      case ("boost", _) => "row-of-two--boost-first"
      case (_, "boost") => "row-of-two--boost-second"
      case (_, _) => "row-of-two--boost-none"
    }
}
