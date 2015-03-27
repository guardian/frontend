package model.commercial

sealed trait AdSlot

case object TopAboveNav extends AdSlot
case object Top extends AdSlot
case object Inline1 extends AdSlot
case object Inline2 extends AdSlot
case object Inline3 extends AdSlot
case object Right extends AdSlot
