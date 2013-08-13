package com.gu.fronts.endtoend.engine;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GenericManager<T extends Managable> implements Iterable<T> {

    private Map<String, T> items;
    private String lastLabel = "";

    public GenericManager() {
        items = new ConcurrentHashMap<>();
    }

    public T get(String label) {

        if (!items.containsKey(label)) {
            throw new ItemNotFoundException(label);
        }

        setLast(label);
        return items.get(label);
    }

    public T add(T trailBlock) {

        String label = trailBlock.getName();
        items.put(label, trailBlock);
        setLast(label);
        return trailBlock;
    }

    public T last() {
        if (items.isEmpty()) {
            throw new ManagerIsEmptyException();
        }
        return get(lastLabel);
    }

    @Override
    public Iterator<T> iterator() {
        List<T> actorList = new ArrayList<>();

        for (Map.Entry<String, T> entry : items.entrySet()) {
            actorList.add(entry.getValue());
        }

        return actorList.iterator();

    }

    private synchronized void setLast(String label) {
        lastLabel = label;
    }

}
