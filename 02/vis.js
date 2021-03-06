/* global d3 */

const graph = {
  nodes: [
    { id: 0, size: 10 },
    { id: 1, size: 5 },
    { id: 2, size: 2 },
    { id: 3, size: 3 },
    { id: 4, size: 30 },
    { id: 5, size: 40 },
  ],
  links: [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 0 },
    { source: 3, target: 0 },
    { source: 4, target: 1 },
  ],
};

const width = 960;
const height = 500;

const mouseOverFunction = function (d) {
  const circle = d3.select(this);

  node
    .transition(500)
      .style('opacity', o => {
        const isConnectedValue = isConnected(o, d);
        if (isConnectedValue) {
          return 1.0;
        }
        return 0.2
      })
      .style('fill', (o) => {
        let fillColor;
        if (isConnectedAsTarget(o, d) && isConnectedAsSource(o, d)) {
          fillColor = 'green';
        } else if (isConnectedAsSource(o, d)) {
          fillColor = 'red';
        } else if (isConnectedAsTarget(o, d)) {
          fillColor = 'blue';
        } else if (isEqual(o, d)) {
          fillColor = 'hotpink';
        } else {
          fillColor = '#000';
        }
        return fillColor;
      });

  link
    .transition(500)
      .style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : 0.2))
      .transition(500)
      .attr('marker-end', o => (o.source === d || o.target === d ? 'url(#arrowhead)' : 'url()'));

  circle
    .transition(500)
      .attr('r', () => 1.4 * nodeRadius(d));
};

const mouseOutFunction = function () {
  const circle = d3.select(this);

  node
    .transition(500);

  link
    .transition(500);

  circle
    .transition(500)
      .attr('r', nodeRadius);
};

const nodes = graph.nodes;
const links = graph.links;

const simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id(d => d.id))
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2));

  // const simulation = d3.forceSimulation()
  //   .nodes(nodes)
  // .links(links)
  // .charge(-3000)
  // .friction(0.6)
  // .gravity(0.6)
  // .size([width, height])
  // .start();

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

let link = svg.selectAll('line')
  .data(graph.links)
  .enter().append('line');

let node = svg.selectAll('.node')
  .data(graph.nodes)
  .enter().append("g")
    .attr('class', 'node');

node
  .append('circle')
    .attr("r", nodeRadius)
    .on('mouseover', mouseOverFunction)
    .on('mouseout', mouseOutFunction)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

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

simulation
  .nodes(graph.nodes)
  .on('tick', ticked);

simulation.force('link')
  .links(graph.links);

let linkedByIndex = {};
links.forEach((d) => {
  linkedByIndex[`${d.source.index},${d.target.index}`] = true;
});
console.log('linkedByIndex', linkedByIndex);

function isConnected(a, b) {
  return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index === b.index;
}

function isConnectedAsSource(a, b) {
  return linkedByIndex[`${a.index},${b.index}`];
}

function isConnectedAsTarget(a, b) {
  return linkedByIndex[`${b.index},${a.index}`];
}

function isEqual(a, b) {
  return a.index === b.index;
}

function ticked() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('transform', d => `translate(${d.x},${d.y})`);
  }

function nodeRadius(d) { return Math.pow(40.0 * d.size, 1 / 3); }

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
