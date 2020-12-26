import React, { useRef, useEffect } from 'react';

import './Map.css';

const Map = props => {
  const mapRef = useRef();
  var platform = new window.H.service.Platform({
    'apikey': 'erEyfZZlXVMhzLAJY1lJxy9ep2JVJatVUlFD7qUl-Mg'
  });
  const { center, zoom } = props;

  var layer = platform.createDefaultLayers();

  useEffect(() => {
    let map = new window.H.Map(mapRef.current,layer.vector.normal.map, {
      center: center,
      zoom: zoom
    });
  
    let marker = new window.H.map.Marker({ lat: center.lat,lng:center.lng });
    map.addObject(marker);
    // var events = new window.H.mapevents.MapEvents(map);
    // // eslint-disable-next-line
    // var behavior = new window.H.mapevents.Behavior(events);
    // // eslint-disable-next-line
    // var ui = new window.H.ui.UI.createDefault(map, layer);

  }, [center, zoom,layer]);  

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    ></div>
  );
};

export default Map;
