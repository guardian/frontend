package com.gu.test;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class Config {

    Properties prop = config("config.properties");
    Properties secret = config("secret.properties");

    public static Properties config(String name) {
        Properties prop = new Properties();
        FileInputStream in;
        try {
            in = new FileInputStream(name);
            prop.load(in);
            in.close();
        } catch (IOException e) {
            throw new RuntimeException("couldn't read", e);
        }
        return prop;
    }

    public String getHubUrl() {
        return secret.getProperty("hubUrl");
    }

    public String getBaseUrl() {
        return prop.getProperty("baseUrl");
    }

    public String getTestCard() {
        return prop.getProperty("testCard");
    }

    public String getArticleWithSeries() {
        return prop.getProperty("articleWithSeries");
    }

    public String getArticleWithComments() {
        return prop.getProperty("articleWithComments");
    }

    public String getArticleWithTweets() {
        return prop.getProperty("articleWithTweets");
    }

    public String getArticleLiveBlog() {
        return prop.getProperty("articleLiveBlog");
    }
}