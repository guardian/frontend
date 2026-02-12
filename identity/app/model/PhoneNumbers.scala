package model

import com.google.i18n.phonenumbers.PhoneNumberUtil
import scala.jdk.CollectionConverters._

object PhoneNumbers {

  val phoneNumberUtil = PhoneNumberUtil.getInstance()

  val countryCodes: List[Integer] =
    this.phoneNumberUtil.getSupportedCallingCodes().asScala.toList.sorted

}
