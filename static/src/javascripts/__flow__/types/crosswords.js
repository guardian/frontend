type Direction = 'across' | 'down';

type Separator = '-' | ',';

type SeparatorDescription = {
    direction: Direction,
    separator: Separator,
};

type SeparatorMap = {
    [key: string]: SeparatorDescription,
};

type Position = {
    x: number,
    y: number,
};

type Cell = {
    number: number,
    isHighlighted: boolean,
    isEditable: boolean,
    isError: boolean,
    isAnimating: boolean,
    value: string,
};

type Clue = {
    id: string,
    group: Array<string>,
    clue: string,
    humanNumber: number,
    position: Position,
    separatorLocations: {
        [separator: Separator]: Array<number>,
    },
    direction: Direction,
    length: number,
    number: number,
    solution: string,
};

type CluesIntersect = {
    across?: Clue,
    down?: Clue,
};

type ClueMap = {
    [key: string]: CluesIntersect,
};
