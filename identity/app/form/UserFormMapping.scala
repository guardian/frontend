package form

import play.api.data.{Form, Mapping}
import com.gu.identity.model.User
import idapiclient.UserUpdateDTO
import play.api.i18n.MessagesProvider

trait UserFormMapping[T <: UserFormData] extends Mappings {

  type IdapiErrorContext = String
  type FormFieldKey = String

  /**
    * Returns a Form filled with existing UserFormData DTO value (as opposed to binding data from request)
    * which is in turn created from User DO from IDAPI.
    *
    * @param userDO User domain object from IDAPI defined in identity-model library
    * @param messagesProvider
    * @return Form filled with UserFormData DTO
    */
  def fillForm(userDO: User)(implicit messagesProvider: MessagesProvider): Form[T] =
    Form(formMapping) fill toUserFormData(userDO) // note the indirection where userDO is converted to UserFormData

  /**
    * Returns Form field key given IDAPI error context
    */
  def formFieldKeyBy(idapiErrorContext: IdapiErrorContext): String =
    idapiErrorContextToFormFieldKeyMap.getOrElse(idapiErrorContext, default = idapiErrorContext)

  def formMapping(implicit messagesProvider: MessagesProvider): Mapping[T]

  /**
    * Converts User domain object from IDAPI to form processing DTO
    *
    * @param userDO
    * @return form processing DTO
    */
  protected def toUserFormData(userDO: User): T

  /**
    * Mapping from IDAPI error context to Form field key
    */
  protected def idapiErrorContextToFormFieldKeyMap: Map[IdapiErrorContext, FormFieldKey]
}

/**
  * Trait to represent form specific Data Transfer Objects used for form data binding.
  * These DTOs are meant to represent parts of User Domain Object form
  */
trait UserFormData {

  /**
    * Converts User DO to UserUpdate DTO used for serialisation over wire
    */
  def toUserUpdateDTO(oldUserDO: User): UserUpdateDTO

  protected def toUpdate[T](newValue: T, current: Option[T]): Option[T] =
    (newValue, current) match {
      case ("", None)                       => None
      case (nv, Some(curr)) if (nv == curr) => None
      case (nv, _)                          => Some(nv)
    }
}
