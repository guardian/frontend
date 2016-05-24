package controllers

import actions.AuthenticatedActions
import client.Auth
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model._
import form.{ProfileMapping, PrivacyMapping, AccountDetailsMapping, ProfileFormsMapping}
import idapiclient.{TrackingData, _}
import model.{PhoneNumbers, Countries}
import org.mockito.Mockito._
import org.mockito.{Matchers, ArgumentCaptor}
import org.scalatest.{DoNotDiscover, WordSpec, ShouldMatchers, OptionValues}
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play.ConfiguredServer
import play.api.mvc._
import play.api.test.Helpers._
import services._
import test._
import scala.concurrent.Future

//TODO test form validation and population of form fields.
@DoNotDiscover class EditProfileControllerTest extends WordSpec with ShouldMatchers with MockitoSugar with OptionValues with ConfiguredServer {

  lazy val csrfAddToken = app.injector.instanceOf[play.filters.csrf.CSRFAddToken]
  lazy val csrfCheck = app.injector.instanceOf[play.filters.csrf.CSRFCheck]

  trait EditProfileFixture {

    val idUrlBuilder = mock[IdentityUrlBuilder]
    val api = mock[IdApiClient]
    val idRequestParser = mock[IdRequestParser]
    val authService = mock[AuthenticationService]
    val idRequest = mock[IdentityRequest]
    val trackingData = mock[TrackingData]

    val userId: String = "123"
    val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
    val testAuth = ScGuU("abc", GuUCookieData(user, 0, None))
    val authenticatedUser = AuthenticatedUser(user, testAuth)
    val phoneNumbers = PhoneNumbers

