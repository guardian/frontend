package views.helpers

object CSS {
  def bigItemCssClass(firstBoost: Boolean, secondBoost: Boolean) =
    (firstBoost, secondBoost) match {
      case (true, true) => "row-of-two--boost-both"
      case (true, _) => "row-of-two--boost-first"
      case (_, true) => "row-of-two--boost-second"
      case _ => "row-of-two--boost-none"
    }
}
