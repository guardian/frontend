package implicits

trait Numbers {
  implicit def double2Constrain(d: Double) = new {
    def constrain(lower: Double, upper: Double): Double = (d max lower) min upper
  }

  // yeah I know it might be too long to be an int
  implicit def string2isInt(s: String) = new {
    lazy val isInt = s.matches("\\d+")
  }
}