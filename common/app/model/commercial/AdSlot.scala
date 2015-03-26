package model.commercial

sealed trait AdSlot {
  val name: String
}

case object inline2 extends AdSlot {
  override val name: String = "dfp-ad--inline2"
}
