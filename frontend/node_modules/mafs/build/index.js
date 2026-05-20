"use client";

// src/view/Mafs.tsx
import * as React12 from "react";

// src/context/CoordinateContext.tsx
import * as React from "react";
import invariant from "tiny-invariant";
var CoordinateContext = React.createContext(null);
CoordinateContext.displayName = "CoordinateContext";
function useCoordinateContext() {
  const context = React.useContext(CoordinateContext);
  invariant(
    context,
    "CoordinateContext is not loaded. Are you rendering a Mafs component outside of Mafs?"
  );
  return context;
}
var CoordinateContext_default = CoordinateContext;

// src/context/PaneContext.tsx
import * as React2 from "react";

// src/math.ts
function round(value, precision = 0) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
function range(min, max, step = 1) {
  const result = [];
  for (let i = min; i < max - step / 2; i += step) {
    result.push(i);
  }
  const computedMax = result[result.length - 1] + step;
  if (Math.abs(max - computedMax) < step / 1e-6) {
    result.push(max);
  } else {
    result.push(computedMax);
  }
  return result;
}
function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}
function computeAnchor(anchor, x, y, width, height) {
  let actualX = x;
  let actualY = y;
  switch (anchor) {
    case "tl":
      actualX = x;
      actualY = y;
      break;
    case "tc":
      actualX = x - width / 2;
      actualY = y;
      break;
    case "tr":
      actualX = x - width;
      actualY = y;
      break;
    case "cl":
      actualX = x;
      actualY = y + height / 2;
      break;
    case "cc":
      actualX = x - width / 2;
      actualY = y + height / 2;
      break;
    case "cr":
      actualX = x - width;
      actualY = y + height / 2;
      break;
    case "bl":
      actualX = x;
      actualY = y + height;
      break;
    case "bc":
      actualX = x - width / 2;
      actualY = y + height;
      break;
    case "br":
      actualX = x - width;
      actualY = y + height;
      break;
  }
  return [actualX, actualY];
}

// src/context/PaneContext.tsx
import { jsx } from "react/jsx-runtime";
var { round: round2, ceil, floor, log2 } = Math;
var PaneContext = React2.createContext({
  xPanes: [],
  yPanes: [],
  xPaneRange: [0, 0],
  yPaneRange: [0, 0]
});
PaneContext.displayName = "PaneContext";
function usePaneContext() {
  return React2.useContext(PaneContext);
}
function PaneManager({ children }) {
  const { xMin, xMax, yMin, yMax } = useCoordinateContext();
  const xPaneSize = 2 ** round2(log2(xMax - xMin) - 1);
  const yPaneSize = 2 ** round2(log2(yMax - yMin) - 1);
  const pad = 1 / 8;
  const xLowerBound = xPaneSize * floor(xMin / xPaneSize - pad);
  const xUpperBound = xPaneSize * ceil(xMax / xPaneSize + pad);
  const yLowerBound = yPaneSize * floor(yMin / yPaneSize - pad);
  const yUpperBound = yPaneSize * ceil(yMax / yPaneSize + pad);
  const xPanes = React2.useMemo(
    () => range(xLowerBound, xUpperBound - xPaneSize, xPaneSize).map(
      (xMin2) => [xMin2, xMin2 + xPaneSize]
    ),
    [xLowerBound, xUpperBound, xPaneSize]
  );
  const yPanes = React2.useMemo(
    () => range(yLowerBound, yUpperBound - yPaneSize, yPaneSize).map(
      (yMin2) => [yMin2, yMin2 + yPaneSize]
    ),
    [yLowerBound, yUpperBound, yPaneSize]
  );
  const context = React2.useMemo(
    () => ({
      xPanes,
      yPanes,
      xPaneRange: [xLowerBound, xUpperBound],
      yPaneRange: [yLowerBound, yUpperBound]
    }),
    [xPanes, yPanes, xLowerBound, xUpperBound, yLowerBound, yUpperBound]
  );
  return /* @__PURE__ */ jsx(PaneContext.Provider, { value: context, children });
}
PaneManager.displayName = "PaneManager";
var PaneContext_default = PaneManager;

// src/view/Mafs.tsx
import useResizeObserver from "use-resize-observer";
import { useGesture } from "@use-gesture/react";

