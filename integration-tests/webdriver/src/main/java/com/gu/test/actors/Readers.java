package com.gu.test.actors;

import hu.meza.aao.Actor;
import hu.meza.aao.ActorManager;


public class Readers extends ActorManager{

    public Reader getReader(String actorLabel){
        return (Reader) getActor(actorLabel);
    }

    @Override
    public Actor lastActor() {
        return (Reader) super.lastActor();
    }
}
