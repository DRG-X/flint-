export default function ComparisonTable({ quotes, bestProvider }) {
  const fmt = (n) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const fmtRate = (n) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(n);

  const worstReceive = quotes[quotes.length - 1]?.receive_amount ?? 0;

  return (
    <div>
      <div className="section-label">Full Comparison</div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Provider</th>
              <th>Exchange Rate</th>
              <th>Fee ({quotes[0]?.currency_from})</th>
              <th>You Receive ({quotes[0]?.currency_to})</th>
              <th>vs Worst</th>
              <th>Transfer Time</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, i) => {
              const isBest = q.provider === bestProvider;
              const diff = q.receive_amount - worstReceive;
              return (
                <tr key={q.provider} className={isBest ? "row-best" : ""}>
                  <td><span className={`rank-badge rank-${i + 1}`}>{i + 1}</span></td>
                  <td>
                    <span className="td-provider">
                      {q.provider}
                      {isBest && <span className="td-best-tag">Best</span>}
                    </span>
                  </td>
                  <td className="td-mono">{fmtRate(q.exchange_rate)}</td>
                  <td className="td-mono">{fmt(q.fee)}</td>
                  <td className="td-mono td-receive">{fmt(q.receive_amount)}</td>
                  <td className="td-mono" style={{ color: diff > 0 ? "var(--green)" : "var(--muted)" }}>
                    {diff > 0 ? `+${fmt(diff)}` : "—"}
                  </td>
                  <td className="td-mono" style={{ color: "var(--muted)" }}>{q.transfer_time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}