export default function BestProviderCard({ best, savings, currencyTo }) {
  const fmt = (n) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const fmtRate = (n) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(n);

  return (
    <div className="best-card">
      <div>
        <div className="best-badge">
          <span>★</span> Best Deal
        </div>
        <div className="best-provider-name">{best.provider}</div>
        <div className="best-meta">
          <span>Rate: {fmtRate(best.exchange_rate)}</span>
          <span>Fee: {best.currency_from} {fmt(best.fee)}</span>
          <span>⏱ {best.transfer_time}</span>
        </div>
        {savings > 0 && (
          <div className="savings-pill">
            ↑ You receive {currencyTo} {fmt(savings)} more than the worst option
          </div>
        )}
      </div>
      <div className="best-receive">
        <div className="best-receive-label">You receive</div>
        <div className="best-receive-amount">
          {fmt(best.receive_amount)}{" "}
          <span className="best-receive-currency">{currencyTo}</span>
        </div>
      </div>
    </div>
  );
}