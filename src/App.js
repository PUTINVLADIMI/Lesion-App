import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, Calendar, Clock, FileText } from 'lucide-react';

const PainTracker = () => {
  const [entries, setEntries] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    painLevel: 0,
    note: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5)
  });

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedEntries = localStorage.getItem('painEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Guardar en localStorage cuando cambien las entradas
  useEffect(() => {
    localStorage.setItem('painEntries', JSON.stringify(entries));
  }, [entries]);

  const painLevels = [
    { level: 0, label: 'No Pain', color: 'bg-green-500', category: 'NONE' },
    { level: 1, label: 'Very Mild', color: 'bg-green-400', category: 'NONE' },
    { level: 2, label: 'Discomforting', color: 'bg-green-300', category: 'MILD' },
    { level: 3, label: 'Tolerable', color: 'bg-yellow-300', category: 'MILD' },
    { level: 4, label: 'Distressing', color: 'bg-yellow-400', category: 'MODERATE' },
    { level: 5, label: 'Very Distressing', color: 'bg-yellow-500', category: 'MODERATE' },
    { level: 6, label: 'Intense', color: 'bg-orange-400', category: 'MODERATE' },
    { level: 7, label: 'Very Intense', color: 'bg-orange-500', category: 'SEVERE' },
    { level: 8, label: 'Utterly Horrible', color: 'bg-red-500', category: 'SEVERE' },
    { level: 9, label: 'Unbearable', color: 'bg-red-600', category: 'SEVERE' },
    { level: 10, label: 'Unspeakable', color: 'bg-red-700', category: 'SEVERE' }
  ];

  const getPainInfo = (level) => painLevels.find(p => p.level === level);

  const getEmoji = (level) => {
    if (level === 0) return '😊';
    if (level <= 2) return '🙂';
    if (level <= 4) return '😐';
    if (level <= 6) return '😟';
    if (level <= 8) return '😰';
    return '😱';
  };

  const handleSaveEntry = () => {
    const newEntry = {
      ...currentEntry,
      id: Date.now(),
      timestamp: new Date(`${currentEntry.date}T${currentEntry.time}`).toISOString(),
      painInfo: getPainInfo(currentEntry.painLevel)
    };
    
    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry({
      painLevel: 0,
      note: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5)
    });
    setShowNewEntry(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `hoy ${date.toTimeString().slice(0, 5)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `ayer ${date.toTimeString().slice(0, 5)}`;
    } else {
      return `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('es', { month: 'short' })} ${date.getFullYear()} ${date.toTimeString().slice(0, 5)}`;
    }
  };

  const getChartData = () => {
    const sortedEntries = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return sortedEntries.slice(-10).map((entry, index) => ({
      time: new Date(entry.timestamp).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
      pain: entry.painLevel,
      fullTime: new Date(entry.timestamp).toLocaleString('es')
    }));
  };

  const getAveragePain = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.painLevel, 0);
    return (sum / entries.length).toFixed(1);
  };

  if (showReport) {
    const chartData = getChartData();
    const avgPain = getAveragePain();
    
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowReport(false)}
              className="text-blue-400 text-lg"
            >
              Close
            </button>
            <h1 className="text-2xl font-bold">Report</h1>
            <div></div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Line 
                  type="monotone" 
                  dataKey="pain" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-red-400">— Unit: Pain Scale</span>
              <span className="text-gray-400">- - - Average: {avgPain}</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Options</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Start date</span>
                <span className="bg-gray-700 px-3 py-1 rounded">
                  {entries.length > 0 ? new Date(entries[entries.length - 1].timestamp).toLocaleDateString('es') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>End date</span>
                <span className="bg-gray-700 px-3 py-1 rounded">
                  {entries.length > 0 ? new Date(entries[0].timestamp).toLocaleDateString('es') : 'N/A'}
                </span>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                GENERATE REPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showNewEntry) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowNewEntry(false)}
              className="text-blue-400 text-lg"
            >
              ← Pain Scales
            </button>
            <h1 className="text-lg font-semibold">New Pain Scale</h1>
            <button
              onClick={handleSaveEntry}
              className="text-blue-400 text-lg font-semibold"
            >
              Save
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              {painLevels.map((pain) => (
                <div
                  key={pain.level}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    currentEntry.painLevel === pain.level 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setCurrentEntry(prev => ({ ...prev, painLevel: pain.level }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${pain.color}`}></div>
                    <span>{pain.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      {pain.level}
                    </span>
                    <span className="text-2xl">{getEmoji(pain.level)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={currentEntry.date}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Time</label>
                  <input
                    type="time"
                    value={currentEntry.time}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <textarea
              placeholder="Note..."
              value={currentEntry.note}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, note: e.target.value }))}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none border-none outline-none"
              rows="3"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowReport(true)}
            className="text-blue-400 text-2xl"
          >
            <TrendingUp size={24} />
          </button>
          <h1 className="text-2xl font-bold">Pain Scales</h1>
          <button className="text-blue-400 text-2xl">
            <FileText size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${entry.painInfo.color}`}>
                    {entry.painLevel}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{entry.painInfo.label}</span>
                      <span className="text-xs text-green-400 bg-green-400 bg-opacity-20 px-2 py-1 rounded">
                        [{entry.painInfo.category}]
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>(0 minutes)</span>
                      </div>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-gray-300 mt-2 italic">
                        {entry.note.length > 50 ? `${entry.note.substring(0, 50)}...` : entry.note}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-gray-500">›</span>
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p>No hay registros aún</p>
            <p className="text-sm mt-2">Presiona el botón + para empezar a registrar tu dolor</p>
          </div>
        )}

        <button
          onClick={() => setShowNewEntry(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default PainTracker;