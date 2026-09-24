import React, { useState, useEffect } from 'react';
import { Facility, Asset, Priority } from '../../types';
import { api } from '../../api/client';
import { X, Plus, AlertTriangle } from 'lucide-react';

interface CreateWorkOrderModalProps {
  onClose: () => void;
  onCreated: () => void;
  facilities: Facility[];
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  onClose,
  onCreated,
  facilities,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [facilityId, setFacilityId] = useState<number>(facilities[0]?.id || 1);
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (facilities && facilities.length > 0) {
      if (!facilityId || !facilities.some(f => f.id === facilityId)) {
        setFacilityId(facilities[0].id);
      }
    }
  }, [facilities, facilityId]);

  useEffect(() => {
    if (facilityId) {
      api.facilities.getAssets(facilityId).then(setAssets).catch(console.error);
    }
  }, [facilityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !facilityId) return;

    setIsSubmitting(true);
    try {
      await api.workOrders.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        facilityId,
        assetId: assetId || undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      alert(`Failed to create work order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create New Work Order</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Work Order Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chiller Unit #2 High Head Pressure Alarm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Priority Level <span className="text-rose-400">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="CRITICAL">Critical (1h Response / 4h Resolve)</option>
                <option value="HIGH">High (4h Response / 24h Resolve)</option>
                <option value="MEDIUM">Medium (8h Response / 48h Resolve)</option>
                <option value="LOW">Low (24h Response / 5d Resolve)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Facility Complex <span className="text-rose-400">*</span>
              </label>
              <select
                value={facilityId}
                onChange={(e) => {
                  setFacilityId(Number(e.target.value));
                  setAssetId(undefined);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tagged Equipment / Asset (Optional)
            </label>
            <select
              value={assetId || ''}
              onChange={(e) => setAssetId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- No specific asset / Facility-wide --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} [{a.tagNumber}] - {a.floor ? `${a.floor}, ${a.room}` : a.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Detailed Scope of Work & Diagnostics <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe symptoms, error codes, location in building, and hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Submit Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
