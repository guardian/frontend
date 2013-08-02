package com.gu.fronts.endtoend.engine;

import hu.meza.aao.RestfulAction;
import hu.meza.tools.HttpClientWrapper;

public interface TrailBlockAction extends RestfulAction {

	void useClient(HttpClientWrapper client);

	boolean success();

}
