/* global d3 */

d3.json('graph.json', (error, graph) => {
  const width = 960;
  const height = 700;

  const simulation = d3.forceSimulation()
    .nodes(graph.nodes)
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody().strength([-250]))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked);

  simulation.force('link')
    .links(graph.links)
    .distance([85]);

  const R = 18;

  const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  // add defs-marker
  // add defs-markers
  svg.append('svg:defs').selectAll('marker')
    .data([{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }])
    .enter().append('marker')
      .attr('id', d => d.id)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 2 + R)
      .attr('refY', 5)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,0 L0,10 L10,5 z')
        .style('opacity', d => d.opacity);

  let link = svg.selectAll('line')
    .data(graph.links)
    .enter().append('line');

  link  
    .attr('class', 'link')
    .attr('marker-end', 'url(#end-arrow)')
    .on('mouseout', fade(1));

  let node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('g')
    .attr('class', 'node');

  node.append('circle')
    .attr('r', R)
    .on('mouseover', fade(0.1))
    .on('mouseout', fade(1))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append('text')
    .attr('x', 0)
    .attr('dy', '.35em')
    .text(d => d.name);

  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

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

  const linkedByIndex = {};
  graph.links.forEach(d => {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });

  function isConnected(a, b) {
    return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
  }

  function fade(opacity) {
    return d => {
      node.style('stroke-opacity', function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
      link.attr('marker-end', o => (opacity === 1 || o.source === d || o.target === d ? 'url(#end-arrow)' : 'url(#end-arrow-fade)'));
    };
  }
})
