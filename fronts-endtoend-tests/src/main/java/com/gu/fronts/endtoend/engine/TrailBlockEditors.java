package com.gu.fronts.endtoend.engine;

import hu.meza.aao.ActorManager;
import hu.meza.aao.DefaultScenarioContext;
import hu.meza.aao.ScenarioContext;

public class TrailBlockEditors extends ActorManager {

    private final DefaultScenarioContext ctx;

    public TrailBlockEditors(DefaultScenarioContext ctx) {
        this.ctx = ctx;
        addContext(ctx);
    }

    @Override
    public TrailBlockEditor getActor(String actorLabel) {
        return (TrailBlockEditor) super.getActor(actorLabel);
    }

    public TrailBlockEditor anyone() {
        return (TrailBlockEditor) lastActor();
    }

    public ScenarioContext ctx() {
        return ctx;
    }
}
