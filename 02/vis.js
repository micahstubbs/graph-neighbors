/* global d3 */

const data = {
  nodes: [
                  { size: 10 },
                  { size: 5 },
                  { size: 2 },
                  { size: 3 },
                  { size: 30 },
                  { size: 40 },
  ],
  links: [
                  { source: 0, target: 1 },
                  { source: 0, target: 2 },
                  { source: 1, target: 0 },
                  { source: 3, target: 0 },
                  { source: 4, target: 1 },
  ],
};

const mouseOverFunction = function (d) {
  const circle = d3.select(this);

  node
    .transition(500)
      .style('opacity', o => isConnected(o, d) ? 1.0 : 0.2)
      .style('fill', (o) => {
        if (isConnectedAsTarget(o, d) && isConnectedAsSource(o, d)) {
          fillcolor = 'green';
        } else if (isConnectedAsSource(o, d)) {
          fillcolor = 'red';
        } else if (isConnectedAsTarget(o, d)) {
          fillcolor = 'blue';
        } else if (isEqual(o, d)) {
          fillcolor = 'hotpink';
        } else {
          fillcolor = '#000';
        }
        return fillcolor;
      });

  link
    .transition(500)
      .style('stroke-opacity', o => o.source === d || o.target === d ? 1 : 0.2)
      .transition(500)
      .attr('marker-end', o => o.source === d || o.target === d ? 'url(#arrowhead)' : 'url()');

  circle
    .transition(500)
      .attr('r', () => 1.4 * node_radius(d));
};

const mouseOutFunction = function () {
  const circle = d3.select(this);

  node
    .transition(500);

  link
    .transition(500);

  circle
    .transition(500)
      .attr('r', node_radius);
};

function isConnected(a, b) {
  return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
}

function isConnectedAsSource(a, b) {
  return linkedByIndex[`${a.index},${b.index}`];
}

function isConnectedAsTarget(a, b) {
  return linkedByIndex[`${b.index},${a.index}`];
}

function isEqual(a, b) {
  return a.index == b.index;
}

function tick() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('transform', d => `translate(${d.x},${d.y})`);
}

function node_radius(d) { return Math.pow(40.0 * d.size, 1 / 3); }

const width = 1000;
const height = 500;

const nodes = data.nodes;
const links = data.links;

const force = d3.layout.force()
              .nodes(nodes)
              .links(links)
              .charge(-3000)
              .friction(0.6)
              .gravity(0.6)
              .size([width, height])
              .start();

let linkedByIndex = {};
links.forEach((d) => {
  linkedByIndex[`${d.source.index},${d.target.index}`] = true;
});

const svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height);

let link = svg.selectAll('line')
              .data(links)
            .enter().append('line');

let node = svg.selectAll('.node')
              .data(nodes)
            .enter().append('g')
              .attr('class', 'node')
              .call(force.drag);

node
  .append('circle')
  .attr('r', node_radius)
  .on('mouseover', mouseOverFunction)
  .on('mouseout', mouseOutFunction);

svg
  .append('marker')
  .attr('id', 'arrowhead')
  .attr('refX', 6 + 7) // Controls the shift of the arrow head along the path
  .attr('refY', 2)
  .attr('markerWidth', 6)
  .attr('markerHeight', 4)
  .attr('orient', 'auto')
  .append('path')
    .attr('d', 'M 0,0 V 4 L6,2 Z');

link
  .attr('marker-end', 'url()');

force
  .on('tick', tick);
