package conf

import com.gu.identity.cookie.{IdentityKeys, IdentityCookieDecoder}
import com.google.inject.Inject

class FrontendIdentityCookieDecoder @Inject()(keys: IdentityKeys) extends IdentityCookieDecoder(keys)
