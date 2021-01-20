package form

import com.gu.identity.model.{PrivateFields, User}
import org.scalatest.{Matchers, FunSuite}

class AccountFormData$Test extends FunSuite with Matchers {

  test("if no billing address present in the ID API for a given user than don't populate the form field") {
    val user: User = User(
      "",
      "",
      privateFields = PrivateFields(
        billingAddress1 = None,
        billingAddress2 = None,
        billingAddress3 = None,
        billingAddress4 = None,
        billingCountry = None,
        billingPostcode = None,
      ),
    )

    AccountFormData(user).billingAddress should equal(None)
  }

  test("if at list one billing address field present in the ID API for a given user than populate the form field") {
    val user: User = User(
      "",
      "",
      privateFields = PrivateFields(
        billingAddress1 = Some("address 1"),
        billingAddress2 = None,
        billingAddress3 = None,
        billingAddress4 = None,
        billingCountry = None,
        billingPostcode = None,
      ),
    )

    AccountFormData(user).billingAddress should equal(Some(AddressFormData("address 1", "", "", "", "", "")))
  }

}
