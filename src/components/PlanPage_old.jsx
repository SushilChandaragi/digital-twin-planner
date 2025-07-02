import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

import schoolImg from '../assets/school.png';
import waterImg from '../assets/water.png';
import houseImg from '../assets/house.png';
import roadImg from '../assets/road.png';

const resourceIcons = {
  // Basic Infrastructure
  school: schoolImg,
  water: waterImg,
  house: houseImg,
  road: roadImg,
  
  // Healthcare & Emergency
  hospital: '🏥', // You can use emojis or add actual images
  fireStation: '🚒',
  police: '🚔',
  
  // Recreation & Commerce
  park: '🌳',
  mall: '🏬',
  restaurant: '🍽️',
  
  // Transportation
  busStop: '🚌',
  gasStation: '⛽',
  parking: '🅿️',
  
  // Utilities
  powerPlant: '⚡',
  recycling: '♻️',
  tower: '📡',
};

// Helper function to get color for each resource type
const getResourceColor = (type) => {
  const colorMap = {
    school: 'deepskyblue',
    water: 'limegreen',
    house: '#0ff',
    road: '#0ff',
    hospital: 'red',
    fireStation: 'orange',
    police: 'blue',
    park: 'forestgreen',
    mall: 'purple',
    restaurant: 'gold',
    busStop: 'yellow',
    gasStation: 'orange',
    parking: 'gray',
    powerPlant: 'yellow',
    recycling: 'green',
    tower: 'silver',
  };
  return colorMap[type] || '#0ff';
};

