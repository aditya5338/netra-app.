import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, Map as MapIcon, Share2, Settings, Target, Shield,
  Plus, X, MapPin, Calendar, Copy, CheckCircle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ForceGraph2D from 'react-force-graph-2d';

export default function App() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState({ anomaly: "Loading API...", correlation: "Loading API...", syndicates: "Loading API..." });
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [incidentsList, setIncidentsList] = useState([]);
  
  const [mapStyle, setMapStyle] = useState('light');
  const [isCopied, setIsCopied] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    crime_type: 'Cybercrime',
    district: 'Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    crime_date: '2026-07-12T12:00' 
  });

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Date Unknown";
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleCopyIntel = () => {
    const latest = incidentsList[incidentsList.length - 1];
    let brief = "No recent incidents in database.";
    if (latest) {
      brief = `🚨 NETRA TACTICAL ALERT 🚨\n\nIncident: ${latest.crime_type}\nLocation: ${latest.district}\nCoordinates: Lat ${latest.lat.toFixed(4)}, Lng ${latest.lng.toFixed(4)}\nTimestamp: ${formatDisplayDate(latest.crime_date)}\n\nStatus: Uploaded to live secure database. Requesting unit deployment.`;
    }
    navigator.clipboard.writeText(brief);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

 useEffect(() => {
    fetch("https://netra-app.onrender.com/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch("https://netra-app.onrender.com/api/network")
      .then(res => res.json())
      .then(data => setNetworkData(data))
      .catch(err => console.error(err));

    fetch("https://netra-app.onrender.com/api/incidents")
      .then(res => res.json())
      .then(data => setIncidentsList(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activePage === 'map' || activePage === 'dashboard') {
      setTimeout(() => {
        if (mapContainer.current) {
          if (mapInstance.current) {
            mapInstance.current.remove();
          }

          mapInstance.current = L.map(mapContainer.current, { zoomControl: false }).setView([12.9716, 77.5946], 12);
          
          let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; 
          if (mapStyle === 'dark') tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
          if (mapStyle === 'satellite') tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

          L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstance.current);

          incidentsList.forEach(incident => {
            const isCritical = incident.crime_type === 'Cybercrime';
            L.circleMarker([incident.lat, incident.lng], { 
              color: isCritical ? '#dc2626' : '#2563eb', 
              fillColor: isCritical ? '#dc2626' : '#2563eb', 
              fillOpacity: 0.8, 
              radius: isCritical ? 14 : 8
            }).bindPopup(`<b>${incident.crime_type}</b><br/>${incident.district}`).addTo(mapInstance.current);
          });
        }
      }, 100);
    } else {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    }
  }, [activePage, incidentsList, mapStyle]);

  const handleReportThreat = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Add /api/ here as well!
      const response = await fetch("https://netra-app.onrender.com/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIncidentsList(prev => [...prev, formData]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to report threat:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans relative">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 z-50 shadow-sm fixed h-full">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-2 shadow-md">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xs text-blue-600 tracking-tighter">NETRA</span>
        </div>
        <nav className="flex flex-col gap-2 w-full">
          <button onClick={() => setActivePage('dashboard')} className={`flex items-center justify-center h-12 w-full transition-colors ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}><Activity className="w-6 h-6" /></button>
          <button onClick={() => setActivePage('map')} className={`flex items-center justify-center h-12 w-full transition-colors ${activePage === 'map' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}><MapIcon className="w-6 h-6" /></button>
          <button onClick={() => setActivePage('share')} className={`flex items-center justify-center h-12 w-full transition-colors ${activePage === 'share' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}><Share2 className="w-6 h-6" /></button>
          <button onClick={() => setActivePage('settings')} className={`flex items-center justify-center h-12 w-full transition-colors ${activePage === 'settings' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}><Settings className="w-6 h-6" /></button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-20 flex-1 flex flex-col p-6 gap-6 h-screen overflow-hidden">
        
        <header className="flex justify-between items-center w-full flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activePage === 'dashboard' ? 'Intelligence Hub' : 
               activePage === 'settings' ? 'Tactical Configurations' : 
               activePage === 'share' ? 'Intel Export' : 'Tactical Map View'}
            </h1>
            <p className="text-sm text-slate-500">Real-time Networked Evidence & Trend Risk Analytics</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live DB Connected</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">
              <Plus className="w-4 h-4" /> Report Threat
            </button>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <div className="flex flex-col gap-6 flex-1 min-h-0">
            <section className="grid grid-cols-3 gap-6 h-32 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anomaly Detection</h3>
                <span className="text-lg font-bold text-blue-700">{stats.anomaly}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Socio-Economic Link</h3>
                <span className="text-lg font-bold text-amber-600">{stats.correlation}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Syndicates</h3>
                <span className="text-lg font-bold text-blue-700">{stats.syndicates}</span>
              </div>
            </section>

            <div className="flex-1 flex gap-6 min-h-0">
              <section className="flex-[2] bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Live Threat Feed
                  </h2>
                  <span className="text-xs font-bold text-slate-400">{incidentsList.length} Total Logs</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
                  {incidentsList.slice().reverse().map((incident, index) => {
                    const isCritical = incident.crime_type === 'Cybercrime';
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className={`font-bold text-sm ${isCritical ? 'text-red-700' : 'text-blue-700'}`}>{incident.crime_type}</p>
                            <div className="mt-1 flex flex-col gap-1">
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {incident.district} (Lat: {incident.lat.toFixed(2)}, Lng: {incident.lng.toFixed(2)})
                              </p>
                              <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {formatDisplayDate(incident.crime_date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setActivePage('map')} className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:text-blue-600 hover:border-blue-300 transition-colors">
                          Locate
                        </button>
                      </div>
                    );
                  })}
                  {incidentsList.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center mt-10">No recent incidents detected in database.</p>
                  )}
                </div>
              </section>

              <section className="flex-[1] bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col min-w-[350px]">
                <div className="mb-4 flex justify-between items-start flex-shrink-0">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link Analysis</h2>
                  <Share2 className="text-slate-400 w-4 h-4" />
                </div>
                <div className="flex-grow rounded-lg bg-slate-50 flex items-center justify-center relative overflow-hidden border border-slate-200 cursor-grab active:cursor-grabbing">
                  {networkData.nodes.length > 0 ? (
                    <ForceGraph2D
                      graphData={networkData}
                      width={310} height={350}
                      nodeLabel="name" nodeVal={4}
                      nodeColor={(node) => {
                        if (node.group === 1) return '#dc2626';
                        if (node.group === 2) return '#334155';
                        if (node.group === 3) return '#2563eb';
                        return '#0ea5e9';
                      }}
                      linkColor={() => '#94a3b8'} linkWidth={1.5}
                      backgroundColor="#f8fafc"
                      cooldownTicks={50} d3VelocityDecay={0.8}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic z-10">Initializing AI Network...</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activePage === 'map' && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-lg">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Target className="w-4 h-4 text-red-600" /> Tactical View Active
               </h3>
               <p className="text-sm text-slate-500">Live monitoring of all geographical nodes.</p>
            </div>
            <div ref={mapContainer} className="flex-1 w-full h-full z-0 bg-slate-100"></div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center">
            <Settings className="w-16 h-16 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Tactical Map Configurations</h2>
            
            <div className="flex gap-6 w-full max-w-2xl">
              <button 
                onClick={() => setMapStyle('light')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${mapStyle === 'light' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <MapIcon className={`w-8 h-8 ${mapStyle === 'light' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-700">Standard Light</span>
              </button>
              
              <button 
                onClick={() => setMapStyle('dark')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${mapStyle === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <Activity className={`w-8 h-8 ${mapStyle === 'dark' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-700">Night Operations</span>
              </button>
              
              <button 
                onClick={() => setMapStyle('satellite')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${mapStyle === 'satellite' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <Target className={`w-8 h-8 ${mapStyle === 'satellite' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-700">Satellite Feed</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-8 text-center max-w-lg">
              Selecting a new configuration will instantly update the map tiles across the entire intelligence hub.
            </p>
          </div>
        )}

        {activePage === 'share' && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center">
            <Share2 className="w-16 h-16 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Export Threat Intelligence</h2>
            <p className="text-slate-500 mb-8 max-w-md text-center">Generate an instant, formatted briefing for the most recently logged incident in the system.</p>
            
            <button 
              onClick={handleCopyIntel}
              disabled={isCopied}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${isCopied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isCopied ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              {isCopied ? "Briefing Copied to Clipboard!" : "Generate & Copy Briefing"}
            </button>
            
            {incidentsList.length > 0 && (
              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg w-full max-w-lg">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  🚨 NETRA TACTICAL ALERT 🚨{"\n\n"}
                  Incident: {incidentsList[incidentsList.length - 1].crime_type}{"\n"}
                  Location: {incidentsList[incidentsList.length - 1].district}{"\n"}
                  Coordinates: Lat {incidentsList[incidentsList.length - 1].lat.toFixed(4)}, Lng {incidentsList[incidentsList.length - 1].lng.toFixed(4)}{"\n"}
                  Timestamp: {formatDisplayDate(incidentsList[incidentsList.length - 1].crime_date)}{"\n\n"}
                  Status: Uploaded to live secure database. Requesting unit deployment.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- SUBMISSION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" /> Log New Incident
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReportThreat} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Crime Type</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-blue-500"
                  value={formData.crime_type}
                  onChange={(e) => setFormData({...formData, crime_type: e.target.value})}
                >
                  <option>Cybercrime</option>
                  <option>Theft</option>
                  <option>Assault</option>
                  <option>Fraud</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-blue-500 text-slate-700"
                  value={formData.crime_date}
                  onChange={(e) => setFormData({...formData, crime_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-blue-500"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md mt-2 transition-colors disabled:bg-slate-400"
              >
                {isSubmitting ? "Transmitting..." : "Push to Live Database"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}