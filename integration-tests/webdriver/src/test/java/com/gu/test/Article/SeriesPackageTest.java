package com.gu.test.Article;


import static com.gu.test.PropertyLoader.getProperty;
import com.gu.test.SeleniumTestCase;
import com.gu.test.pages.Article;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class SeriesPackageTest extends SeleniumTestCase {
    Article testArticle;
    private String seriesArticle = getProperty("articleWithSeries");

    @Before
    public void setUp() throws Exception {
        super.setUp();
        testArticle = pageHelper.goToArticle(seriesArticle);
    }

    @Test
    public void articleHasSeriesHeader() throws Exception {
        String textLabel = testArticle.getSeriesLabel();
        Assert.assertTrue("Failure: series header missing", textLabel.equals("Series"));
    }

    @Test
    public void articleHasSeriesComponent() throws Exception {
        Assert.assertTrue("Failure: Series component not found", testArticle.hasSeriesComponent());
    }

}
