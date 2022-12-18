const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_FLOWER_AGE = 50;
const MAX_GROWTH_TICKS = 15;
const BRANCH_COLOR = "rgb(101, 67, 33)";
const MAX_BRANCHING = 8;
const TRUNK_WIDTH = 12;
const BRANCH_SHRINKAGE = 0.8;
const MAX_ANGLE_DELTA = Math.PI / 2;
const DELAY = 100;

(() => {
  const svg = document.getElementById("svg");

  const wrap = a => (Array.isArray(a) ? a : [a]);
  const flatten = a => {
    if (!Array.isArray(a)) {
      return a;
    }

    const [left, right] = a;
    return wrap(left).concat(wrap(right));
  };

  const growBranch = ({ x1, y1, length, angle, depth, branchWidth }) => {
    const x2 = x1 + length * Math.cos(angle);
    const y2 = y1 + length * Math.sin(angle);

    renderBranch({ x1, y1, x2, y2, branchWidth });

    const newDepth = depth - 1;
    if (newDepth <= 0) {
      return Promise.resolve({ x: x2, y: y2 });
    }

    const newBranchWidth = branchWidth * BRANCH_SHRINKAGE;

    return Promise.all([-1, 1].map(direction => {
      const newAngle =
        angle + MAX_ANGLE_DELTA * (Math.random() * 0.5 * direction);
      const newLength =
        length * (BRANCH_SHRINKAGE + Math.random() * (1.0 - BRANCH_SHRINKAGE));

      return new Promise(resolve => {
        setTimeout(
          () =>
            resolve(
              growBranch({
                x1: x2,
                y1: y2,
                length: newLength,
                angle: newAngle,
                depth: newDepth,
                branchWidth: newBranchWidth
              })
            ),
          DELAY
        );
      })
    })).then(flatten);
  };

  // returns a promise that resolves to an array of the positions of the branches
  const growTree = () => {
    return growBranch({
      x1: Math.floor(window.innerWidth / 2),
      y1: Math.floor(window.innerHeight / 1.02),
      length: 60,
      angle: -Math.PI / 2,
      depth: MAX_BRANCHING,
      branchWidth: TRUNK_WIDTH
    });
  };

  const init = () => {
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    growTree().then(console.log);
  };

  const renderBranch = ({ x1, y1, x2, y2, branchWidth }) => {
    const line = document.createElementNS(SVG_NS, "line");
    const style = `stroke:${BRANCH_COLOR};stroke-width:${branchWidth};z-index:1;`;

    line.setAttribute("x1", x1);
    line.setAttribute("x2", x2);
    line.setAttribute("y1", y1);
    line.setAttribute("y2", y2);
    line.setAttribute("style", style);

    svg.appendChild(line);
  };

  init();
})();
