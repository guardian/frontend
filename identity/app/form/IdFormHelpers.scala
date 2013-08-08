package form

import views.html.helper.FieldConstructor
import views.html.fragments.form.identityFieldConstructor

object IdFormHelpers {
  implicit val fields = FieldConstructor(identityFieldConstructor.f)
}
