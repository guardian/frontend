package implicits

trait Numbers {
  implicit class Double2Constrain(d: Double) {
    def constrain(lower: Double, upper: Double): Double = (d max lower) min upper
  }

  // yeah I know it might be too long to be an int
  implicit class String2isInt(s: String) {
    lazy val isInt = s.matches("\\d+")
  }
}