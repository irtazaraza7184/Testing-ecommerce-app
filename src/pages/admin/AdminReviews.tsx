import React, { useEffect, useState } from 'react';
import { Star, Trash2, CheckCircle, EyeOff, Eye, Search, AlertCircle } from 'lucide-react';
import { Review } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const toast = useToast();

  const loadReviews = async () => {
    setLoading(true);
    const data = await orderService.getReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const toggleStatus = async (rev: Review) => {
    const nextStatus = rev.status === 'approved' ? 'hidden' : 'approved';
    await orderService.updateReviewStatus(rev.id, nextStatus);
    toast.info(`Review status updated to: ${nextStatus.toUpperCase()}`);
    loadReviews();
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    await orderService.deleteReview(reviewToDelete.id);
    toast.info('Review removed from public records.');
    setReviewToDelete(null);
    loadReviews();
  };

  const filtered = reviews.filter(
    (r) =>
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Collector Reviews & Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review customer feedback, verify purchases, and moderate public testimonials
        </p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search reviews by client or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-mono">{filtered.length} total reviews</span>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product Object</th>
                <th className="py-3 px-4">Collector</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Comment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white max-w-[180px] truncate">
                    {r.productName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">{r.customerName}</span>
                    <span className="text-[11px] text-slate-500">{r.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-mono font-bold text-white">{r.rating}.0</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <strong className="text-white block text-xs mb-0.5">{r.title}</strong>
                    <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                      {r.comment}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{r.date}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        r.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(r)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                      >
                        {r.status === 'approved' ? 'Hide' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setReviewToDelete(r)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {reviewToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setReviewToDelete(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Delete Collector Review</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this feedback from{' '}
              <strong>{reviewToDelete.customerName}</strong>?
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setReviewToDelete(null)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
