package model.commercial


case class Keyword(id: String, webTitle: String) {

  val name = webTitle.toLowerCase.replaceAll( """\s""", "-")

}
