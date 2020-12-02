package utils

object ShortUrls {
  def shortUrlToShortId(shortUrl: String): String = {
    /*
        Date: 02nd Dec 2020
        id: 288767d7-ba82-4d67-8fb3-9139e67b0f2e

        CAPI (recently) announced that we would be moving

        from
          https://gu.com/p/abc

        to
          https://theguardian.com/p/abc

        for "short" urls.

        Introducing this to handle gracefully both the old and new convention without having to
        worry when the change will actually happen. This function can be simplified in the future when the migration
        has completed.
     */
    shortUrl
      .replaceFirst("^[a-zA-Z]+://gu.com/", "")
      .replaceFirst("^[a-zA-Z]+://theguardian.com/", "")
  }
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }
  def shortUrlToShortIdWithStartingForwardSlash(shortUrl: String): String =
    ensureStartingForwardSlash(shortUrlToShortId(shortUrl))
}
