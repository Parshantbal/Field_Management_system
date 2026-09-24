import React, { useState, useEffect } from 'react';
import { ReportSummary } from '../../types';
import { api } from '../../api/client';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  HardHat,
  Building2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.reports.getSummary();
      setReport(data);
    } catch (e: any) {
      console.error('Failed to load report summary:', e);
      setError(e.message || 'Failed to generate operations report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm font-mono flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p>Generating Executive Maintenance & SLA Performance Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-slate-300 text-sm font-semibold">{error || 'No reporting data available.'}</p>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Loading Report</span>
        </button>
      </div>
    );
  }

  // Safe metrics calculations
  const totalWos = report.totalWorkOrders || 0;
  const completedWos = report.completedWorkOrders || 0;
  const openWos = report.openWorkOrders ?? (totalWos - completedWos);
  const breachedWos = report.breachedWorkOrders || 0;
  const slaRate = report.slaCompliancePercentage ?? 100;
  const laborCost = Number(report.totalLaborCost) || 0;
  const partsCost = Number(report.totalPartsCost) || 0;
  const grandCost = Number(report.grandTotalCost) || (laborCost + partsCost);

  // Compute average rating from technician metrics if available
  const techMetrics = report.technicianMetrics || [];
  const avgRating = techMetrics.length > 0
    ? (techMetrics.reduce((acc, t) => acc + (t.averageRating || 5), 0) / techMetrics.length)
    : 5.0;

  const facilityBreakdown = report.facilityBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Operations & SLA Performance Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contractual SLA compliance, maintenance expenditures, resolution throughput, and technician scores
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            SLA Compliance Rate
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
            {slaRate.toFixed(1)}%
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              slaRate >= 95 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {slaRate >= 95 ? 'Target Met' : 'Review Needed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Breached: <span className="font-semibold text-slate-400">{breachedWos} orders</span>
          </p>
        </div>

        {/* Total Orders / Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Orders Resolution
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
            {completedWos}
            <span className="text-base text-slate-400 font-normal">/ {totalWos} Total</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalWos > 0 ? (completedWos / totalWos) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Active in Pipeline: <span className="font-semibold text-slate-400">{openWos}</span>
          </p>
        </div>

        {/* Total Maintenance Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Maintenance Cost
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            ${grandCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Labor: ${laborCost.toFixed(2)} &bull; Parts: ${partsCost.toFixed(2)}
          </p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Customer CSAT Rating
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2 flex items-center gap-1.5">
            <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            <span>{avgRating.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Based on field technician work feedback</p>
        </div>
      </div>

      {/* Cost Breakdown & Technician Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Analysis Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Expenditure Composition</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Labor Expense</span>
                <span className="font-semibold text-white">${laborCost.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${grandCost > 0 ? (laborCost / grandCost) * 100 : 50}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Replacement Spare Parts</span>
                <span className="font-semibold text-white">${partsCost.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${grandCost > 0 ? (partsCost / grandCost) * 100 : 50}%`
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
              Operating costs are calculated automatically from technician clock-in hourly rates and warehouse inventory deduction costs.
            </div>
          </div>
        </div>

        {/* Top Technicians Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HardHat className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Technician Performance Benchmarks</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">Specialist</th>
                  <th className="pb-3 font-semibold">Specialization</th>
                  <th className="pb-3 font-semibold text-center">Jobs Assigned</th>
                  <th className="pb-3 font-semibold text-right">CSAT Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {techMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                      No technician metrics recorded yet.
                    </td>
                  </tr>
                ) : (
                  techMetrics.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        {t.technicianName}
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{t.specialization}</td>
                      <td className="py-3 text-center text-slate-300 font-mono">{t.assignedCount}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{(t.averageRating || 5.0).toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Facility Cost Breakdown */}
      {facilityBreakdown.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Commercial Facility Expenditure Breakdown</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilityBreakdown.map((fac, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                <div className="text-sm font-semibold text-white truncate">{fac.facilityName}</div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-xs text-slate-400">Total Spend:</span>
                  <span className="text-base font-bold text-brand-400">
                    ${Number(fac.totalCost || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 text-xs text-slate-500">
                  <span>Work Orders:</span>
                  <span className="font-mono text-slate-300">{fac.workOrderCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
