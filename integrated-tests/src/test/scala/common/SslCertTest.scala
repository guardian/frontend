package common

import org.scalatest.tags.Retryable
import org.scalatest.FlatSpec
import javax.net.ssl._
import java.security.{cert, SecureRandom}
import java.net.{ProtocolException, MalformedURLException, URL}
import org.joda.time.{Days, DateTime}
import java.io.IOException
import sun.security.x509.X509CertImpl

@Retryable class SslCertTest extends FlatSpec     {

  val trustManager = Array[TrustManager](new NativeTrustMananger())

  val ctx = SSLContext.getInstance("TLS")
  ctx.init(new Array[KeyManager](0), trustManager, new SecureRandom())
  SSLContext.setDefault(ctx)

  val hosts = List(
    "https://beacon.guim.co.uk",
    "https://profile.theguardian.com",
    "https://fronts.gutools.co.uk"
  )

  "SSL Certs" should "Be more than 30 days outside of their expiry time"  in {

    for ( host <- hosts ) {
      try {
        val url = new URL(host)
        val conn = url.openConnection().asInstanceOf[HttpsURLConnection]
        conn.setHostnameVerifier(new HostnameVerifier {
            override def verify(arg1: String, arg2: SSLSession) = true
          }
        )
        conn.connect()

        val certs = conn.getServerCertificates
        certs.headOption.map {
          cert => val x = cert.asInstanceOf[X509CertImpl]
            val expiry = x.getNotAfter.getTime

            val daysleft = Days.daysBetween(new DateTime(), new DateTime(expiry.toLong)).getDays
            if ( daysleft < 30) {
               fail("Cert for %s expires in %d days".format(host, daysleft))
            }

        }
        conn.disconnect()

      } catch {
        case e: MalformedURLException => {
          fail("Malformed url exception attempting to check ssl cert for %s, exception: %s".format(host, e.getMessage))
        }
        case e: ProtocolException => {
          fail("Protocol exception attempting to check ssl cert for %s, exception: %s".format(host, e.getMessage))
        }
        case e: IllegalStateException => {
          fail("IllegalStateException exception attempting to check ssl cert for %s, exception: %s".format(host, e.getMessage))
        }
        case e: NullPointerException => {
          fail("NullPointerException attempting to check ssl cert for %s, exception: %s".format(host, e.getMessage))
        }
        case e: IOException => {
          fail("IOexception attempting to check ssl cert for %s, exception: %s".format(host, e.getMessage))
        }
      }
    }
  }
}

class NativeTrustMananger extends X509TrustManager {
  override def getAcceptedIssuers = null

  override def checkClientTrusted(p1: Array[cert.X509Certificate], p2: String) = {}

  override def checkServerTrusted(p1: Array[cert.X509Certificate], p2: String) = {}
}