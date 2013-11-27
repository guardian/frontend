package model.commercial

trait Ad {

  def isTargetedAt(segment: Segment): Boolean
}
