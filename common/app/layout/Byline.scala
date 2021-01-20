package layout

case class Byline(
    get: String,
    contributorTags: Seq[model.Tag],
) {
  private def primaryContributor = {
    if (contributorTags.length > 2) {
      contributorTags
        .sortBy({ tag =>
          get.indexOf(tag.metadata.webTitle) match {
            case -1 => Int.MaxValue
            case n  => n
          }
        })
        .headOption
    } else {
      None
    }
  }

  def shortByline: String = primaryContributor map { tag => s"${tag.metadata.webTitle} and others" } getOrElse get
}
