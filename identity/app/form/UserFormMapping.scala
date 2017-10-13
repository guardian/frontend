package form

import play.api.data.{Form, Mapping}
import com.gu.identity.model.User
import idapiclient.UserUpdate
import play.api.i18n.MessagesProvider

trait UserFormMapping[T <: UserFormData] extends Mappings {

  def bindForm(user: User)(implicit messagesProvider: MessagesProvider): Form[T] =
    Form(formMapping) fill fromUser(user)

  def mapContext(context: String): String = contextMap.getOrElse(context, context)

  protected def formMapping(implicit messagesProvider: MessagesProvider): Mapping[T]

  protected def fromUser(user: User): T

  protected def contextMap: Map[String, String]
}

trait UserFormData {
  def toUserUpdate(currentUser: User): UserUpdate

  protected def toUpdate[T](newValue: T, current: Option[T]): Option[T] = (newValue, current) match {
    case ("", None) => None
    case (nv, Some(curr)) if(nv == curr) => None
    case (nv, _) => Some(nv)
  }
}
