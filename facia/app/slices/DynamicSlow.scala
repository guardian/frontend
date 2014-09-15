package slices

object DynamicSlow extends DynamicContainer {
  override protected def standardSlice(stories: Seq[Story]): Option[Slice] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      None
    } else {
      Some(if (bigs.length == 0) {
        Minilla
      } else if (bigs.length == 1) {
        Gigan
      } else {
        Destoroyah
      })
    }
  }
}
