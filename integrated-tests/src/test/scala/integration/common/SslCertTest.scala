package integration.common

import java.io.IOException
import java.net.{MalformedURLException, ProtocolException, URL}
import java.security.{SecureRandom, cert}
import javax.net.ssl._

import org.joda.time.{DateTime, Days}
import org.scalatest.{DoNotDiscover, FlatSpec}
import sun.security.x509.X509CertImpl

@DoNotDiscover class SslCertTest extends FlatSpec {

  val trustManager = Array[TrustManager](new NativeTrustMananger())

  val ctx = SSLContext.getInstance("TLS")
  ctx.init(new Array[KeyManager](0), trustManager, new SecureRandom())
  SSLContext.setDefault(ctx)

  // NOTE - do not include self signed certificates. they do not cut the mustard
  // Also do not include hosts that are unreachable (e.g. inside the firewall)
  private val webTeamHosts = Seq(
    "api.nextgen.guardianapps.co.uk",
    "i.guim.co.uk",
    "beacon.guim.co.uk",
    "profile.theguardian.com",
    "fronts.gutools.co.uk",
    "fronts.code.dev-gutools.co.uk"
  )

  private val ophanHosts = Seq(
    "ophan.theguardian.com"
  )

  private val hosts = webTeamHosts ++ ophanHosts

  "SSL Certs" should "Be more than 30 days outside of their expiry time"  in {

    for ( host <- hosts ) {
      try {
        val url = new URL(s"https://$host")
        val conn = url.openConnection().asInstanceOf[HttpsURLConnection]
        conn.setHostnameVerifier(new HostnameVerifier {
            override def verify(hostnameVerifier: String, sslSession: SSLSession) = true
          }
        )

        conn.connect()
        val certs = conn.getServerCertificates
        certs.headOption.foreach { cert =>
          val x = cert.asInstanceOf[X509CertImpl]
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
