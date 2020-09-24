package controllers.editprofile

import com.gu.identity.model.User
import form._
import idapiclient.responses.Error
import model.IdentityPage
import play.api.data.Form
import play.api.i18n.MessagesProvider
import play.api.mvc.Request

/**
  * Holds all Edit Profile forms and designates which one is user currently viewing
  *
  * @param publicForm   /public/edit
  * @param accountForm  /account/edit
  * @param privacyForm  /privacy/edit
  * @param activePage   which page is user currently viewing and hence which form
  * @param profileFormsMapping Case class with mappings for all the forms
  */
case class ProfileForms(
    accountForm: Form[AccountFormData],
    privacyForm: Form[PrivacyFormData],
    activePage: IdentityPage,
)(implicit profileFormsMapping: ProfileFormsMapping) {

  lazy val activeForm = activePage match {
    case AccountEditProfilePage => accountForm
    case EmailPrefsProfilePage  => privacyForm
    case page                   => throw new RuntimeException(s"Unexpected page $page")
  }

  private lazy val activeMapping = activePage match {
    case AccountEditProfilePage => profileFormsMapping.accountDetailsMapping
    case EmailPrefsProfilePage  => profileFormsMapping.privacyMapping
    case page                   => throw new RuntimeException(s"Unexpected page $page")
  }

  /** Fills all Edit Profile forms (Public, Account, Privacy) with the provided User value */
  def bindForms(user: User)(implicit messagesProvider: MessagesProvider): ProfileForms = {
    copy(
      accountForm = profileFormsMapping.accountDetailsMapping.fillForm(user),
      privacyForm = profileFormsMapping.privacyMapping.fillForm(user),
    )
  }

  /**
    * Binds request data to currently active profile form, and re-maps address error to different key.
    * Note that other profile forms remain unchanged, which means they remain bound bound to
    * "old user form api" instance.
    */
  def bindFromRequestWithAddressErrorHack(implicit request: Request[_]): ProfileForms =
    transform { form =>
      // Hack to get the postcode error into the correct context.
      val boundForm = form.bindFromRequest()
      boundForm.error("address") map { e =>
        boundForm.withError(e.copy(key = "address.postcode"))
      } getOrElse boundForm
    }

  /** Adds errors to the form */
  def withErrors(idapiErrors: List[Error]): ProfileForms = {
    transform { form =>
      idapiErrors.foldLeft(form) { (formWithErrors, idapiError) =>
        val formErrorFieldKey = activeMapping.formFieldKeyBy(idapiError.context getOrElse "")
        formWithErrors.withError(formErrorFieldKey, idapiError.description)
      }
    }
  }

  /**
    * Create a copy of ProfileForms with applied change to the currently active form
    *
    * @param changeFunc function that takes currently active form and returns a modified version of the form
    * @return copy of ProfileForms with applied change to the currently active form
    */
  private def transform(changeFunc: (Form[_ <: UserFormData]) => Form[_ <: UserFormData]): ProfileForms = {
    activePage match {
      case AccountEditProfilePage => copy(accountForm = changeFunc(accountForm).asInstanceOf[Form[AccountFormData]])
      case EmailPrefsProfilePage  => copy(privacyForm = changeFunc(privacyForm).asInstanceOf[Form[PrivacyFormData]])
      case page                   => throw new RuntimeException(s"Unexpected page $page")
    }
  }
}

object ProfileForms {

  /**
    * Constructs ProfileForms instance by filling all the Edit Profile forms (Public, Account, Privacy)
    * with the corresponding DTO that will be constructed out of the provided User DO
    *
    * @param userDO User domain object from IDAPI used to create per-form specialised DTO fillers
    * @param activePage Which page is user currently viewing
    * @param profileFormsMapping Case class with mappings for all the forms
    * @return instance of ProfileForms having all the forms bound to their respective specialised DTO
    */
  def apply(userDO: User, activePage: IdentityPage)(implicit
      profileFormsMapping: ProfileFormsMapping,
      messagesProvider: MessagesProvider,
  ): ProfileForms = {

    ProfileForms(
      accountForm = profileFormsMapping.accountDetailsMapping.fillForm(userDO),
      privacyForm = profileFormsMapping.privacyMapping.fillForm(userDO),
      activePage = activePage,
    )

  }

}
