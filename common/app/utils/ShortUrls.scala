package utils

object ShortUrls {
  def shortUrlToShortId(shortUrl: String): String = {
    /*
        Date: 09nd Dec 2020
        id: 288767d7-ba82-4d67-8fb3-9139e67b0f2e

        CAPI is moving from

        from
          https://gu.com/p/abc

        to
          https://www.theguardian.com/p/abc

        for "short" urls (https://github.com/guardian/content-api/pull/2547).

        Introducing this to handle gracefully both the old and new convention without having to
        worry when the change will actually happen. This function can be simplified in the future when the migration
        has completed.
     */
    shortUrl
      .replaceFirst("^[a-zA-Z]+://gu.com/", "")
      .replaceFirst("^[a-zA-Z]+://www.theguardian.com/", "")
  }
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }
  def shortUrlToShortIdWithStartingForwardSlash(shortUrl: String): String =
    ensureStartingForwardSlash(shortUrlToShortId(shortUrl))
}
