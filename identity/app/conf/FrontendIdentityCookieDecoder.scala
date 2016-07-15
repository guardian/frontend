package conf

import com.gu.identity.cookie.{IdentityKeys, IdentityCookieDecoder}

class FrontendIdentityCookieDecoder(keys: IdentityKeys) extends IdentityCookieDecoder(keys)
