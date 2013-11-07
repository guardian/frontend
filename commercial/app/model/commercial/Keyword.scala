package model.commercial


case class Keyword(id: String, webTitle: String) {

  /* has to do same transformation as getKeywords in
   * common/app/assets/javascripts/modules/adverts/document-write.js
   * so that it can be used for matching
   */
  val name = webTitle.toLowerCase.replaceAll( """\s""", "-")

}
