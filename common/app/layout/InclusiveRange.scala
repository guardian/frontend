package layout

case class InclusiveRange(minimum: Int, maximum: Int)

object InclusiveRange {
  def unit(n: Int): InclusiveRange = InclusiveRange(n, n)

  def fromZero(n: Int): InclusiveRange = InclusiveRange(0, n)

  def constrain(range: InclusiveRange, n: Int): Int =
    (n max range.minimum) min range.maximum
}
