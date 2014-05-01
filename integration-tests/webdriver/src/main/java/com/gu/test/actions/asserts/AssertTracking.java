package com.gu.test.actions.asserts;

import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import org.junit.Assert;

import java.util.List;

public class AssertTracking {

	public void existsForComponent(String dataComponentName, List<LoggedRequest> requests) {
		boolean contains = false;
		for (LoggedRequest request : requests) {
			if (request.getUrl().contains("referringComponent=" + dataComponentName)) {
				contains = true;
			}
		}

		Assert.assertTrue(
			"None of the requests made contain the tracking " + "information",
			contains);
	}

    public void existsOnButtonClick(String dataComponentName, List<LoggedRequest> requests){
        boolean contains = false;
        for (LoggedRequest request : requests) {
            if (request.getUrl().contains("oid=" + dataComponentName)) {
                contains = true;
            }
        }

        Assert.assertTrue(
                "None of the requests made contain the tracking " + "information",
                contains);
    }

}
