package idapiclient

import com.gu.identity.model._

/**
  * Represents up-to-date user data DTO that is serialised and posted to IDAPI
  */
case class UserUpdateDTO(
    primaryEmailAddress: Option[String] = None,
    publicFields: Option[PublicFields] = None,
    privateFields: Option[PrivateFields] = None,
    statusFields: Option[StatusFields] = None,
    dates: Option[UserDates] = None,
    password: Option[String] = None,
    userGroups: Option[Set[GroupMembership]] = None,
    socialLinks: Option[Set[SocialLink]] = None,
    adData: Option[Map[String, AnyRef]] = None,
    consents: Option[List[Consent]] = None,
)
