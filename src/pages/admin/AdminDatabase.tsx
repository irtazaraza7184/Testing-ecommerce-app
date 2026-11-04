import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  Plus,
  FileJson,
  Search,
  Sparkles,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';

interface CollectionStat {
  name: string;
  count: number;
  description: string;
  color: string;
}

export const AdminDatabase: React.FC = () => {
  const [stats, setStats] = useState<{
    products: number;
    categories: number;
    orders: number;
    customers: number;
    coupons: number;
    reviews: number;
    inventoryLogs: number;
  }>({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
    coupons: 0,
    reviews: 0,
    inventoryLogs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  const [selectedCollection, setSelectedCollection] = useState<string>('products');
  const [collectionDocs, setCollectionDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocId, setNewDocId] = useState('');
  const [newDocJson, setNewDocJson] = useState('{\n  "title": "Sample Record",\n  "createdAt": "2026-11-04"\n}');

  const toast = useToast();
  const config = firestoreService.getConfig();

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (colName: string) => {
    setLoadingDocs(true);
    try {
      const docs = await firestoreService.getCollectionDocuments(colName);
      setCollectionDocs(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadDocuments(selectedCollection);
    handlePing();
  }, []);

  const handleSelectCollection = (colName: string) => {
    setSelectedCollection(colName);
    loadDocuments(colName);
  };

  const handlePing = async () => {
    setTestingPing(true);
    try {
      const res = await firestoreService.testLiveConnection();
      setPingResult(res);
      if (res.success) {
        toast.success(`Firestore connected (${res.latencyMs}ms)`);
      } else {
        toast.error(`Connection check failed: ${res.message}`);
      }
    } catch (err: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Ping failed',
      });
    } finally {
      setTestingPing(false);
    }
  };

  const handleForceSeed = async () => {
    if (!window.confirm('Populate/overwrite all master products, categories, orders, coupons, and records to your live Firestore database?')) {
      return;
    }
    setSeeding(true);
    try {
      const result = await firestoreService.forceReSeedDatabase();
      toast.success(
        `Database populated: ${result.products} products, ${result.categories} categories, ${result.orders} orders seeded into Firestore.`
      );
      await loadStats();
      await loadDocuments(selectedCollection);
    } catch (err: any) {
      toast.error(`Seeding encountered an error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(newDocJson);
      const docId = newDocId.trim() || `doc-${Date.now()}`;
      // Save directly to firestore
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase');
      await setDoc(doc(db, selectedCollection, docId), {
        ...parsed,
        id: docId,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Document '${docId}' added to collection '${selectedCollection}'.`);
      setShowAddModal(false);
      setNewDocId('');
      loadDocuments(selectedCollection);
      loadStats();
    } catch (err: any) {
      toast.error(`Invalid JSON or write error: ${err.message}`);
    }
  };

  const collectionCards: CollectionStat[] = [
    {
      name: 'products',
      count: stats.products,
      description: 'Luxury design catalog, specs, pricing, and variants',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    },
    {
      name: 'categories',
      count: stats.categories,
      description: 'Living, Acoustics, Illumination, Timepieces, Apparel',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      name: 'orders',
      count: stats.orders,
      description: 'Dispatches, client delivery states, tracking & invoices',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      name: 'customers',
      count: stats.customers,
      description: 'Verified collector profiles, addresses & order counts',
      color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-400',
    },
    {
      name: 'coupons',
      count: stats.coupons,
      description: 'Promotional vouchers, percentage & fixed discounts',
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
    {
      name: 'reviews',
      count: stats.reviews,
      description: 'Verified customer ratings, feedback, and moderation states',
      color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      name: 'inventoryLogs',
      count: stats.inventoryLogs,
      description: 'Historical stock adjust trails, incoming batches & audit logs',
      color: 'from-slate-500/20 to-slate-700/10 border-slate-700 text-slate-300',
    },
  ];

  const filteredDocs = collectionDocs.filter((docItem) => {
    if (!docSearch.trim()) return true;
    const queryStr = docSearch.toLowerCase();
    const strRep = JSON.stringify(docItem).toLowerCase();
    return strRep.includes(queryStr);
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              Firebase Firestore Database
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cloud persistence, collection inspection, live data synchronization, and database provisioning management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePing}
            disabled={testingPing}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{testingPing ? 'Pinging Cloud...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={handleForceSeed}
            disabled={seeding}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Populating Cloud DB...' : 'Populate Master Data'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Firestore Database ID
            </span>
            <p className="text-xs font-mono font-medium text-white truncate" title={config.firestoreDatabaseId}>
              {config.firestoreDatabaseId}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Google Cloud Project ID
            </span>
            <p className="text-xs font-mono font-medium text-white truncate" title={config.projectId}>
              {config.projectId}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ping Latency & Security
            </span>
            <p className="text-xs font-medium text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{pingResult ? `${pingResult.latencyMs}ms (Online)` : 'Checking status...'}</span>
              <span className="text-[10px] text-slate-400 ml-1">· Rules Deployed</span>
            </p>
          </div>
        </div>
      </div>

      {/* Collection Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Live Firestore Collections</span>
          </h2>
          <button
            onClick={() => {
              loadStats();
              loadDocuments(selectedCollection);
            }}
            disabled={loading}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh Counts</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {collectionCards.map((col) => {
            const isSelected = selectedCollection === col.name;
            return (
              <button
                key={col.name}
                type="button"
                onClick={() => handleSelectCollection(col.name)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white capitalize">
                    {col.name}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${col.color}`}
                  >
                    {col.count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                {isSelected && (
                  <span className="text-[10px] text-indigo-400 font-semibold mt-2.5 flex items-center gap-1">
                    <span>Inspecting collection</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Collection Document Inspector */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        {/* Inspector Header */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              collection('/{selectedCollection}')
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ({filteredDocs.length} loaded)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter documents..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        {/* Inspector Content */}
        <div className="p-4">
          {loadingDocs ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin text-indigo-400 mb-2" />
              <p>Fetching documents from Firestore /{selectedCollection}...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-3">
              <HardDrive className="w-8 h-8 mx-auto text-slate-600" />
              <p>No documents found in collection '{selectedCollection}'.</p>
              <button
                onClick={handleForceSeed}
                className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-semibold transition-colors"
              >
                Populate Initial Records
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredDocs.map((docItem, idx) => (
                <div
                  key={docItem.id || idx}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                    <span className="text-xs font-mono font-semibold text-indigo-300">
                      ID: {docItem.id || `doc-${idx}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {docItem.updatedAt || docItem.createdAt || docItem.date || 'Firestore Doc'}
                    </span>
                  </div>

                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40">
                    {JSON.stringify(docItem, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual Insert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono">
                Insert Document into '/{selectedCollection}'
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Document ID (optional, autogenerated if blank)
                </label>
                <input
                  type="text"
                  placeholder="e.g. prod-custom-01"
                  value={newDocId}
                  onChange={(e) => setNewDocId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  JSON Payload
                </label>
                <textarea
                  rows={7}
                  value={newDocJson}
                  onChange={(e) => setNewDocJson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-3 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Write to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
