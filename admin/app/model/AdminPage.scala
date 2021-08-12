package model

object AdminPage {
  def apply(title: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = "admin-" + title,
        webTitle = title,
        section = Some(SectionId.fromId("admin")),
      ),
    )
}
