// @flow
import { React } from '@guardian/dotcom-rendering/packages/guui';
import { formatTime } from './utils';

type Props = {
    t: number,
};

export default function Time({ t }: Props) {
    return <span>{formatTime(t)}</span>;
}