function PlanPage() {
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]);
  const [droppedResources, setDroppedResources] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [locationReady, setLocationReady] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [iconSizes, setIconSizes] = useState({});
  const [iconRotations, setIconRotations] = useState({});
  const [mapZoom, setMapZoom] = useState(15);
  const [resourceRadii, setResourceRadii] = useState({
    school: 800,
    water: 500,
    hospital: 1200,      // Larger service area
    fireStation: 1000,   // Emergency response area
    police: 1500,        // Patrol area
    park: 600,           // Recreation area
    mall: 400,           // Commercial area
    busStop: 300,        // Transit coverage
    restaurant: 200,     // Dining area
    gasStation: 250,     // Service area
    parking: 150,        // Parking coverage
    powerPlant: 2000,    // Power grid coverage
    recycling: 500,      // Collection area
    tower: 3000,         // Communication coverage
  });
  const mapRef = useRef();
  const navigate = useNavigate();

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
      setLocationReady(true);
      if (mapRef.current) {
        mapRef.current.setView(coords, 15);
      }
    });
  }, []);

  // Listen for zoom changes
  function ZoomListener() {
    const map = useMap();
    useEffect(() => {
      const onZoom = () => setMapZoom(map.getZoom());
      map.on('zoom', onZoom);
      setMapZoom(map.getZoom());
      return () => map.off('zoom', onZoom);
    }, [map]);
    return null;
  }

  function MapWithRef() {
    const map = useMapEvents({});
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  }

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (draggedItem) {
          setDroppedResources((prev) => [
            ...prev,
            {
              type: draggedItem,
              position: e.latlng,
              radius: resourceRadii[draggedItem] || undefined, // <-- always set radius
            },
          ]);
        } else {
          setSelectedIdx(null);
        }
      },
    });
    return null;
  };

  // --- Overlay controls on selected icon ---
  function IconOverlay() {
    if (
      selectedIdx === null ||
      !droppedResources[selectedIdx] ||
      !mapRef.current
    )
      return null;

    const res = droppedResources[selectedIdx];
    // Base size at zoom 15, scale with zoom
    const baseSize = iconSizes[selectedIdx] || 40;
    const scale = Math.pow(2, mapZoom - 15); // double size per +1 zoom, halve per -1
    const size = baseSize * scale;
    const rotation = iconRotations[selectedIdx] || 0;
    const point = mapRef.current.latLngToContainerPoint(res.position);

    // Overlay position
    return (
      <div
        style={{
          position: 'absolute',
          left: point.x - size / 2,
          top: point.y - size / 2,
          width: size,
          height: size,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {/* Main icon */}
        <img
          src={resourceIcons[res.type]}
          alt={res.type}
          style={{
            width: size,
            height: size,
            transform: `rotate(${rotation}deg)`,
            pointerEvents: 'auto',
            cursor: 'move',
            boxShadow: '0 0 8px #0ff8',
            border: '2px solid #0ff',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.2)',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
          onMouseDown={e => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startPoint = mapRef.current.latLngToContainerPoint(res.position);

            function onMove(moveEvt) {
              const dx = moveEvt.clientX - startX;
              const dy = moveEvt.clientY - startY;
              const newPoint = L.point(startPoint.x + dx, startPoint.y + dy);
              const newLatLng = mapRef.current.containerPointToLatLng(newPoint);
              setDroppedResources(resources =>
                resources.map((r, i) =>
                  i === selectedIdx ? { ...r, position: newLatLng } : r
                )
              );
            }
            function onUp() {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            }
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />
        {/* Resize handle (bottom right) */}
        <div
          style={{
            position: 'absolute',
            right: -10,
            bottom: -10,
            width: 18,
            height: 18,
            background: '#0ff',
            borderRadius: '50%',
            border: '2px solid #23272f',
            cursor: 'nwse-resize',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
          onMouseDown={e => {
            e.stopPropagation();
            const startY = e.clientY;
            const startSize = baseSize;
            const onMove = moveEvt => {
              const delta = moveEvt.clientY - startY;
              setIconSizes(sizes => ({
                ...sizes,
                [selectedIdx]: Math.max(3, startSize + delta / scale), // allow icons as small as 8px
              }));
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
          title="Resize"
        >
          <span style={{ color: '#23272f', fontWeight: 'bold' }}>↔</span>
        </div>
        {/* Rotate handle (top center) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -28,
            transform: 'translateX(-50%)',
            width: 18,
            height: 18,
            background: '#0ff',
            borderRadius: '50%',
            border: '2px solid #23272f',
            cursor: 'grab',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
          onMouseDown={e => {
            e.stopPropagation();
            const startY = e.clientY;
            const startRotation = rotation;
            const onMove = moveEvt => {
              const delta = moveEvt.clientY - startY;
              setIconRotations(rot => ({
                ...rot,
                [selectedIdx]: (startRotation + delta * 2) % 360,
              }));
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
          title="Rotate"
        >
          <span style={{ color: '#23272f', fontWeight: 'bold' }}>⟳</span>
        </div>
        {/* Remove button (top right) */}
        <div
          style={{
            position: 'absolute',
            right: -12,
            top: -12,
            width: 20,
            height: 20,
            background: '#f55',
            borderRadius: '50%',
            border: '2px solid #fff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 2,
          }}
          onClick={() => {
            setDroppedResources(droppedResources.filter((_, i) => i !== selectedIdx));
            setSelectedIdx(null);
          }}
          title="Remove"
        >
          ×
        </div>
      </div>
    );
  }

  useEffect(() => {
    setDroppedResources(resources =>
      resources.map(r =>
        (r.type === 'school' || r.type === 'water')
          ? { ...r, radius: resourceRadii[r.type] }
          : r
      )
    );
  }, [resourceRadii]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', background: 'linear-gradient(120deg, #181c24 0%, #23272f 100%)' }}>
      {/* Back Button (top left, outside resource panel) */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          background: 'rgba(0,255,255,0.12)',
          border: 'none',
          borderRadius: 8,
          color: '#0ff',
          fontWeight: 700,
          fontSize: 18,
          padding: '8px 22px',
          cursor: 'pointer',
          boxShadow: '0 0 8px #0ff4',
          zIndex: 2100,
        }}
      >
        ← Back
      </button>

      {/* Resource Panel Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: 0,
          width: '22vw',
          minWidth: 140,
          height: '80vh',
          background: 'rgba(24,28,36,0.95)',
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow: '4px 0 20px rgba(0,255,255,0.15)',
          border: '1px solid rgba(0,255,255,0.2)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 12px 18px 12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h4 style={{ 
          color: '#0ff', 
          margin: '0 0 20px 0', 
          fontWeight: 700, 
          letterSpacing: 1.2,
          fontSize: '1.1rem',
          textAlign: 'center',
          textShadow: '0 0 8px rgba(0,255,255,0.3)'
        }}>
          Resources
        </h4>
        {/* Resource Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          width: '100%',
          justifyItems: 'center',
          marginBottom: 12,
          maxHeight: '75vh',
          overflowY: 'auto',
          paddingRight: '8px',
        }}>
          {/* School */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <img
              src={schoolImg}
              alt="school"
              width={28}
              height={28}
              style={{ 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('school')}
            />
            <span style={{ 
              fontSize: '10px', 
              color: 'deepskyblue',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              School
            </span>
            <input
              type="number"
              min={50}
              max={3000}
              step={50}
              value={resourceRadii.school}
              onChange={e => setResourceRadii(r => ({ ...r, school: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'deepskyblue',
                border: '1px solid deepskyblue',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'deepskyblue', opacity: 0.7 }}>meters</span>
          </div>

          {/* Water */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <img
              src={waterImg}
              alt="water"
              width={28}
              height={28}
              style={{ 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('water')}
            />
            <span style={{ 
              fontSize: '10px', 
              color: 'limegreen',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Water
            </span>
            <input
              type="number"
              min={50}
              max={3000}
              step={50}
              value={resourceRadii.water}
              onChange={e => setResourceRadii(r => ({ ...r, water: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'limegreen',
                border: '1px solid limegreen',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'limegreen', opacity: 0.7 }}>meters</span>
          </div>

          {/* House */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <img
              src={houseImg}
              alt="house"
              width={28}
              height={28}
              style={{ 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('house')}
            />
            <span style={{ 
              fontSize: '10px', 
              color: '#0ff',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              House
            </span>
          </div>

          {/* Road */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <img
              src={roadImg}
              alt="road"
              width={28}
              height={28}
              style={{ 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('road')}
            />
            <span style={{ 
              fontSize: '10px', 
              color: '#0ff',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Road
            </span>
          </div>

          {/* NEW ELEMENTS */}
          
          {/* Hospital */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('hospital')}
            >
              🏥
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'red',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Hospital
            </span>
            <input
              type="number"
              min={100}
              max={5000}
              step={100}
              value={resourceRadii.hospital}
              onChange={e => setResourceRadii(r => ({ ...r, hospital: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'red',
                border: '1px solid red',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'red', opacity: 0.7 }}>meters</span>
          </div>

          {/* Fire Station */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('fireStation')}
            >
              🚒
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'orange',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Fire Station
            </span>
            <input
              type="number"
              min={100}
              max={3000}
              step={100}
              value={resourceRadii.fireStation}
              onChange={e => setResourceRadii(r => ({ ...r, fireStation: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'orange',
                border: '1px solid orange',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'orange', opacity: 0.7 }}>meters</span>
          </div>

          {/* Police Station */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('police')}
            >
              🚔
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'blue',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Police
            </span>
            <input
              type="number"
              min={200}
              max={5000}
              step={100}
              value={resourceRadii.police}
              onChange={e => setResourceRadii(r => ({ ...r, police: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'blue',
                border: '1px solid blue',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'blue', opacity: 0.7 }}>meters</span>
          </div>

          {/* Park */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('park')}
            >
              🌳
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'forestgreen',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Park
            </span>
            <input
              type="number"
              min={100}
              max={2000}
              step={50}
              value={resourceRadii.park}
              onChange={e => setResourceRadii(r => ({ ...r, park: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'forestgreen',
                border: '1px solid forestgreen',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'forestgreen', opacity: 0.7 }}>meters</span>
          </div>
          {/* Bus Stop */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('busStop')}
            >
              🚌
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'yellow',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Bus Stop
            </span>
            <input
              type="number"
              min={50}
              max={800}
              step={25}
              value={resourceRadii.busStop}
              onChange={e => setResourceRadii(r => ({ ...r, busStop: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'yellow',
                border: '1px solid yellow',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'yellow', opacity: 0.7 }}>meters</span>
          </div>

          {/* Power Plant */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('powerPlant')}
            >
              ⚡
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'yellow',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Power Plant
            </span>
            <input
              type="number"
              min={500}
              max={5000}
              step={100}
              value={resourceRadii.powerPlant}
              onChange={e => setResourceRadii(r => ({ ...r, powerPlant: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'yellow',
                border: '1px solid yellow',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'yellow', opacity: 0.7 }}>meters</span>
          </div>

          {/* Recycling Center */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('recycling')}
            >
              ♻️
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'green',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Recycling
            </span>
            <input
              type="number"
              min={100}
              max={1000}
              step={50}
              value={resourceRadii.recycling}
              onChange={e => setResourceRadii(r => ({ ...r, recycling: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'green',
                border: '1px solid green',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'green', opacity: 0.7 }}>meters</span>
          </div>

          {/* Communication Tower */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(0,255,255,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            width: '100%',
            minHeight: '80px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.1)';
            e.target.style.borderColor = 'rgba(0,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0,255,255,0.05)';
            e.target.style.borderColor = 'rgba(0,255,255,0.1)';
          }}>
            <div 
              style={{ 
                fontSize: 28, 
                cursor: 'grab', 
                filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.4))',
                marginBottom: '6px'
              }}
              onClick={() => setDraggedItem('tower')}
            >
              📡
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: 'silver',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Tower
            </span>
            <input
              type="number"
              min={1000}
              max={8000}
              step={200}
              value={resourceRadii.tower}
              onChange={e => setResourceRadii(r => ({ ...r, tower: Number(e.target.value) }))}
              style={{
                width: '35px',
                background: 'rgba(24,28,36,0.8)',
                color: 'silver',
                border: '1px solid silver',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '8px', color: 'silver', opacity: 0.7 }}>meters</span>
          </div>

        </div>
        <p style={{ fontSize: '0.8em', color: '#0ff', marginTop: 8, textAlign: 'center' }}>
          Click an icon, then click on map to place it.
        </p>
      </div>

      {/* Save Button (bottom left, outside resource panel) */}
      <button
        style={{
          position: 'absolute',
          left: 32,
          bottom: 32,
          width: '11vw',
          minWidth: 90,
          padding: '10px 0',
          fontSize: 18,
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(90deg, #0ff, #09f)',
          color: '#000',
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: '0 0 16px #0ff8',
          cursor: 'pointer',
          outline: 'none',
          zIndex: 2100,
        }}
        onClick={() => alert('Layout saved!')}
      >
        Save
      </button>

      {/* Map Area */}
      <div style={{ height: '100vh', width: '100vw' }}>
        <MapContainer
          center={userLocation}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='Tiles &copy; Esri & contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <ZoomListener />
          <MapWithRef />
          <MapClickHandler />
          <ZoomControl position="topright" />
          {locationReady && (
            <>
              <Marker
                position={userLocation}
                icon={L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                })}
              />
              <Circle
                center={userLocation}
                radius={30}
                pathOptions={{
                  color: '#2e7d32',
                  fillColor: '#b7be9a',
                  fillOpacity: 0.3,
                }}
              />
            </>
          )}
          {droppedResources.map((res, idx) => {
            const size = (iconSizes[idx] || 40) * Math.pow(2, mapZoom - 15);
            const rotation = iconRotations[idx] || 0;
            const isSelected = selectedIdx === idx;
            const icon = resourceIcons[res.type];
            
            // Check if icon is an image URL (contains '.' for file extension) or emoji
            const isImageIcon = typeof icon === 'string' && icon.includes('.');
            
            return (
              <React.Fragment key={idx}>
                <Marker
                  position={res.position}
                  eventHandlers={{
                    click: () => setSelectedIdx(idx),
                  }}
                  icon={L.divIcon({
                    html: isImageIcon 
                      ? `<img src="${icon}" style="width:${size}px;height:${size}px;transform:rotate(${rotation}deg);${isSelected ? 'box-shadow:0 0 12px #0ff,0 0 24px #0ff;border-radius:50%;' : ''}" />`
                      : `<div style="width:${size}px;height:${size}px;font-size:${size * 0.8}px;display:flex;align-items:center;justify-content:center;transform:rotate(${rotation}deg);${isSelected ? 'box-shadow:0 0 12px #0ff,0 0 24px #0ff;border-radius:50%;background:rgba(0,255,255,0.2);' : ''}">${icon}</div>`,
                    iconSize: [size, size],
                    className: 'custom-marker-icon',
                  })}
                />
                {res.radius && (
                  <Circle
                    center={res.position}
                    radius={res.radius}
                    pathOptions={{
                      color: getResourceColor(res.type),
                      fillColor: getResourceColor(res.type),
                      fillOpacity: 0.15,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
        {/* Overlay controls for selected icon */}
        <IconOverlay />
      </div>
    </div>
  );
}

export default PlanPage;
