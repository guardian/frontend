package form

import play.api.data.{Mapping, Form}
import com.gu.identity.model.User
import idapiclient.UserUpdate

trait UserFormMapping[T <: UserFormData] extends Mappings{

  lazy val form: Form[T] = Form(formMapping)

  def bindFromRequest()(implicit request: play.api.mvc.Request[_]): Form[T] = form.bindFromRequest()

  def bindForm(user: User): Form[T] = form fill fromUser(user)

  def mapContext(context: String): String = contextMap.getOrElse(context, context)

  protected def formMapping: Mapping[T]

  protected def fromUser(user: User): T

  protected def contextMap: Map[String, String]
}

trait UserFormData {
  def toUserUpdate: UserUpdate
}