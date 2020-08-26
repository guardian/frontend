package common.commercial

/*
  Common functions for server side AdSlot(s)
 */

object AdSlot {
  /*
    The sizes to be used in the most popular adslot.
   */
  def mostPopularSizes(extended: Boolean): Map[String, Seq[String]] = {
    if (extended) {
      Map(
        "mobile" -> Seq("1,1", "2,2", "300,250", "300,274", "fluid"),
        "tablet" -> Seq("1,1", "2,2", "300,250", "300,274", "300,600", "728,90", "fluid"),
        "desktop" -> Seq("1,1", "2,2", "300,250", "300,274", "300,600", "fluid"),
      )
    } else {
      Map("mobile" -> Seq("1,1", "2,2", "300,250", "300,274", "fluid"))
    }
  }
}
