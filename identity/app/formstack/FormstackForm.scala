package formstack

case class FormstackForm(formId: String, view: String, version: Option[String]) {
  val formReference = s"$formId-$view"
}
object FormstackForm {
  def extractFromSlug(slug: String): Option[FormstackForm] =
    slug.split("-").toList match {
      case formId :: viewId :: version :: Nil => Some(FormstackForm(formId, viewId, Some(version)))
      case formId :: viewId :: Nil            => Some(FormstackForm(formId, viewId, None))
      case _                                  => None
    }
}