// src/vec.ts
var vec;
((vec2) => {
  function add(v, v2) {
    return [v[0] + v2[0], v[1] + v2[1]];
  }
  vec2.add = add;
  function sub(v, v2) {
    return [v[0] - v2[0], v[1] - v2[1]];
  }
  vec2.sub = sub;
  function mag(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }
  vec2.mag = mag;
  function normal(v) {
    return [-v[1], v[0]];
  }
  vec2.normal = normal;
  function lerp(v1, v2, t) {
    const d = sub(v2, v1);
    const m = mag(d);
    return add(v1, withMag(d, t * m));
  }
  vec2.lerp = lerp;
  function withMag(v, m) {
    const magnitude = mag(v);
    return scale(v, m / magnitude);
  }
  vec2.withMag = withMag;
  function normalize(v) {
    return withMag(v, 1);
  }
  vec2.normalize = normalize;
  function scale(v, sc) {
    return [v[0] * sc, v[1] * sc];
  }
  vec2.scale = scale;
  function transform(v, m) {
    return [v[0] * m[0] + v[1] * m[1] + m[2], v[0] * m[3] + v[1] * m[4] + m[5]];
  }
  vec2.transform = transform;
  function matrixMult(m, m2) {
    return matrixCreate(
      m[0] * m2[0] + m[1] * m2[3],
      m[3] * m2[0] + m[4] * m2[3],
      m[0] * m2[1] + m[1] * m2[4],
      m[3] * m2[1] + m[4] * m2[4],
      m[0] * m2[2] + m[1] * m2[5] + m[2],
      m[3] * m2[2] + m[4] * m2[5] + m[5]
    );
  }
  vec2.matrixMult = matrixMult;
  function rotate(v, a) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
  }
  vec2.rotate = rotate;
  function rotateAbout(v, cp, a) {
    const v2 = sub(v, cp);
    return add(cp, rotate(v2, a));
  }
  vec2.rotateAbout = rotateAbout;
  function midpoint(v, v2) {
    return lerp(v, v2, 0.5);
  }
  vec2.midpoint = midpoint;
  function dist(v, v2) {
    return Math.sqrt(squareDist(v, v2));
  }
  vec2.dist = dist;
  function squareDist(v, v2) {
    return Math.pow(v2[0] - v[0], 2) + Math.pow(v2[1] - v[1], 2);
  }
  vec2.squareDist = squareDist;
  function dot(v, v2) {
    return v[0] * v2[0] + v[1] * v2[1];
  }
  vec2.dot = dot;
  function det(m) {
    return m[0] * m[4] - m[3] * m[1];
  }
  vec2.det = det;
  function matrixInvert(a) {
    const mDet = det(a);
    if (!mDet)
      return null;
    const invDet = 1 / mDet;
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    return matrixCreate(
      invDet * a11,
      invDet * -a10,
      invDet * -a01,
      invDet * a00,
      invDet * (a12 * a01 - a02 * a11),
      invDet * (-a12 * a00 + a02 * a10)
    );
  }
  vec2.matrixInvert = matrixInvert;
  function matrixBuilder(m = null) {
    const _m = m || matrixCreate();
    return {
      mult: (m2) => matrixBuilder(matrixMult(m2, _m)),
      translate: (x, y) => matrixBuilder(matrixMult(matrixCreate(1, 0, 0, 1, x, y), _m)),
      rotate: (a) => {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return matrixBuilder(matrixMult(matrixCreate(c, s, -s, c), _m));
      },
      scale: (x, y) => matrixBuilder(matrixMult(matrixCreate(x, 0, 0, y), _m)),
      shear: (x, y) => matrixBuilder(matrixMult(matrixCreate(1, y, x, 1), _m)),
      get: () => [..._m]
    };
  }
  vec2.matrixBuilder = matrixBuilder;
  function toCSS(matrix) {
    const [a, c, tx, b, d, ty] = matrix;
    return `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
  }
  vec2.toCSS = toCSS;
  vec2.identity = matrixBuilder().get();
})(vec || (vec = {}));
function matrixCreate(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
  return [a, c, tx, b, d, ty];
}

// src/context/TransformContext.tsx
import * as React3 from "react";
import invariant2 from "tiny-invariant";
var TransformContext = React3.createContext(null);
TransformContext.displayName = "TransformContext";
function useTransformContext() {
  const context = React3.useContext(TransformContext);
  invariant2(
    context,
    "TransformContext is not loaded. Are you rendering a Mafs component outside of a MafsView?"
  );
  return context;
}

// src/context/SpanContext.tsx
import * as React4 from "react";
import invariant3 from "tiny-invariant";
var SpanContext = React4.createContext({
  xSpan: 0,
  ySpan: 0
});
SpanContext.displayName = "SpanContext";
function useSpanContext() {
  const context = React4.useContext(SpanContext);
  invariant3(context, "SpanContext is not defined");
  return context;
}

// src/view/Mafs.tsx
import invariant5 from "tiny-invariant";

// src/gestures/useCamera.tsx
import * as React5 from "react";
function useCamera({ minZoom, maxZoom }) {
  const [matrix, setMatrix] = React5.useState(vec.identity);
  const initialMatrix = React5.useRef(vec.identity);
  return {
    matrix,
    setBase() {
      initialMatrix.current = matrix;
    },
    move({ zoom, pan }) {
      const scale = 1 / (zoom?.scale ?? 1);
      const zoomAt = zoom?.at ?? [0, 0];
      const currentScale = initialMatrix.current[0];
      const minScale = 1 / maxZoom / currentScale;
      const maxScale = 1 / minZoom / currentScale;
      const clampedScale = clamp(scale, minScale, maxScale);
      const newCamera = vec.matrixBuilder(initialMatrix.current).translate(...vec.scale(zoomAt, -1)).scale(clampedScale, clampedScale).translate(...vec.scale(zoomAt, 1)).translate(...pan ?? [0, 0]).get();
      setMatrix(newCamera);
    }
  };
}

// src/gestures/useWheelEnabler.tsx
import * as React6 from "react";
function useWheelEnabler(zoomEnabled) {
  const [wheelEnabled, setWheelEnabled] = React6.useState(false);
  const timer = React6.useRef(0);
  React6.useEffect(() => {
    if (!zoomEnabled)
      return;
    function handleWindowScroll() {
      setWheelEnabled(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setWheelEnabled(true);
      }, 500);
    }
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [zoomEnabled]);
  return {
    wheelEnabled: zoomEnabled ? wheelEnabled : false,
    handleMouseMove() {
      setWheelEnabled(true);
    }
  };
}

// src/context/TestContext.tsx
import * as React7 from "react";
var TestContext = React7.createContext({
  overrideHeight: void 0
});
var TestContextProvider = TestContext.Provider;

// src/debug/ViewportInfo.tsx
import { jsxs } from "react/jsx-runtime";
function ViewportInfo({ precision = 3 }) {
  const { xMin, xMax, yMin, yMax } = useCoordinateContext();
  const { viewTransform } = useTransformContext();
  const { xPanes, yPanes } = usePaneContext();
  const [x, y] = vec.transform([xMin, yMin], viewTransform);
  const xPanesString = xPanes.map((pane) => `(${pane.join(", ")})`).join("   ");
  const yPanesString = yPanes.map((pane) => `(${pane.join(", ")})`).join("   ");
  return /* @__PURE__ */ jsxs("g", { className: "mafs-shadow", fontFamily: "monospace", children: [
    /* @__PURE__ */ jsxs("text", { x: x + 10, y: y - 70, children: [
      "x: (",
      xMin.toFixed(precision),
      ", ",
      xMax.toFixed(precision),
      ")"
    ] }),
    /* @__PURE__ */ jsxs("text", { x: x + 10, y: y - 50, children: [
      "y: (",
      yMin.toFixed(precision),
      ", ",
      yMax.toFixed(precision),
      ")"
    ] }),
    /* @__PURE__ */ jsxs("text", { x: x + 10, y: y - 30, children: [
      "xPanes: ",
      xPanesString
    ] }),
    /* @__PURE__ */ jsxs("text", { x: x + 10, y: y - 10, children: [
      "yPanes: ",
      yPanesString
    ] })
  ] });
}
ViewportInfo.displayName = "Debug.ViewportInfo";

// src/display/Theme.ts
var Theme = {
  foreground: "var(--mafs-fg)",
  background: "var(--mafs-bg)",
  red: "var(--mafs-red)",
  orange: "var(--mafs-orange)",
  green: "var(--mafs-green)",
  blue: "var(--mafs-blue)",
  indigo: "var(--mafs-indigo)",
  violet: "var(--mafs-violet)",
  pink: "var(--mafs-pink)",
  yellow: "var(--mafs-yellow)"
};

// src/interaction/useMovablePoint.tsx
import * as React11 from "react";

// src/interaction/MovablePoint.tsx
import * as React10 from "react";

// src/interaction/useMovable.tsx
import * as React8 from "react";
import { useDrag } from "@use-gesture/react";
import invariant4 from "tiny-invariant";
function useMovable(args) {
  const { gestureTarget: target, onMove, point, constrain } = args;
  const [dragging, setDragging] = React8.useState(false);
  const { xSpan, ySpan } = useSpanContext();
  const { viewTransform, userTransform } = useTransformContext();
  const inverseViewTransform = vec.matrixInvert(viewTransform);
  invariant4(inverseViewTransform, "The view transform must be invertible.");
  const inverseTransform = React8.useMemo(() => getInverseTransform(userTransform), [userTransform]);
  const pickup = React8.useRef([0, 0]);
  useDrag(
    (state) => {
      const { type, event } = state;
      event?.stopPropagation();
      const isKeyboard = type.includes("key");
      if (isKeyboard) {
        event?.preventDefault();
        if (type === "keyup") {
          return;
        }
        const { direction: yDownDirection, altKey, metaKey, shiftKey } = state;
        const direction = [yDownDirection[0], -yDownDirection[1]];
        const span = Math.abs(direction[0]) ? xSpan : ySpan;
        let divisions = 50;
        if (altKey || metaKey)
          divisions = 200;
        if (shiftKey)
          divisions = 10;
        const min = span / (divisions * 2);
        const tests = range(span / divisions, span / 2, span / divisions);
        for (const dx of tests) {
          const testMovement = vec.scale(direction, dx);
          const testPoint = constrain(
            vec.transform(
              vec.add(vec.transform(point, userTransform), testMovement),
              inverseTransform
            )
          );
          if (vec.dist(testPoint, point) > min) {
            onMove(testPoint);
            break;
          }
        }
      } else {
        const { last, movement: pixelMovement, first } = state;
        setDragging(!last);
        if (first)
          pickup.current = vec.transform(point, userTransform);
        if (vec.mag(pixelMovement) === 0)
          return;
        const movement = vec.transform(pixelMovement, inverseViewTransform);
        onMove(constrain(vec.transform(vec.add(pickup.current, movement), inverseTransform)));
      }
    },
    { target, eventOptions: { passive: false } }
  );
  return { dragging };
}
function getInverseTransform(transform) {
  const invert = vec.matrixInvert(transform);
  invariant4(
    invert !== null,
    "Could not invert transform matrix. A parent transformation matrix might be degenerative (mapping 2D space to a line)."
  );
  return invert;
}

// src/display/MovablePointDisplay.tsx
import * as React9 from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var MovablePointDisplay = React9.forwardRef(
  (props, ref) => {
    const { color = Theme.pink, ringRadiusPx = 15, dragging, point } = props;
    const { viewTransform, userTransform } = useTransformContext();
    const combinedTransform = React9.useMemo(
      () => vec.matrixMult(viewTransform, userTransform),
      [viewTransform, userTransform]
    );
    const [xPx, yPx] = vec.transform(point, combinedTransform);
    return /* @__PURE__ */ jsxs2(
      "g",
      {
        ref,
        style: {
          "--movable-point-color": color,
          "--movable-point-ring-size": `${ringRadiusPx}px`
        },
        className: `mafs-movable-point ${dragging ? "mafs-movable-point-dragging" : ""}`,
        tabIndex: 0,
        children: [
          /* @__PURE__ */ jsx2("circle", { className: "mafs-movable-point-hitbox", r: 30, cx: xPx, cy: yPx }),
          /* @__PURE__ */ jsx2(
            "circle",
            {
              className: "mafs-movable-point-focus",
              r: ringRadiusPx + 1,
              cx: xPx,
              cy: yPx
            }
          ),
          /* @__PURE__ */ jsx2("circle", { className: "mafs-movable-point-ring", r: ringRadiusPx, cx: xPx, cy: yPx }),
          /* @__PURE__ */ jsx2("circle", { className: "mafs-movable-point-point", r: 6, cx: xPx, cy: yPx })
        ]
      }
    );
  }
);
MovablePointDisplay.displayName = "MovablePointDisplay";

// src/interaction/MovablePoint.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function MovablePoint({
  point,
  onMove,
  constrain = (point2) => point2,
  color = Theme.pink
}) {
  const ref = React10.useRef(null);
  const { dragging } = useMovable({ gestureTarget: ref, onMove, point, constrain });
  return /* @__PURE__ */ jsx3(MovablePointDisplay, { ref, point, color, dragging });
}
MovablePoint.displayName = "MovablePoint";

// src/interaction/useMovablePoint.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function useMovablePoint(initialPoint, { constrain, color = Theme.pink } = {}) {
  const [initialX, initialY] = initialPoint;
  const [point, setPoint] = React11.useState(initialPoint);
  const [x, y] = point;
  const constraintFunction = React11.useMemo(() => {
    if (constrain === "horizontal") {
      return ([x2]) => [x2, initialY];
    } else if (constrain === "vertical") {
      return ([, y2]) => [initialX, y2];
    } else if (typeof constrain === "function") {
      return constrain;
    }
    return ([x2, y2]) => [x2, y2];
  }, [constrain, initialX, initialY]);
  const element = React11.useMemo(() => {
    return /* @__PURE__ */ jsx4(MovablePoint, { ...{ point, color }, constrain: constraintFunction, onMove: setPoint });
  }, [point, color, constraintFunction]);
  return {
    x,
    y,
    point: [x, y],
    element,
    setPoint
  };
}

// src/display/Transform.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function Transform(props) {
  const { userTransform, viewTransform } = useTransformContext();
  let builder = vec.matrixBuilder();
  const { matrix, children, ...transforms } = props;
  if (matrix)
    builder = builder.mult(matrix);
  for (const [name, value] of Object.entries(transforms)) {
    if (value == null)
      continue;
    switch (name) {
      case "translate":
        builder = builder.translate(...value);
        break;
      case "scale":
        if (typeof value === "number")
          builder = builder.scale(value, value);
        else
          builder = builder.scale(...value);
        break;
      case "shear":
        builder = builder.shear(...value);
        break;
      case "rotate":
        builder = builder.rotate(value);
        break;
    }
  }
  builder = builder.mult(userTransform);
  const newUserTransform = builder.get();
  return /* @__PURE__ */ jsx5(TransformContext.Provider, { value: { userTransform: newUserTransform, viewTransform }, children: /* @__PURE__ */ jsx5("g", { style: { "--mafs-user-transform": vec.toCSS(newUserTransform) }, children }) });
}
Transform.displayName = "Transform";

// src/display/Ellipse.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
function Ellipse({
  center,
  radius,
  angle = 0,
  strokeStyle = "solid",
  strokeOpacity = 1,
  weight = 2,
  color = Theme.foreground,
  fillOpacity = 0.15,
  svgEllipseProps = {}
}) {
  const { viewTransform: toPx, userTransform } = useTransformContext();
  const transform = vec.matrixBuilder().translate(...center).mult(userTransform).scale(1, -1).mult(toPx).scale(1, -1).get();
  const cssTransform = `
    ${vec.toCSS(transform)}
    rotate(${angle * (180 / Math.PI)})
  `;
  return /* @__PURE__ */ jsx6(
    "ellipse",
    {
      cx: 0,
      cy: 0,
      rx: radius[0],
      ry: radius[1],
      strokeWidth: weight,
      transform: cssTransform,
      ...svgEllipseProps,
      style: {
        stroke: color,
        strokeDasharray: strokeStyle === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0,
        fill: color,
        fillOpacity,
        strokeOpacity,
        vectorEffect: "non-scaling-stroke",
        ...svgEllipseProps.style || {}
      }
    }
  );
}
Ellipse.displayName = "Ellipse";

// src/display/Circle.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
function Circle({ radius, ...rest }) {
  return /* @__PURE__ */ jsx7(Ellipse, { radius: [radius, radius], ...rest });
}
Circle.displayName = "Circle";

// src/display/PolyBase.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function PolyBase({
  element: PolyElement,
  points,
  color = Theme.foreground,
  weight = 2,
  fillOpacity = 0.15,
  strokeOpacity = 1,
  strokeStyle = "solid",
  svgPolyProps = {}
}) {
  const { userTransform } = useTransformContext();
  const scaledPoints = points.map((point) => vec.transform(point, userTransform).join(" ")).join(" ");
  return /* @__PURE__ */ jsx8(
    PolyElement,
    {
      points: scaledPoints,
      strokeWidth: weight,
      fillOpacity,
      strokeLinejoin: "round",
      ...svgPolyProps,
      style: {
        fill: color,
        fillOpacity,
        stroke: color,
        strokeDasharray: strokeStyle === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0,
        strokeOpacity,
        vectorEffect: "non-scaling-stroke",
        transform: "var(--mafs-view-transform)",
        ...svgPolyProps.style || {}
      }
    }
  );
}

// src/display/Polygon.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
function Polygon({ svgPolygonProps, ...otherProps }) {
  return /* @__PURE__ */ jsx9(PolyBase, { element: "polygon", svgPolyProps: svgPolygonProps, ...otherProps });
}
Polygon.displayName = "Polygon";

// src/debug/TransformWidget.tsx
import { Fragment, jsx as jsx10, jsxs as jsxs3 } from "react/jsx-runtime";
function TransformWidget({ children }) {
  const t = useMovablePoint([0, 0]);
  const s = useMovablePoint([1, 1], { color: Theme.blue });
  const r = useMovablePoint([1, 0], {
    color: Theme.green,
    constrain: (p) => vec.normalize(p)
  });
  const angle = Math.atan2(r.point[1], r.point[0]);
  return /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsxs3(Transform, { translate: t.point, children: [
      /* @__PURE__ */ jsxs3(Transform, { rotate: angle, children: [
        /* @__PURE__ */ jsxs3(Transform, { scale: s.point, children: [
          children,
          /* @__PURE__ */ jsx10(
            Polygon,
            {
              points: [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0]
              ],
              color: Theme.blue
            }
          )
        ] }),
        /* @__PURE__ */ jsx10(
          Circle,
          {
            center: [0, 0],
            radius: 1,
            strokeStyle: "dashed",
            strokeOpacity: 0.5,
            fillOpacity: 0,
            color: Theme.green
          }
        ),
        s.element
      ] }),
      r.element
    ] }),
    t.element
  ] });
}
TransformWidget.displayName = "Debug.TransformWidget";

// src/debug/index.tsx
var Debug = {
  ViewportInfo,
  TransformWidget
};

// src/view/Mafs.tsx
import { jsx as jsx11, jsxs as jsxs4 } from "react/jsx-runtime";
function Mafs({
  width: propWidth = "auto",
  height: propHeight = 500,
  pan = true,
  zoom = false,
  viewBox = { x: [-3, 3], y: [-3, 3] },
  preserveAspectRatio = "contain",
  children,
  ssr = false,
  debug = false,
  onClick = void 0
}) {
  const testContext = React12.useContext(TestContext);
  const height = testContext.overrideHeight ?? propHeight;
  const desiredCssWidth = propWidth === "auto" ? "100%" : `${propWidth}px`;
  const rootRef = React12.useRef(null);
  const { width = propWidth === "auto" ? ssr ? 500 : 0 : propWidth } = useResizeObserver({
    ref: propWidth === "auto" ? rootRef : null
  });
  return /* @__PURE__ */ jsx11(
    "div",
    {
      className: "MafsView",
      style: { width: desiredCssWidth, height },
      tabIndex: pan || zoom ? 0 : -1,
      ref: rootRef,
      children: width > 0 && /* @__PURE__ */ jsx11(
        MafsCanvas,
        {
          width,
          height,
          desiredCssWidth,
          rootRef,
          pan,
          zoom,
          viewBox,
          preserveAspectRatio,
          ssr,
          onClick,
          debug,
          children
        }
      )
    }
  );
}
function MafsCanvas({
  width,
  height,
  desiredCssWidth,
  rootRef,
  pan,
  zoom,
  viewBox,
  preserveAspectRatio,
  children,
  onClick,
  debug
}) {
  let minZoom = 1;
  let maxZoom = 1;
  if (typeof zoom === "object") {
    invariant5(zoom.min > 0 && zoom.min <= 1, "zoom.min must be in the range (0, 1]");
    invariant5(zoom.max >= 1, "zoom.max must be in the range [1, \u221E)");
    minZoom = zoom.min;
    maxZoom = zoom.max;
  } else if (zoom) {
    minZoom = 0.5;
    maxZoom = 5;
  }
  const camera = useCamera({ minZoom, maxZoom });
  const padding = viewBox?.padding ?? 0.5;
  let xMin = (viewBox?.x?.[0] ?? 0) - padding;
  let xMax = (viewBox?.x?.[1] ?? 0) + padding;
  let yMin = (viewBox?.y?.[0] ?? 0) - padding;
  let yMax = (viewBox?.y?.[1] ?? 0) + padding;
  if (preserveAspectRatio === "contain") {
    const aspect = width / height;
    const aoiAspect = (xMax - xMin) / (yMax - yMin);
    if (aoiAspect > aspect) {
      const yCenter = (yMax + yMin) / 2;
      const ySpan2 = (xMax - xMin) / aspect / 2;
      yMin = yCenter - ySpan2;
      yMax = yCenter + ySpan2;
    } else {
      const xCenter = (xMax + xMin) / 2;
      const xSpan2 = (yMax - yMin) * aspect / 2;
      xMin = xCenter - xSpan2;
      xMax = xCenter + xSpan2;
    }
  }
  ;
  [xMin, yMin] = vec.transform([xMin, yMin], camera.matrix);
  [xMax, yMax] = vec.transform([xMax, yMax], camera.matrix);
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;
  const viewTransform = React12.useMemo(() => {
    const scaleX = round(1 / xSpan * width, 5);
    const scaleY = round(-1 / ySpan * height, 5);
    return vec.matrixBuilder().scale(scaleX, scaleY).get();
  }, [height, width, xSpan, ySpan]);
  const viewBoxX = round(xMin / (xMax - xMin) * width, 10);
  const viewBoxY = round(yMax / (yMin - yMax) * height, 10);
  const inverseViewTransform = vec.matrixInvert(viewTransform);
  const pickupOrigin = React12.useRef([0, 0]);
  const pickupPoint = React12.useRef([0, 0]);
  function mapGesturePoint(point) {
    const el = rootRef.current;
    invariant5(el, "SVG is not mounted");
    invariant5(inverseViewTransform, "View transform is not invertible");
    const rect = el.getBoundingClientRect();
    return vec.transform(
      [point[0] - rect.left + viewBoxX, point[1] - rect.top + viewBoxY],
      inverseViewTransform
    );
  }
  const wheelEnabler = useWheelEnabler(!!zoom);
  const justDragged = React12.useRef(false);
  useGesture(
    {
      onDrag: ({ movement, first, event, type, pinching, memo = [0, 0], last }) => {
        if (pinching)
          return movement;
        if (first)
          camera.setBase();
        const [mx, my] = vec.sub(movement, memo);
        camera.move({ pan: [-mx / width * xSpan, my / height * ySpan] });
        const keyboard = type.includes("key");
        if (keyboard)
          event?.preventDefault();
        if (last) {
          justDragged.current = true;
          setTimeout(() => justDragged.current = false, 10);
        }
        return !keyboard && first ? movement : memo;
      },
      onPinch: ({ first, movement: [scale], origin, event, last }) => {
        if (!event.currentTarget || !inverseViewTransform)
          return;
        if (first) {
          camera.setBase();
          pickupOrigin.current = origin;
          pickupPoint.current = pan ? mapGesturePoint(origin) : [(xMin + xMax) / 2, (yMin + yMax) / 2];
        }
        let offset = [0, 0];
        if (pan) {
          offset = vec.transform(vec.sub(origin, pickupOrigin.current), inverseViewTransform);
        }
        camera.move({ zoom: { at: pickupPoint.current, scale }, pan: vec.scale(offset, -1) });
        if (last)
          camera.setBase();
      },
      onWheel: ({ pinching, event, delta: [, scroll] }) => {
        if (pinching)
          return;
        const scale = 2 / (1 + Math.exp(-scroll / 300));
        const point = mapGesturePoint([event.clientX, event.clientY]);
        camera.setBase();
        camera.move({ zoom: { at: point, scale: 1 / scale } });
      },
      onKeyDown: ({ event }) => {
        if (event.metaKey)
          return;
        const base = { Equal: 1, Minus: -1 }[event.code] ?? 0;
        if (!base)
          return;
        let multiplier = 0.1;
        if (event.altKey || event.metaKey)
          multiplier = 0.01;
        if (event.shiftKey)
          multiplier = 0.3;
        const scale = 1 + base * multiplier;
        const center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
        camera.setBase();
        camera.move({ zoom: { at: center, scale } });
      },
      onMouseMove: () => {
        wheelEnabler.handleMouseMove();
      },
      onClick: ({ event }) => {
        if (!onClick || !rootRef.current || justDragged.current)
          return;
        const box = rootRef.current.getBoundingClientRect();
        const pxX = event.clientX - box.left;
        const pxY = box.bottom - event.clientY;
        const x = pxX / width * xSpan + xMin;
        const y = pxY / height * ySpan + yMin;
        onClick([x, y], event);
      }
    },
    {
      drag: { enabled: pan, eventOptions: { passive: false }, threshold: 1 },
      pinch: { enabled: !!zoom, eventOptions: { passive: false } },
      wheel: {
        enabled: wheelEnabler.wheelEnabled,
        preventDefault: true,
        eventOptions: { passive: false }
      },
      target: rootRef
    }
  );
  const viewTransformCSS = vec.toCSS(viewTransform);
  const coordinateContext = React12.useMemo(
    () => ({ xMin, xMax, yMin, yMax, height, width }),
    [xMin, xMax, yMin, yMax, height, width]
  );
  return /* @__PURE__ */ jsx11(CoordinateContext_default.Provider, { value: coordinateContext, children: /* @__PURE__ */ jsx11(SpanContext.Provider, { value: { xSpan, ySpan }, children: /* @__PURE__ */ jsx11(
    TransformContext.Provider,
    {
      value: { userTransform: vec.identity, viewTransform },
      children: /* @__PURE__ */ jsx11(PaneContext_default, { children: /* @__PURE__ */ jsxs4(
        "svg",
        {
          width,
          height,
          viewBox: [
            viewBoxX - (debug ? 150 : 0),
            viewBoxY - (debug ? 150 : 0),
            width + (debug ? 300 : 0),
            height + (debug ? 300 : 0)
          ].join(" "),
          preserveAspectRatio: "xMidYMin",
          style: {
            width: desiredCssWidth,
            touchAction: pan ? "none" : "auto",
            ...{
              "--mafs-view-transform": viewTransformCSS,
              "--mafs-user-transform": "translate(0, 0)"
            }
          },
          children: [
            children,
            debug && /* @__PURE__ */ jsx11(
              "rect",
              {
                x: viewBoxX,
                y: viewBoxY,
                width,
                height,
                fill: "none",
                stroke: "red",
                style: { outline: "9999px solid #f002" }
              }
            ),
            debug && /* @__PURE__ */ jsx11(Debug.ViewportInfo, {})
          ]
        }
      ) })
    }
  ) }) });
}
Mafs.displayName = "Mafs";

// src/display/Coordinates/Cartesian.tsx
import * as React13 from "react";

// src/display/Coordinates/Axes.tsx
import { Fragment as Fragment2, jsx as jsx12, jsxs as jsxs5 } from "react/jsx-runtime";
var defaultLabelMaker = (x) => /* @__PURE__ */ jsxs5(Fragment2, { children: [
  x,
  x < 0 && /* @__PURE__ */ jsx12("tspan", { visibility: "hidden", children: "-" })
] });
var defaultAxisOptions = {
  axis: true,
  lines: 1,
  labels: defaultLabelMaker
};
function XLabels({ separation, labelMaker }) {
  const { viewTransform } = useTransformContext();
  const { xPanes } = usePaneContext();
  return /* @__PURE__ */ jsx12("g", { className: "mafs-axis", children: xPanes.map(([min, max]) => /* @__PURE__ */ jsx12("g", { children: snappedRange(min, max, separation).filter((x) => Math.abs(x) > separation / 1e6).map((x) => /* @__PURE__ */ jsx12(
    "text",
    {
      x: vec.transform([x, 0], viewTransform)[0],
      y: 5,
      dominantBaseline: "hanging",
      textAnchor: "middle",
      style: { fill: "var(--mafs-origin-color)", paintOrder: "stroke" },
      children: labelMaker(x)
    },
    x
  )) }, `${min},${max}`)) });
}
XLabels.displayName = "CartesianCoordinates.XLabels";
function YLabels({ separation, labelMaker }) {
  const { viewTransform } = useTransformContext();
  const { yPanes } = usePaneContext();
  return /* @__PURE__ */ jsx12("g", { className: "mafs-axis", children: yPanes.map(([min, max]) => /* @__PURE__ */ jsx12("g", { children: snappedRange(min, max, separation).filter((y) => Math.abs(y) > separation / 1e6).map((y) => /* @__PURE__ */ jsx12(
    "text",
    {
      x: 5,
      y: vec.transform([0, y], viewTransform)[1],
      dominantBaseline: "central",
      style: { fill: "var(--mafs-origin-color)", paintOrder: "stroke" },
      children: labelMaker(y)
    },
    y
  )) }, `${min},${max}`)) });
}
YLabels.displayName = "CartesianCoordinates.YLabels";

// src/display/Coordinates/Cartesian.tsx
import { Fragment as Fragment3, jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
var incrementer = 0;
function Cartesian({
  xAxis: xAxisOverrides,
  yAxis: yAxisOverrides,
  subdivisions = false
}) {
  const xAxisEnabled = xAxisOverrides !== false;
  const yAxisEnabled = yAxisOverrides !== false;
  const xAxis = { subdivisions, ...defaultAxisOptions, ...xAxisOverrides };
  const yAxis = { subdivisions, ...defaultAxisOptions, ...yAxisOverrides };
  const id = React13.useMemo(() => `cartesian-${incrementer++}`, []);
  const { viewTransform } = useTransformContext();
  const { xPaneRange, yPaneRange } = usePaneContext();
  const [xMin, xMax] = xPaneRange;
  const [yMin, yMax] = yPaneRange;
  const [vxMin, vyMin] = vec.transform([xMin, yMin], viewTransform);
  const [vxMax, vyMax] = vec.transform([xMax, yMax], viewTransform);
  const xLines = xAxis.lines || 1;
  const yLines = yAxis.lines || 1;
  const [unitW, unitH] = vec.transform([xLines, -yLines], viewTransform);
  const xSubs = xAxis.subdivisions || 1;
  const ySubs = yAxis.subdivisions || 1;
  const subUnitW = unitW / xSubs;
  const subUnitH = unitH / ySubs;
  return /* @__PURE__ */ jsxs6("g", { fill: "none", children: [
    /* @__PURE__ */ jsxs6("pattern", { x: 0, y: 0, width: unitW, height: unitH, id, patternUnits: "userSpaceOnUse", children: [
      /* @__PURE__ */ jsx13(
        "pattern",
        {
          width: subUnitW,
          height: subUnitH,
          id: `${id}-subdivision`,
          patternUnits: "userSpaceOnUse",
          children: /* @__PURE__ */ jsxs6("g", { stroke: "var(--grid-line-subdivision-color)", children: [
            xAxisEnabled !== false && xSubs > 1 && /* @__PURE__ */ jsxs6(Fragment3, { children: [
              /* @__PURE__ */ jsx13("line", { x1: 0, y1: 0, x2: 0, y2: subUnitH }),
              /* @__PURE__ */ jsx13("line", { x1: subUnitW, y1: 0, x2: subUnitW, y2: subUnitH })
            ] }),
            yAxisEnabled !== false && ySubs > 1 && /* @__PURE__ */ jsxs6(Fragment3, { children: [
              /* @__PURE__ */ jsx13("line", { x1: 0, y1: 0, x2: subUnitW, y2: 0 }),
              /* @__PURE__ */ jsx13("line", { x1: 0, y1: subUnitH, x2: subUnitW, y2: subUnitH })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx13("rect", { width: unitW, height: unitH, fill: `url(#${id}-subdivision)` }),
      /* @__PURE__ */ jsxs6("g", { stroke: "var(--mafs-line-color)", children: [
        yAxisEnabled && xAxis.lines && /* @__PURE__ */ jsxs6(Fragment3, { children: [
          /* @__PURE__ */ jsx13("line", { x1: 0, y1: 0, x2: unitW, y2: 0 }),
          /* @__PURE__ */ jsx13("line", { x1: 0, y1: unitH, x2: unitW, y2: unitH })
        ] }),
        xAxisEnabled && yAxis.lines && /* @__PURE__ */ jsxs6(Fragment3, { children: [
          /* @__PURE__ */ jsx13("line", { x1: 0, y1: 0, x2: 0, y2: unitH }),
          /* @__PURE__ */ jsx13("line", { x1: unitW, y1: 0, x2: unitW, y2: unitH })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx13("rect", { x: vxMin, y: vyMax, width: vxMax - vxMin, height: vyMin - vyMax, fill: `url(#${id})` }),
    /* @__PURE__ */ jsxs6("g", { stroke: "var(--mafs-origin-color)", strokeWidth: "var(--mafs-axis-stroke-width)", children: [
      xAxisEnabled && xAxis.axis && /* @__PURE__ */ jsx13("line", { x1: vxMin, y1: 0, x2: vxMax, y2: 0 }),
      yAxisEnabled && yAxis.axis && /* @__PURE__ */ jsx13("line", { x1: 0, y1: vyMin, x2: 0, y2: vyMax })
    ] }),
    /* @__PURE__ */ jsxs6("g", { className: "mafs-shadow", children: [
      xAxisEnabled && xAxis.labels && /* @__PURE__ */ jsx13(XLabels, { separation: xAxis.lines || 1, labelMaker: xAxis.labels }),
      yAxisEnabled && yAxis.labels && /* @__PURE__ */ jsx13(YLabels, { separation: yAxis.lines || 1, labelMaker: yAxis.labels })
    ] })
  ] });
}
Cartesian.displayName = "Coordinates.Cartesian";
function snappedRange(min, max, step) {
  const roundMin = Math.floor(min / step) * step;
  const roundMax = Math.ceil(max / step) * step;
  if (roundMin === roundMax - step)
    return [roundMin];
  return range(roundMin, roundMax - step, step);
}
function autoPi(x) {
  if (x === 0)
    return "0";
  if (Math.abs(Math.PI - x) < 1e-3)
    return "\u03C0";
  if (Math.abs(-Math.PI - x) < 1e-3)
    return "-\u03C0";
  return `${round(x / Math.PI, 5)}\u03C0`;
}

// src/display/Coordinates/Polar.tsx
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
var thetas = range(0, 2 * Math.PI, Math.PI / 12);
function PolarCoordinates({
  xAxis: xAxisOverrides,
  yAxis: yAxisOverrides,
  lines = 1,
  subdivisions
}) {
  const xAxisEnabled = xAxisOverrides !== false;
  const yAxisEnabled = yAxisOverrides !== false;
  const xAxis = { ...defaultAxisOptions, ...xAxisOverrides };
  const yAxis = { ...defaultAxisOptions, ...yAxisOverrides };
  const { viewTransform } = useTransformContext();
  const { xPaneRange, yPaneRange } = usePaneContext();
  const [xMin, xMax] = xPaneRange;
  const [yMin, yMax] = yPaneRange;
  const distances = [
    vec.mag([xMin, yMin]),
    vec.mag([xMin, yMax]),
    vec.mag([xMax, yMin]),
    vec.mag([xMax, yMax]),
    vec.mag([(xMin + xMax) / 2, (yMin + yMax) / 2])
  ];
  const b = lines;
  const closeToOrigin = Math.min(...distances) < Math.max(xMax - xMin, yMax - yMin);
  const minRadiusPrecise = closeToOrigin ? 0 : Math.min(...distances);
  const maxRadiusPrecise = Math.max(...distances);
  const minRadius = Math.floor(minRadiusPrecise / b) * b;
  const maxRadius = Math.ceil(maxRadiusPrecise / b) * b;
  const [vxMin, vyMin] = vec.transform([xMin, yMin], viewTransform);
  const [vxMax, vyMax] = vec.transform([xMax, yMax], viewTransform);
  const [scaleX, scaleY] = vec.transform([1, -1], viewTransform);
  const rs = range(minRadius, maxRadius, b);
  const subRs = subdivisions != void 0 ? range(minRadius, maxRadius, b / subdivisions) : [];
  return /* @__PURE__ */ jsxs7("g", { fill: "none", children: [
    /* @__PURE__ */ jsx14("g", { stroke: "var(--grid-line-subdivision-color)", children: thetas.map((theta) => /* @__PURE__ */ jsx14(
      "line",
      {
        x1: 0,
        y1: 0,
        x2: Math.cos(theta) * maxRadius * scaleX,
        y2: -Math.sin(theta) * maxRadius * scaleY
      },
      theta
    )) }),
    subRs.map((r) => /* @__PURE__ */ jsx14(
      "ellipse",
      {
        "data-r": r,
        cx: 0,
        cy: 0,
        rx: r * scaleX,
        ry: r * scaleY,
        stroke: "var(--grid-line-subdivision-color)"
      },
      r
    )),
    rs.map((r) => /* @__PURE__ */ jsx14(
      "ellipse",
      {
        "data-r": r,
        cx: 0,
        cy: 0,
        rx: r * scaleX,
        ry: r * scaleY,
        stroke: "var(--mafs-line-color)"
      },
      r
    )),
    /* @__PURE__ */ jsxs7("g", { stroke: "var(--mafs-origin-color)", strokeWidth: "var(--mafs-axis-stroke-width)", children: [
      xAxisEnabled && xAxis.axis && /* @__PURE__ */ jsx14("line", { x1: vxMin, y1: 0, x2: vxMax, y2: 0 }),
      yAxisEnabled && yAxis.axis && /* @__PURE__ */ jsx14("line", { x1: 0, y1: vyMin, x2: 0, y2: vyMax })
    ] }),
    /* @__PURE__ */ jsxs7("g", { className: "mafs-shadow", children: [
      xAxisEnabled && xAxis.labels && /* @__PURE__ */ jsx14(
        XLabels,
        {
          separation: xAxisOverrides?.lines || lines || 1,
          labelMaker: xAxis.labels || defaultLabelMaker
        }
      ),
      yAxisEnabled && yAxis.labels && /* @__PURE__ */ jsx14(
        YLabels,
        {
          separation: yAxisOverrides?.lines || lines || 1,
          labelMaker: yAxis.labels || defaultLabelMaker
        }
      )
    ] })
  ] });
}
PolarCoordinates.displayName = "Coordinates.Polar";

// src/display/Coordinates/index.tsx
var Coordinates = {
  Cartesian,
  Polar: PolarCoordinates
};

// src/display/Plot/OfX.tsx
import * as React15 from "react";

// src/display/Plot/Parametric.tsx
import * as React14 from "react";

// src/display/Plot/PlotUtils.tsx
function cheapHash(min, max) {
  const result = Math.sin(min * 12.9898 + max * 78.233) * 43758.5453;
  return 0.4 + 0.2 * (result - Math.floor(result));
}
function sample({
  domain,
  minDepth,
  maxDepth,
  threshold,
  fn,
  error,
  onPoint,
  lerp
}) {
  const [min, max] = domain;
  function subdivide(min2, max2, depth, pMin, pMax) {
    const t = cheapHash(min2, max2);
    const mid = min2 + (max2 - min2) * t;
    const pMid = fn(mid);
    function deepen() {
      subdivide(min2, mid, depth + 1, pMin, pMid);
      onPoint(mid, pMid);
      subdivide(mid, max2, depth + 1, pMid, pMax);
    }
    if (depth < minDepth) {
      deepen();
    } else if (depth < maxDepth) {
      const fnMidpoint = lerp(pMin, pMax, t);
      const e = error(pMid, fnMidpoint);
      if (e > threshold)
        deepen();
    }
  }
  onPoint(min, fn(min));
  subdivide(min, max, 0, fn(min), fn(max));
  onPoint(max, fn(max));
}
function sampleParametric(fn, domain, minDepth, maxDepth, threshold) {
  let result = "M ";
  sample({
    fn,
    error: (a, b) => vec.squareDist(a, b),
    onPoint: (_t, [x, y]) => {
      if (Number.isFinite(x) && Number.isFinite(y)) {
        result += `${x} ${y} L `;
      }
    },
    lerp: (p1, p2, t) => vec.lerp(p1, p2, t),
    domain,
    minDepth,
    maxDepth,
    threshold
  });
  return result.substring(0, result.length - 2);
}
function sampleInequality(rangeAxis, upper, lower, domain, minDepth, maxDepth, threshold) {
  const result = { fill: "", upper: "", lower: "" };
  let upperTmp = "";
  let lowerTmp = "";
  let ineqFalse = false;
  let prevX = 0;
  let prevUpper = 0;
  let prevLower = 0;
  function pointToString(x, y) {
    return rangeAxis === "x" ? `${x} ${y}` : `${y} ${x}`;
  }
  sample({
    domain,
    minDepth,
    maxDepth,
    threshold,
    fn: (x) => [
      [x, lower(x)],
      [x, upper(x)]
    ],
    error: ([realLower, realUpper], [estLower, estUpper]) => {
      return Math.max(vec.squareDist(realLower, estLower), vec.squareDist(realUpper, estUpper));
    },
    lerp: ([aLower, aUpper], [bLower, bUpper], t) => {
      return [vec.lerp(aLower, bLower, t), vec.lerp(aUpper, bUpper, t)];
    },
    onPoint: (x, [[, lower2], [, upper2]]) => {
      const pathsJustCrossed = upper2 < lower2 && !ineqFalse;
      const pathsJustUncrossed = upper2 > lower2 && ineqFalse;
      if (pathsJustCrossed) {
        ineqFalse = true;
        if (upperTmp && lowerTmp) {
          const midX = (prevX + x) / 2;
          const midUpper = (prevUpper + upper2) / 2;
          const midLower = (prevLower + lower2) / 2;
          const midY = (midUpper + midLower) / 2;
          upperTmp += ` ${pointToString(midX, midY)} L `;
          lowerTmp = ` ${pointToString(midX, midY)} L ` + lowerTmp;
          result.fill += ` M ${upperTmp} ${lowerTmp.substring(0, lowerTmp.length - 2)} z `;
          result.upper += ` M ${upperTmp.substring(0, upperTmp.length - 2)} `;
          result.lower += ` M ${lowerTmp.substring(0, lowerTmp.length - 2)} `;
          upperTmp = "";
          lowerTmp = "";
        }
      } else if (pathsJustUncrossed) {
        ineqFalse = false;
        const midX = (prevX + x) / 2;
        const midUpper = (prevUpper + upper2) / 2;
        const midLower = (prevLower + lower2) / 2;
        const midY = (midUpper + midLower) / 2;
        upperTmp += ` ${pointToString(midX, midY)} L `;
        lowerTmp = ` ${pointToString(midX, midY)} L ` + lowerTmp;
      }
      if (!ineqFalse) {
        if (Number.isFinite(upper2)) {
          upperTmp = upperTmp + ` ${pointToString(x, upper2)} L `;
        }
        if (Number.isFinite(lower2)) {
          lowerTmp = ` ${pointToString(x, lower2)} L ` + lowerTmp;
        }
      }
      prevX = x;
      prevUpper = upper2;
      prevLower = lower2;
    }
  });
  if (upperTmp && lowerTmp) {
    result.fill += ` M ${upperTmp} ${lowerTmp.substring(0, lowerTmp.length - 2)} z `;
    result.lower += ` M ${lowerTmp.substring(0, lowerTmp.length - 2)} `;
    result.upper += ` M ${upperTmp.substring(0, upperTmp.length - 2)} `;
  }
  return result;
}

// src/display/Plot/Parametric.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
function Parametric({
  xy,
  domain,
  t,
  color,
  style = "solid",
  weight = 2,
  opacity = 1,
  maxSamplingDepth = 14,
  minSamplingDepth = 8,
  svgPathProps = {}
}) {
  const { viewTransform } = useTransformContext();
  const pixelsPerSquare = -vec.det(viewTransform);
  const [tMin, tMax] = domain || t;
  const errorThreshold = 0.1 / pixelsPerSquare;
  const svgPath = React14.useMemo(
    () => sampleParametric(xy, [tMin, tMax], minSamplingDepth, maxSamplingDepth, errorThreshold),
    [xy, minSamplingDepth, maxSamplingDepth, errorThreshold, tMin, tMax]
  );
  return /* @__PURE__ */ jsx15(
    "path",
    {
      d: svgPath,
      strokeWidth: weight,
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...svgPathProps,
      style: {
        stroke: color || "var(--mafs-fg)",
        strokeOpacity: opacity,
        strokeDasharray: style === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0,
        vectorEffect: "non-scaling-stroke",
        transform: "var(--mafs-view-transform)",
        ...svgPathProps.style || {}
      }
    }
  );
}
Parametric.displayName = "Plot.Parametric";

// src/display/Plot/OfX.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
function OfX({ y, domain, ...props }) {
  const [xuMin, xuMax] = domain ?? [-Infinity, Infinity];
  const {
    xPaneRange: [xpMin, xpMax]
  } = usePaneContext();
  const xMin = Math.max(xuMin, xpMin);
  const xMax = Math.min(xuMax, xpMax);
  const xy = React15.useCallback((x) => [x, y(x)], [y]);
  const parametricDomain = React15.useMemo(() => [xMin, xMax], [xMin, xMax]);
  return /* @__PURE__ */ jsx16(Parametric, { xy, domain: parametricDomain, ...props });
}
OfX.displayName = "Plot.OfX";

// src/display/Plot/OfY.tsx
import * as React16 from "react";
import { jsx as jsx17 } from "react/jsx-runtime";
function OfY({ x, domain, ...props }) {
  const [yuMin, yuMax] = domain ?? [-Infinity, Infinity];
  const {
    yPaneRange: [ypMin, ypMax]
  } = usePaneContext();
  const yMin = Math.max(yuMin, ypMin);
  const yMax = Math.min(yuMax, ypMax);
  const xy = React16.useCallback((y) => [x(y), y], [x]);
  const parametricDomain = React16.useMemo(() => [yMin, yMax], [yMin, yMax]);
  return /* @__PURE__ */ jsx17(Parametric, { xy, domain: parametricDomain, ...props });
}
OfY.displayName = "Plot.OfY";

// src/display/Plot/VectorField.tsx
import { Fragment as Fragment4, jsx as jsx18 } from "react/jsx-runtime";
var xyOpacityDefault = () => 1;
function VectorField({
  xy,
  step = 1,
  xyOpacity = xyOpacityDefault,
  opacityStep = xyOpacity === xyOpacityDefault ? 1 : 0.2,
  color = Theme.foreground
}) {
  const { viewTransform: pixelMatrix } = useTransformContext();
  const { xPanes, yPanes } = usePaneContext();
  opacityStep = Math.min(1, Math.max(0.01, opacityStep));
  const opacityGrainularity = Math.ceil(1 / opacityStep);
  const layers = generateOpacityLayers(opacityGrainularity);
  function fieldForRegion(xMin, xMax, yMin, yMax) {
    for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x += step) {
      for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y += step) {
        const tail = [x, y];
        const trueOffset = xy([x, y]);
        const trueMag = vec.mag(trueOffset);
        if (trueMag === 0)
          continue;
        const scaledOffset = vec.scale(vec.normalize(trueOffset), Math.min(trueMag, step * 0.75));
        const tip = vec.add(tail, scaledOffset);
        const pixelTail = vec.transform(tail, pixelMatrix);
        const pixelTipOffset = vec.transform(scaledOffset, pixelMatrix);
        const pixelSize = vec.mag(pixelTipOffset);
        const pixelTip = vec.transform(tip, pixelMatrix);
        const arrowVector = vec.scale(vec.normalize(pixelTipOffset), Math.min(pixelSize, 5));
        const left = vec.add(pixelTip, vec.rotate(arrowVector, 5 / 6 * Math.PI));
        const right = vec.add(pixelTip, vec.rotate(arrowVector, -(5 / 6) * Math.PI));
        const trueOpacity = xyOpacity([x, y]);
        const layer = findClosetLayer(layers, trueOpacity);
        layer.d += ` M ${pixelTail[0]} ${pixelTail[1]} L ${pixelTip[0]} ${pixelTip[1]}  L ${left[0]} ${left[1]}  L ${right[0]} ${right[1]}  L ${pixelTip[0]} ${pixelTip[1]} `;
      }
    }
  }
  for (const [xMin, xMax] of xPanes) {
    for (const [yMin, yMax] of yPanes) {
      fieldForRegion(xMin, xMax, yMin, yMax);
    }
  }
  return /* @__PURE__ */ jsx18(Fragment4, { children: layers.map((layer, index) => /* @__PURE__ */ jsx18(
    "path",
    {
      d: layer.d,
      style: {
        stroke: color,
        fill: color,
        opacity: layer.opacity,
        fillOpacity: layer.opacity,
        strokeOpacity: layer.opacity
      },
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    index
  )) });
}
VectorField.displayName = "Plot.VectorField";
function generateOpacityLayers(opacityGrainularity) {
  const layers = [];
  const step = 1 / opacityGrainularity;
  for (let i = 1; i > 0; i -= step) {
    const layer = {
      d: "",
      opacity: i
    };
    layers.push(layer);
  }
  return layers;
}
function findClosetLayer(layers, pointOpacity) {
  pointOpacity = clamp(pointOpacity, 0, 1);
  const index = layers.length - 1 - Math.round(pointOpacity * (layers.length - 1));
  return layers[index];
}

// src/display/Plot/Inequality.tsx
import invariant6 from "tiny-invariant";
import { jsx as jsx19, jsxs as jsxs8 } from "react/jsx-runtime";
function Inequality({
  x,
  y,
  color = Theme.foreground,
  weight = 2,
  strokeColor = color,
  strokeOpacity = 1,
  fillColor = color,
  fillOpacity = 0.15,
  minSamplingDepth = 10,
  maxSamplingDepth = 14,
  upperColor = strokeColor,
  upperOpacity = strokeOpacity,
  upperWeight = weight,
  lowerColor = strokeColor,
  lowerOpacity = strokeOpacity,
  lowerWeight = weight,
  svgUpperPathProps = {},
  svgLowerPathProps = {},
  svgFillPathProps = {}
}) {
  const {
    xPaneRange: [xMin, xMax],
    yPaneRange: [yMin, yMax]
  } = usePaneContext();
  const domain = y ? [xMin, xMax] : [yMin, yMax];
  const range2 = y ? [yMin, yMax] : [xMin, xMax];
  const fn = y ? y : x;
  invariant6(
    fn && x === void 0 !== (y === void 0),
    "You must pass either an x or y set of functions to Inequality (but not both)"
  );
  invariant6(
    (fn["<"] === void 0 || fn["<="] === void 0) && (fn[">"] === void 0 || fn[">="] === void 0),
    "You cannot pass both an inequality and an equality operator to Inequality"
  );
  let upperBoundType = 0 /* UNBOUNDED */;
  if ("<=" in fn)
    upperBoundType = 1 /* EQUAL */;
  if ("<" in fn)
    upperBoundType = 2 /* INEQUAL */;
  let lowerBoundType = 0 /* UNBOUNDED */;
  if (">=" in fn)
    lowerBoundType = 1 /* EQUAL */;
  if (">" in fn)
    lowerBoundType = 2 /* INEQUAL */;
  let greaterFn = fn["<"] ?? fn["<="] ?? (() => range2[1]);
  let lesserFn = fn[">"] ?? fn[">="] ?? (() => range2[0]);
  if (typeof greaterFn === "number") {
    const greater = greaterFn;
    greaterFn = () => greater;
  }
  if (typeof lesserFn === "number") {
    const lesser = lesserFn;
    lesserFn = () => lesser;
  }
  const svgPath = sampleInequality(
    y ? "x" : "y",
    greaterFn,
    lesserFn,
    domain,
    minSamplingDepth,
    maxSamplingDepth,
    0.1
  );
  return /* @__PURE__ */ jsxs8("g", { children: [
    /* @__PURE__ */ jsx19(
      "path",
      {
        d: svgPath.fill,
        style: {
          fill: fillColor || "var(--mafs-fg)",
          fillOpacity,
          stroke: "none",
          transform: "var(--mafs-view-transform)",
          vectorEffect: "non-scaling-stroke",
          ...svgFillPathProps?.style
        },
        ...svgFillPathProps
      }
    ),
    upperBoundType != 0 /* UNBOUNDED */ && /* @__PURE__ */ jsx19(
      "path",
      {
        d: svgPath.upper,
        strokeWidth: upperWeight,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeDasharray: upperBoundType === 2 /* INEQUAL */ ? "4,8" : "",
        style: {
          fill: "none",
          stroke: upperColor,
          strokeOpacity: upperOpacity,
          transform: "var(--mafs-view-transform)",
          vectorEffect: "non-scaling-stroke",
          ...svgUpperPathProps?.style
        },
        ...svgUpperPathProps
      }
    ),
    lowerBoundType != 0 /* UNBOUNDED */ && /* @__PURE__ */ jsx19(
      "path",
      {
        d: svgPath.lower,
        strokeWidth: lowerWeight,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeDasharray: lowerBoundType === 2 /* INEQUAL */ ? "4,8" : "",
        style: {
          fill: "none",
          stroke: lowerColor,
          strokeOpacity: lowerOpacity,
          transform: "var(--mafs-view-transform)",
          vectorEffect: "non-scaling-stroke",
          ...svgLowerPathProps?.style
        },
        ...svgLowerPathProps
      }
    )
  ] });
}
Inequality.displayName = "Plot.Inequality";

// src/display/Plot.tsx
var Plot = {
  OfX,
  OfY,
  Parametric,
  VectorField,
  Inequality
};

// src/display/Line/ThroughPoints.tsx
import { jsx as jsx20 } from "react/jsx-runtime";
function ThroughPoints({
  point1,
  point2,
  color = Theme.foreground,
  style = "solid",
  weight = 2,
  opacity = 1
}) {
  const { xPaneRange, yPaneRange } = usePaneContext();
  const [xMin, xMax] = xPaneRange;
  const [yMin, yMax] = yPaneRange;
  const { userTransform } = useTransformContext();
  const tPoint1 = vec.transform(point1, userTransform);
  const tPoint2 = vec.transform(point2, userTransform);
  const slope = (tPoint2[1] - tPoint1[1]) / (tPoint2[0] - tPoint1[0]);
  let offscreen1;
  let offscreen2;
  if (Math.abs(Math.atan(slope)) > Math.PI / 4) {
    offscreen1 = [(yMin - tPoint1[1]) / slope + tPoint1[0], yMin];
    offscreen2 = [(yMax - tPoint1[1]) / slope + tPoint1[0], yMax];
  } else {
    offscreen1 = [xMin, slope * (xMin - tPoint1[0]) + tPoint1[1]];
    offscreen2 = [xMax, slope * (xMax - tPoint1[0]) + tPoint1[1]];
  }
  return /* @__PURE__ */ jsx20(
    "line",
    {
      x1: round(offscreen1[0], 2),
      y1: round(offscreen1[1], 2),
      x2: round(offscreen2[0], 2),
      y2: round(offscreen2[1], 2),
      style: {
        stroke: color,
        strokeDasharray: style === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0,
        transform: "var(--mafs-view-transform)",
        vectorEffect: "non-scaling-stroke"
      },
      strokeWidth: weight,
      opacity
    }
  );
}
ThroughPoints.displayName = "Line.ThroughPoints";

// src/display/Line/PointAngle.tsx
import { jsx as jsx21 } from "react/jsx-runtime";
function PointAngle({ point, angle, ...rest }) {
  const point2 = vec.add(point, vec.rotate([1, 0], angle));
  return /* @__PURE__ */ jsx21(ThroughPoints, { point1: point, point2, ...rest });
}
PointAngle.displayName = "Line.PointAngle";

// src/display/Line/PointSlope.tsx
import { jsx as jsx22 } from "react/jsx-runtime";
function PointSlope({ point, slope, ...rest }) {
  return /* @__PURE__ */ jsx22(PointAngle, { point, angle: Math.atan(slope), ...rest });
}
PointSlope.displayName = "Line.PointSlope";

// src/display/Line/Segment.tsx
import { jsx as jsx23 } from "react/jsx-runtime";
function Segment({
  point1,
  point2,
  color = Theme.foreground,
  style = "solid",
  weight = 2,
  opacity = 1
}) {
  const { viewTransform: pixelMatrix, userTransform } = useTransformContext();
  const transform = vec.matrixMult(pixelMatrix, userTransform);
  const scaledPoint1 = vec.transform(point1, transform);
  const scaledPoint2 = vec.transform(point2, transform);
  return /* @__PURE__ */ jsx23(
    "line",
    {
      x1: round(scaledPoint1[0], 2),
      y1: round(scaledPoint1[1], 2),
      x2: round(scaledPoint2[0], 2),
      y2: round(scaledPoint2[1], 2),
      style: {
        stroke: color,
        strokeDasharray: style === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0
      },
      strokeWidth: weight,
      opacity
    }
  );
}
Segment.displayName = "Line.Segment";

// src/display/Line.tsx
var Line = {
  PointAngle,
  PointSlope,
  ThroughPoints,
  Segment
};

// src/display/Polyline.tsx
import { jsx as jsx24 } from "react/jsx-runtime";
function Polyline({ fillOpacity = 0, svgPolylineProps, ...otherProps }) {
  return /* @__PURE__ */ jsx24(
    PolyBase,
    {
      element: "polyline",
      fillOpacity,
      svgPolyProps: svgPolylineProps,
      ...otherProps
    }
  );
}
Polyline.displayName = "Polyline";

// src/display/Point.tsx
import { jsx as jsx25 } from "react/jsx-runtime";
function Point({
  x,
  y,
  color = Theme.foreground,
  opacity = 1,
  svgCircleProps = {}
}) {
  const { viewTransform: pixelMatrix, userTransform: transform } = useTransformContext();
  const [cx, cy] = vec.transform([x, y], vec.matrixMult(pixelMatrix, transform));
  return /* @__PURE__ */ jsx25(
    "circle",
    {
      cx,
      cy,
      r: 6,
      ...svgCircleProps,
      style: { fill: color, opacity, ...svgCircleProps.style }
    }
  );
}
Point.displayName = "Point";

// src/display/Vector.tsx
import * as React17 from "react";
import { Fragment as Fragment5, jsx as jsx26, jsxs as jsxs9 } from "react/jsx-runtime";
var incrementer2 = 0;
function Vector({
  tail = [0, 0],
  tip,
  color = Theme.foreground,
  weight = 2,
  style = "solid",
  opacity = 1,
  svgLineProps = {}
}) {
  const { userTransform, viewTransform } = useTransformContext();
  const combinedTransform = vec.matrixMult(viewTransform, userTransform);
  const pixelTail = vec.transform(tail, combinedTransform);
  const pixelTip = vec.transform(tip, combinedTransform);
  const id = React17.useMemo(() => `mafs-triangle-${incrementer2++}`, []);
  return /* @__PURE__ */ jsxs9(Fragment5, { children: [
    /* @__PURE__ */ jsx26("defs", { children: /* @__PURE__ */ jsx26("marker", { id, markerWidth: "8", markerHeight: "8", refX: "8", refY: "4", orient: "auto", children: /* @__PURE__ */ jsx26("path", { d: "M 0 0 L 8 4 L 0 8 z", fill: color || "var(--mafs-fg)", strokeWidth: 0 }) }) }),
    /* @__PURE__ */ jsx26(
      "line",
      {
        x1: pixelTail[0],
        y1: pixelTail[1],
        x2: pixelTip[0],
        y2: pixelTip[1],
        strokeWidth: weight,
        markerEnd: `url(#${id})`,
        ...svgLineProps,
        style: {
          stroke: color || "var(--mafs-fg)",
          strokeDasharray: style === "dashed" ? "var(--mafs-line-stroke-dash-style)" : void 0,
          fill: color,
          strokeOpacity: opacity,
          ...svgLineProps?.style || {},
          vectorEffect: "non-scaling-stroke"
        }
      }
    )
  ] });
}
Vector.displayName = "Vector";

// src/display/Image.tsx
import { jsx as jsx27 } from "react/jsx-runtime";
function Image({
  href,
  x,
  y,
  width,
  height,
  anchor = "bl",
  preserveAspectRatio,
  svgImageProps
}) {
  const [anchorX, anchorY] = computeAnchor(anchor, x, y, width, height);
  const transform = [
    "var(--mafs-view-transform)",
    "var(--mafs-user-transform)",
    // Ensure the image is not upside down (since Mafs has the y-axis pointing
    // up, while SVG has it pointing down).
    "scaleY(-1)"
  ].join(" ");
  return /* @__PURE__ */ jsx27(
    "image",
    {
      href,
      x: anchorX,
      y: -anchorY,
      width,
      height,
      preserveAspectRatio,
      ...svgImageProps,
      style: { transform }
    }
  );
}

// src/display/Text.tsx
import { jsx as jsx28 } from "react/jsx-runtime";
function Text({
  children,
  x,
  y,
  color,
  size = 30,
  svgTextProps = {},
  attach,
  attachDistance = 0
}) {
  const { viewTransform: pixelMatrix, userTransform: transformContext } = useTransformContext();
  let xOffset = 0;
  let textAnchor = "middle";
  if (attach?.includes("w")) {
    textAnchor = "end";
    xOffset = -1;
  } else if (attach?.includes("e")) {
    textAnchor = "start";
    xOffset = 1;
  }
  let yOffset = 0;
  let dominantBaseline = "middle";
  if (attach?.includes("n")) {
    dominantBaseline = "baseline";
    yOffset = 1;
  } else if (attach?.includes("s")) {
    dominantBaseline = "hanging";
    yOffset = -1;
  }
  let [pixelX, pixelY] = [0, 0];
  if (xOffset !== 0 || yOffset !== 0) {
    ;
    [pixelX, pixelY] = vec.withMag([xOffset, yOffset], attachDistance);
  }
  const center = vec.transform([x, y], vec.matrixMult(pixelMatrix, transformContext));
  return /* @__PURE__ */ jsx28(
    "text",
    {
      x: center[0] + pixelX,
      y: center[1] + pixelY,
      fontSize: size,
      dominantBaseline,
      textAnchor,
      style: {
        fill: color || "var(--mafs-fg)",
        vectorEffect: "non-scaling-stroke"
      },
      className: "mafs-shadow",
      ...svgTextProps,
      children
    }
  );
}
Text.displayName = "Text";

// src/animation/useStopwatch.ts
import * as React18 from "react";
function useStopwatch(options) {
  const { startTime = 0, endTime = Infinity } = options || {};
  const startClockTime = React18.useRef(null);
  const [time, setTime] = React18.useState(startTime);
  const [playing, setPlaying] = React18.useState(false);
  React18.useEffect(() => {
    let request = -1;
    function tick(now) {
      now = now / 1e3;
      if (!startClockTime.current)
        startClockTime.current = now;
      const deltaTime = now - startClockTime.current;
      if (deltaTime >= endTime) {
        startClockTime.current = null;
        setTime(endTime);
        setPlaying(false);
        return;
      }
      setTime(Math.min(deltaTime, endTime));
      request = window.requestAnimationFrame(tick);
    }
    if (playing) {
      request = window.requestAnimationFrame(tick);
    } else {
      window.cancelAnimationFrame(request);
    }
    return () => window.cancelAnimationFrame(request);
  }, [playing, endTime]);
  const start = React18.useCallback(() => setPlaying(true), []);
  const stop = React18.useCallback(() => {
    startClockTime.current = null;
    setPlaying(false);
    setTime(startTime);
  }, [startTime]);
  return { time, setTime: (time2) => setTime(time2 * 1e3), start, stop };
}

// src/display/LaTeX.tsx
import * as React19 from "react";
import katex from "katex";
import { jsx as jsx29 } from "react/jsx-runtime";
function LaTeX({ at: center, tex, color = Theme.foreground, katexOptions }) {
  const ref = React19.useRef(null);
  const { viewTransform, userTransform } = useTransformContext();
  const combinedTransform = vec.matrixMult(viewTransform, userTransform);
  const width = 99999;
  const height = 99999;
  React19.useEffect(() => {
    if (!ref.current)
      return;
    katex.render(tex, ref.current, katexOptions);
  }, [katexOptions, tex]);
  const pixelCenter = vec.add(vec.transform(center, combinedTransform), [-width / 2, -height / 2]);
  return /* @__PURE__ */ jsx29(
    "foreignObject",
    {
      x: pixelCenter[0],
      y: pixelCenter[1],
      width,
      height,
      pointerEvents: "none",
      children: /* @__PURE__ */ jsx29(
        "div",
        {
          style: {
            fontSize: "1.3em",
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            color,
            textShadow: `, 0 0 2px ${Theme.background}`.repeat(8).slice(2)
          },
          children: /* @__PURE__ */ jsx29("span", { ref })
        }
      )
    }
  );
}
export {
  Circle,
  Coordinates,
  Debug,
  Ellipse,
  Image,
  LaTeX,
  Line,
  Mafs,
  MovablePoint,
  MovablePointDisplay,
  Plot,
  Point,
  Polygon,
  Polyline,
  Text,
  Theme,
  Transform,
  Vector,
  autoPi as labelPi,
  useMovable,
  useMovablePoint,
  usePaneContext,
  useStopwatch,
  useTransformContext,
  vec
};
//# sourceMappingURL=index.js.map
