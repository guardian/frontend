package implicits

trait Numbers {
  implicit class Double2Constrain(d: Double) {
    def constrain(lower: Double, upper: Double): Double = (d max lower) min upper
  }

  // yeah I know it might be too long to be an int
  implicit class String2isInt(s: String) {
    lazy val isInt = s.matches("\\d+")
  }

  // yep, just a copy of isInt - but I prefer it this way when handling Longs
  implicit class String2isLong(s: String) {
    lazy val isLong = s.matches("\\d+")
  }
}
