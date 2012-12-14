package implicits

trait Numbers {
  implicit def double2Constrain(d: Double) = new {
    def constrain(lower: Double, upper: Double): Double = (d max lower) min upper
  }
}