    val authenticatedActions = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder])

    val messagesApi = I18NTestComponents.messagesApi
    val profileFormsMapping = ProfileFormsMapping(
      new AccountDetailsMapping(messagesApi),
      new PrivacyMapping(messagesApi),
      new ProfileMapping(messagesApi)
    )

    when(authService.authenticatedUserFor(Matchers.any[RequestHeader])) thenReturn Some(authenticatedUser)
    when(api.me(testAuth)) thenReturn Future.successful(Right(user))

    when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
    when(idRequest.trackingData) thenReturn trackingData
    when(idRequest.returnUrl) thenReturn None

    lazy val controller = new EditProfileController(idUrlBuilder, authenticatedActions, api, idRequestParser, messagesApi, csrfCheck, profileFormsMapping)
  }

  "EditProfileController" when {
    "submitPublicProfileForm method is called with a valid CSRF request" should {
      val location = "Test location"
      val aboutMe = "Interesting"
      val interests = "Other interesting things"

      "save the user through the ID API" in new EditProfileFixture {

        val fakeRequest = FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            "location" -> location,
            "aboutMe" -> aboutMe,
            "interests" -> interests
          )

        val updatedUser = user.copy(
          publicFields = PublicFields(
            location = Some(location),
            aboutMe = Some(aboutMe),
            interests = Some(interests)
          )
        )
        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitPublicProfileForm().apply(fakeRequest)

        status(result) should be(200)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.publicFields.value.location.value should equal(location)
        userUpdate.publicFields.value.aboutMe.value should equal(aboutMe)
        userUpdate.publicFields.value.interests.value should equal(interests)
      }
    }


    "submitPrivacyForm method is called with a valid CSRF request" should {
      val receive3rdPartyMarketing = false
      val receiveGnmMarketing = true
      val allowThirdPartyProfiling = false

      "then the user should be saved on the ID API" in new EditProfileFixture {
        val fakeRequest = FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            "receiveGnmMarketing" -> receiveGnmMarketing.toString,
            "receive3rdPartyMarketing" -> receive3rdPartyMarketing.toString,
            "allowThirdPartyProfiling" -> allowThirdPartyProfiling.toString
          )

        val updatedUser = user.copy(
          statusFields = StatusFields(
            receiveGnmMarketing = Some(receiveGnmMarketing),
            receive3rdPartyMarketing = Some(receive3rdPartyMarketing)
          )
        )
        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitPrivacyForm().apply(fakeRequest)

        status(result) should be(200)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.statusFields.value.receive3rdPartyMarketing.value should equal(receive3rdPartyMarketing)
        userUpdate.statusFields.value.receiveGnmMarketing.value should equal(receiveGnmMarketing)
        userUpdate.statusFields.value.allowThirdPartyProfiling.value should equal(allowThirdPartyProfiling)
      }
    }

    "The submitAccountForm method" should {
      object FakeRequestAccountData {
        val primaryEmailAddress = "john.smith@bobmail.com"
        val testTitle = "Mr"
        val firstName = "John"
        val secondName = "Smith"
        val gender = "Male"
        val address1 = "10 Downing Street"
        val address2 = "London"
        val address3 = ""
        val address4 = ""
        val postcode = "N1 9GU"
        val country = Countries.UK
        val billingAddress1 = "Buckingham Palace"
        val billingAddress2 = "London"
        val billingAddress3 = ""
        val billingAddress4 = ""
        val billingPostcode = "SW1A 1AA"
        val billingCountry = Countries.UK
        val telephoneNumberCountryCode = "44"
        val telephoneNumberLocalNumber = "2033532000"
      }

      import FakeRequestAccountData._

      def createFakeRequestWithoutBillingAddress = {

        import FakeRequestAccountData._

        FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            ("primaryEmailAddress", primaryEmailAddress),
            ("title", testTitle),
            ("firstName", firstName),
            ("secondName", secondName),
            ("gender", gender),
            ("address.line1", address1),
            ("address.line2", address2),
            ("address.line3", address3),
            ("address.line4", address4),
            ("address.postcode", postcode),
            ("address.country", country),
            ("telephoneNumber.countryCode", telephoneNumberCountryCode),
            ("telephoneNumber.localNumber", telephoneNumberLocalNumber)
          )

      }

      def createFakeRequestWithoutTelephoneNumber = {

        import FakeRequestAccountData._

        FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            ("primaryEmailAddress", primaryEmailAddress),
            ("title", testTitle),
            ("firstName", firstName),
            ("secondName", secondName),
            ("gender", gender),
            ("address.line1", address1),
            ("address.line2", address2),
            ("address.line3", address3),
            ("address.line4", address4),
            ("address.postcode", postcode),
            ("address.country", country)
          )

      }

      def createFakeRequestDeleteTelephoneNumber = {

        import FakeRequestAccountData._

        FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            ("primaryEmailAddress", primaryEmailAddress),
            ("title", testTitle),
            ("firstName", firstName),
            ("secondName", secondName),
            ("gender", gender),
            ("address.line1", address1),
            ("address.line2", address2),
            ("address.line3", address3),
            ("address.line4", address4),
            ("address.postcode", postcode),
            ("address.country", country),
            ("deleteTelephoneNumber", "true")
          )
      }


      def createFakeRequestWithBillingAddress = {

        import FakeRequestAccountData._

        FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            ("primaryEmailAddress", primaryEmailAddress),
            ("title", testTitle),
            ("firstName", firstName),
            ("secondName", secondName),
            ("gender", gender),
            ("address.line1", address1),
            ("address.line2", address2),
            ("address.line3", address3),
            ("address.line4", address4),
            ("address.postcode", postcode),
            ("address.country", country),
            ("billingAddress.line1", billingAddress1),
            ("billingAddress.line2", billingAddress2),
            ("billingAddress.line3", billingAddress3),
            ("billingAddress.line4", billingAddress4),
            ("billingAddress.postcode", billingPostcode),
            ("billingAddress.country", billingCountry),
            ("telephoneNumber.countryCode", telephoneNumberCountryCode),
            ("telephoneNumber.localNumber", telephoneNumberLocalNumber)
          )

      }

      "return 200 if called with a valid CSRF request" in new EditProfileFixture {
        val fakeRequest = createFakeRequestWithBillingAddress

        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(user)))

        val result = controller.submitAccountForm().apply(fakeRequest)
        status(result) should be(200)
      }

      "save the user with the ID API without billing address request" in new EditProfileFixture {
        val fakeRequest = createFakeRequestWithoutBillingAddress

        val updatedUser = user.copy(
          primaryEmailAddress = primaryEmailAddress,
          privateFields = PrivateFields(
            title = Some(testTitle),
            firstName = Some(firstName),
            secondName = Some(secondName),
            gender = Some(gender),
            address1 = Some(address1),
            address2 = Some(address2),
            address3 = Some(address3),
            address4 = Some(address4),
            postcode = Some(postcode),
            country = Some(country),
            telephoneNumber = Some(TelephoneNumber(Some(telephoneNumberCountryCode), Some(telephoneNumberLocalNumber)))
          )
        )

        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitAccountForm().apply(fakeRequest)
        status(result) should be(200)
        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.primaryEmailAddress.value should equal(primaryEmailAddress)
        userUpdate.privateFields.value.firstName.value should equal(firstName)
        userUpdate.privateFields.value.secondName.value should equal(secondName)
        userUpdate.privateFields.value.gender.value should equal(gender)
        userUpdate.privateFields.value.address1.value should equal(address1)
        userUpdate.privateFields.value.address2.value should equal(address2)
        userUpdate.privateFields.value.address3 should equal(None)
        userUpdate.privateFields.value.address4 should equal(None)
        userUpdate.privateFields.value.postcode.value should equal(postcode)
        userUpdate.privateFields.value.country.value should equal(country)
        userUpdate.privateFields.value.telephoneNumber.value should equal(TelephoneNumber(Some(telephoneNumberCountryCode), Some(telephoneNumberLocalNumber)))
      }

      "delete a telephone number with a delete telephone number request" in new EditProfileFixture {
        val fakeRequest = createFakeRequestDeleteTelephoneNumber

        when(api.deleteTelephone(Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(())))

        val result = controller.submitAccountForm().apply(fakeRequest)
        status(result) should be(200)

        verify(api).deleteTelephone(Matchers.eq(testAuth))
      }

      "save the user on the ID API without telephone number request" in new EditProfileFixture {
        val fakeRequest = createFakeRequestWithoutTelephoneNumber

        val updatedUser = user.copy(
          primaryEmailAddress = primaryEmailAddress,
          privateFields = PrivateFields(
            title = Some(testTitle),
            firstName = Some(firstName),
            secondName = Some(secondName),
            gender = Some(gender),
            address1 = Some(address1),
            address2 = Some(address2),
            address3 = Some(address3),
            address4 = Some(address4),
            postcode = Some(postcode),
            country = Some(country)
          )
        )

        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitAccountForm().apply(fakeRequest)
        status(result) should be(200)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.primaryEmailAddress.value should equal(primaryEmailAddress)
        userUpdate.privateFields.value.title.value should equal(testTitle)
        userUpdate.privateFields.value.firstName.value should equal(firstName)
        userUpdate.privateFields.value.secondName.value should equal(secondName)
        userUpdate.privateFields.value.gender.value should equal(gender)
        userUpdate.privateFields.value.address1.value should equal(address1)
        userUpdate.privateFields.value.address2.value should equal(address2)
        userUpdate.privateFields.value.address3 should equal(None)
        userUpdate.privateFields.value.address4 should equal(None)
        userUpdate.privateFields.value.postcode.value should equal(postcode)
        userUpdate.privateFields.value.country.value should equal(country)
      }

      "save the user on the ID API with billing address" in new EditProfileFixture {
        val fakeRequest = createFakeRequestWithBillingAddress

        val updatedUser = user.copy(
          primaryEmailAddress = primaryEmailAddress,
          privateFields = PrivateFields(
            title = Some(testTitle),
            firstName = Some(firstName),
            secondName = Some(secondName),
            gender = Some(gender),
            address1 = Some(address1),
            address2 = Some(address2),
            address3 = Some(address3),
            address4 = Some(address4),
            postcode = Some(postcode),
            country = Some(country),
            billingAddress1 = Some(billingAddress1),
            billingAddress2 = Some(billingAddress2),
            billingAddress3 = Some(billingAddress3),
            billingAddress4 = Some(billingAddress4),
            billingPostcode = Some(billingPostcode),
            billingCountry = Some(billingCountry),
            telephoneNumber = Some(TelephoneNumber(Some(telephoneNumberCountryCode), Some(telephoneNumberLocalNumber)))
          )
        )

        when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitAccountForm().apply(fakeRequest)
        status(result) should be(200)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.primaryEmailAddress.value should equal(primaryEmailAddress)
        userUpdate.privateFields.value.title.value should equal(testTitle)
        userUpdate.privateFields.value.firstName.value should equal(firstName)
        userUpdate.privateFields.value.secondName.value should equal(secondName)
        userUpdate.privateFields.value.gender.value should equal(gender)
        userUpdate.privateFields.value.address1.value should equal(address1)
        userUpdate.privateFields.value.address2.value should equal(address2)
        userUpdate.privateFields.value.address3 should equal(None)
        userUpdate.privateFields.value.address4 should equal(None)
        userUpdate.privateFields.value.postcode.value should equal(postcode)
        userUpdate.privateFields.value.country.value should equal(country)
        userUpdate.privateFields.value.billingAddress1.value should equal(billingAddress1)
        userUpdate.privateFields.value.billingAddress2.value should equal(billingAddress2)
        userUpdate.privateFields.value.billingAddress3 should equal(None)
        userUpdate.privateFields.value.billingAddress4 should equal(None)
        userUpdate.privateFields.value.billingPostcode.value should equal(billingPostcode)
        userUpdate.privateFields.value.billingCountry.value should equal(billingCountry)
        userUpdate.privateFields.value.telephoneNumber.value should equal(TelephoneNumber(Some(telephoneNumberCountryCode), Some(telephoneNumberLocalNumber)))
      }
    }
  }
}
