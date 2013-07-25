package com.gu.test;

import org.junit.Test;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;

import static org.junit.Assert.assertEquals;

public class IsSiteResponding {
    protected static String HOST;

    static {

        // defaults to localhost
        HOST = (System.getProperty("host") != null && !System.getProperty("host").isEmpty())
                ? System.getProperty("host") : "http://localhost:9000";
    }
    public static int checkURLReturns(String url) throws IOException {

        URL server = new URL(url);
        Properties systemProperties = System.getProperties();
        if (System.getProperty("http_proxy") != null
                && !System.getProperty("http_proxy").isEmpty()) {
            URL proxyUrl = new URL(System.getProperty("http_proxy"));
            systemProperties.setProperty("http.proxyHost", proxyUrl.getHost());
// extract the port, or use the default
            int port = (proxyUrl.getPort() != -1) ? proxyUrl.getPort()
                    : proxyUrl.getDefaultPort();
            systemProperties.setProperty("http.proxyPort", Integer.toString(port));

        }

        HttpURLConnection connection = (HttpURLConnection) server
                .openConnection();
              connection.setRequestMethod("GET");
        connection.connect();

        return connection.getResponseCode();
    }

    @Test
    public void isNetworkFrontReturning200() throws IOException {
    assertEquals("expected 200, was " + checkURLReturns(HOST), 200, checkURLReturns(HOST));
    }




}
