package com.gu.fronts.endtoend.engine;

import hu.meza.aao.ScenarioContext;

public class TrailBlocks extends GenericManager<TrailBlock> {

    public TrailBlock get(String trailBlockLabel, ScenarioContext context) {
        TrailBlock trailBlock;
        if ("it".equals(trailBlockLabel)) {
            trailBlock = context.getSubject();
        } else {
            trailBlock = get(trailBlockLabel);
        }
        context.setSubject(trailBlock);
        return trailBlock;
    }

}
