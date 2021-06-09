package services

object InteractivesArchiver {
  /*
    This object was introduced in June 2021, to support the idea that we could possibly serve some interactives from a flat, possibly cleaned, version in S3.
   */

  def commitToS3(s3path: String, document: String): Unit = {
    // we store the document at this path on S3, we should put both the "original/full" version and a cleaned version
    println(s"storing document at path: ${s3path}")
    S3ArchiveOriginals.putPublic(s3path, document, "text/html")
    ()
  }

  def retrieveFromS3(path: String): Option[String] = {
    // Here we retrieve the cleaned version.
    Some(s"Retrived document at path ${path}")
  }
}
