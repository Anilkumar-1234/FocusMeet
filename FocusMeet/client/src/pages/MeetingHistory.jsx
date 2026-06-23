import React from "react";

function MeetingHistory() {

  const reports =
    JSON.parse(
      localStorage.getItem(
        "meetingHistory"
      )
    ) || [];

  return (

  <>
    <style>{`
      :root {
        --primary: #4f46e5;
        --primary-hover: #4338ca;
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --text: #1e293b;
        --text-light: #64748b;
        --border: #e2e8f0;
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        --radius: 12px;
        --transition: 0.2s ease;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f1f5f9;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: var(--text);
      }

      .history-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 24px;
      }

      .history-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .history-header h1 {
        font-size: 2rem;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: fadeSlideDown 0.5s ease-out;
      }

      @keyframes fadeSlideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: var(--card-bg);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        color: var(--text-light);
        font-size: 1.1rem;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .history-grid {
        display: grid;
        gap: 20px;
      }

      .report-card {
        background: var(--card-bg);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        padding: 24px;
        transition: transform var(--transition), box-shadow var(--transition);
        animation: cardAppear 0.4s ease-out backwards;
        position: relative;
        overflow: hidden;
      }

      .report-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      .report-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, var(--primary), #7c3aed);
        border-radius: 4px 0 0 4px;
        opacity: 0;
        transition: opacity var(--transition);
      }

      .report-card:hover::before {
        opacity: 1;
      }

      @keyframes cardAppear {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .report-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .report-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .stat-item {
        background: #f8fafc;
        padding: 10px 14px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .stat-label {
        font-size: 0.9rem;
        color: var(--text-light);
      }

      .stat-value {
        font-weight: 600;
      }

      .top-performer-highlight {
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        padding: 10px 14px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-weight: 600;
      }

      .ai-insights-box {
        background: #f0f4ff;
        border-radius: 8px;
        padding: 14px;
        margin-top: 16px;
        font-size: 0.95rem;
        line-height: 1.6;
        white-space: pre-wrap;
        border-left: 4px solid var(--primary);
      }

      .ai-insights-box h4 {
        margin: 0 0 8px 0;
        font-size: 1rem;
        color: var(--primary);
      }

      @media (max-width: 640px) {
        .history-container {
          padding: 20px 16px;
        }
        .report-stats {
          grid-template-columns: 1fr;
        }
      }

      /* staggered animation delays for cards */
      .history-grid .report-card:nth-child(1) { animation-delay: 0.05s; }
      .history-grid .report-card:nth-child(2) { animation-delay: 0.1s; }
      .history-grid .report-card:nth-child(3) { animation-delay: 0.15s; }
      .history-grid .report-card:nth-child(4) { animation-delay: 0.2s; }
      .history-grid .report-card:nth-child(5) { animation-delay: 0.25s; }
      .history-grid .report-card:nth-child(6) { animation-delay: 0.3s; }
      .history-grid .report-card:nth-child(7) { animation-delay: 0.35s; }
      .history-grid .report-card:nth-child(8) { animation-delay: 0.4s; }
      .history-grid .report-card:nth-child(9) { animation-delay: 0.45s; }
      .history-grid .report-card:nth-child(10) { animation-delay: 0.5s; }
    `}</style>

    <div className="history-container">
      <div className="history-header">
        <h1>📜 Meeting History</h1>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          No meetings found.
        </div>
      ) : (
        <div className="history-grid">
          {reports
            .slice()
            .reverse()
            .map((report, index) => (
              <div key={index} className="report-card">
                <h3 className="report-title">
                  📹 {report.meetingId}
                </h3>

                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">📅 Date</span>
                    <span className="stat-value">{report.date}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">⏱ Duration</span>
                    <span className="stat-value">{report.duration}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🎯 Avg Focus</span>
                    <span className="stat-value">{report.averageFocus}%</span>
                  </div>
                </div>

                <div className="top-performer-highlight">
                  🏆 Top Performer: <strong>{report.topPerformer}</strong>
                </div>

                <div className="ai-insights-box">
                  <h4>🤖 AI Insights</h4>
                  {report.aiInsights}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  </>
);
}

export default MeetingHistory;