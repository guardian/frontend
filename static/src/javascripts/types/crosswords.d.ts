type Direction = "across" | "down";

type Separator = "-" | ",";

type Axis = "x" | "y";

type SeparatorDescription = {
    direction: Direction;
    separator: Separator;
};

type SeparatorMap = {
    [key: string]: SeparatorDescription;
};

type SeparatorLocations = {[separator in Separator]?: Array<number>};

type Position = {[axis in Axis]?: number};

type Cell = {
    number: number | string;
    isHighlighted: boolean;
    isEditable: boolean;
    isError: boolean;
    isAnimating: boolean;
    value: string;
};

type Grid = Array<Array<Cell>>;

type Clue = {
    id: string;
    number: number | string;
    humanNumber: number | string;
    group: Array<string>;
    clue: string;
    position: Position;
    separatorLocations: SeparatorLocations;
    direction: Direction;
    length: number;
    solution: string;
};

type GroupClue = {
    id: string;
    number: (number | null | undefined) | (string | null | undefined);
    length: number;
    separatorLocations: SeparatorLocations;
    direction: "";
    clue: string | null | undefined;
};

type CluesIntersect = {
    across?: Clue;
    down?: Clue;
};

type ClueMap = {
    [key: string]: CluesIntersect;
};
