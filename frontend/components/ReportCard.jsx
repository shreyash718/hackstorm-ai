'use client';

export default function ReportCard({ report, onHome }) {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const ScoreBar = ({ label, value }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-slate-200 text-sm font-semibold">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getScoreBg(value)}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-mono py-12 px-6">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={onHome} className="text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          ← back to home
        </button>

        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.2em] text-slate-500 mb-4">INTERVIEW COMPLETE</div>
          <div className={`text-7xl font-bold ${getScoreColor(report.overall_score)} leading-none mb-6`}>
            {report.overall_score}<span className="text-3xl text-slate-600">/10</span>
          </div>
          <div>
            <span className={`inline-block border px-6 py-2 rounded-lg text-sm font-bold tracking-widest ${
              report.hire_recommendation === 'Strong Hire' ? 'bg-green-900/30 text-green-400 border-green-800' :
              report.hire_recommendation === 'Hire' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
              'bg-red-900/30 text-red-400 border-red-800'
            }`}>
              {report.hire_recommendation?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-6 mb-6 shadow-lg">
          <div className="text-[10px] tracking-widest text-slate-500 mb-4">SUMMARY</div>
          <p className="text-slate-300 text-sm leading-relaxed">{report.summary}</p>
        </div>

        <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-6 mb-6 shadow-lg">
          <div className="text-[10px] tracking-widest text-slate-500 mb-6">SCORES</div>
          <ScoreBar label="Problem Solving" value={report.problem_solving} />
          <ScoreBar label="Code Quality" value={report.code_quality} />
          <ScoreBar label="Communication" value={report.communication} />
          <ScoreBar label="Optimization" value={report.optimization || report.problem_solving} />
          
          <div className="flex gap-12 mt-6 pt-6 border-t border-slate-800">
            <div>
              <div className="text-[10px] tracking-widest text-slate-500 mb-2">TIME COMPLEXITY</div>
              <div className="text-indigo-400 font-semibold">{report.time_complexity}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-slate-500 mb-2">SPACE COMPLEXITY</div>
              <div className="text-indigo-400 font-semibold">{report.space_complexity}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-6 shadow-lg">
            <div className="text-[10px] tracking-widest text-green-500 mb-4">STRENGTHS</div>
            <ul className="space-y-3">
              {(report.strengths || []).map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-green-500">✓</span> <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-6 shadow-lg">
            <div className="text-[10px] tracking-widest text-orange-500 mb-4">TO IMPROVE</div>
            <ul className="space-y-3">
              {(report.improvements || []).map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-orange-500">→</span> <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={onHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest py-4 rounded-xl transition-colors shadow-lg"
        >
          START NEW INTERVIEW
        </button>
      </div>
    </div>
  );
}
