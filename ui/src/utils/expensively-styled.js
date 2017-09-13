// @flow
import styled from 'preact-emotion';
import { css } from 'emotion';

const expensivelyStyled = (component, __expensiveStyle__) =>
    styled(component)`composes: ${__expensiveStyle__}`;

export { expensivelyStyled, css };
