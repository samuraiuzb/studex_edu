import React from 'react';
import { Mafs, Coordinates, Plot, Theme } from 'mafs';
import * as math from 'mathjs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function FunctionPlot({ equation }) {
    // Renders a static math graph based on a string equation like "x^2 - 4"
    return (
        <Mafs height={300} viewBox={{ x: [-5, 5], y: [-5, 5] }}>
            <Coordinates.Cartesian />
            <Plot.OfX y={(x) => {
                try {
                    // evaluate equation
                    return math.evaluate(equation, { x });
                } catch (e) {
                    return 0;
                }
            }} color={Theme.red} />
        </Mafs>
    );
}
