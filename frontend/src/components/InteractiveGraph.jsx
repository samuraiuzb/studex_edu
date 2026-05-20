import React, { useEffect } from 'react';
import { Mafs, Coordinates, Line, Theme, useMovablePoint } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function InteractiveGraph({ onChange, initialP1 = [0, -1], initialP2 = [1, 1], readOnly = false }) {
    const point1 = useMovablePoint(initialP1);
    const point2 = useMovablePoint(initialP2);

    useEffect(() => {
        if (!readOnly && onChange) {
            if (point1.x !== point2.x) {
                let m = (point2.y - point1.y) / (point2.x - point1.x);
                let c = point1.y - m * point1.x;
                // Stringify simple equation like "2x-1" roughly
                // But for backend comparison, it's safer to compare the string they constructed.
                // For gamification, we'll store selected_text as exactly "m={m},c={c}" to compare easily if needed.
                // Or better yet, we simply serialize it to let backend parse, or let backend evaluate text
                onChange(`m=${m.toFixed(2)},c=${c.toFixed(2)}`);
            }
        }
    }, [point1.x, point1.y, point2.x, point2.y]);

    return (
        <Mafs height={300} viewBox={{ x: [-5, 5], y: [-5, 5] }}>
            <Coordinates.Cartesian />
            <Line.ThroughPoints point1={point1.element} point2={point2.element} color={Theme.blue} />
            {!readOnly && point1.element}
            {!readOnly && point2.element}
        </Mafs>
    );
}
