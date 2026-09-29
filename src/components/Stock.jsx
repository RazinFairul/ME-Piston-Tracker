import React, { useState } from 'react';

export default function Stock({ stockList = [], setStockList }) {
  const [stockDate, setStockDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [stockVariant, setStockVariant] = useState('PFI A00');
  const [stockType, setStockType] = useState('OUT');
  const [stockUnit, setStockUnit] = useState('engine');
  const [stockQty, setStockQty] = useState('');
  const [stockRemarks, setStockRemarks] = useState('');

  const handleAddStock = (e) => {
    e.preventDefault();
    const qtyNum = parseInt(stockQty, 10) || 0;
    if (qtyNum <= 0) return;

    const pistons = stockUnit === 'engine' ? qtyNum * 4 : qtyNum;
    const engines = stockUnit === 'engine' ? qtyNum : (qtyNum / 4).toFixed(1);

    const newStock = {
      id: Date.now(),
      date: stockDate,
      variant: stockVariant,
      type: stockType,
      source: stockType === 'OUT' ? 'Manual Dispatch' : 'Opening / Lump-Sum',
      pistons: Number(pistons),
      engines: Number(engines),
      remarks: stockRemarks || '-',
    };

    setStockList((prev) => [newStock, ...prev]);
    setStockQty('');
    setStockRemarks('');
    alert('Stock transaction saved!');
  };

  const getStockBalance = (variant) => {
    return stockList.reduce((acc, curr) => {
      if (curr.variant === variant) {
        return curr.type === 'OUT' ? acc - Number(curr.engines || 0) : acc + Number(curr.engines || 0);
      }
      return acc;
    }, 0);
  };

  return (
    <section id="stock" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Stock</h2>
          <p>Daily Output is automatic Stock In. Only Stock Out and opening/lump-sum stock are entered manually.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddStock}>
        <label>
          Date
          <input
            type="date"
            value={stockDate}
            onChange={(e) => setStockDate(e.target.value)}
            required
          />
        </label>

        <label>
          Variant
          <select value={stockVariant} onChange={(e) => setStockVariant(e.target.value)}>
            <option>PFI A00</option>
            <option>AFD</option>
            <option>BFN &amp; DFN</option>
            <option>MP</option>
          </select>
        </label>

        <label>
          Transaction
          <select value={stockType} onChange={(e) => setStockType(e.target.value)}>
            <option value="OUT">Stock Out</option>
            <option value="OPENING">Opening / Lump-Sum Stock In</option>
          </select>
        </label>

        <label>
          Input Unit
          <select value={stockUnit} onChange={(e) => setStockUnit(e.target.value)}>
            <option value="engine">Engine</option>
            <option value="piston">Piston</option>
          </select>
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            step="1"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            required
          />
        </label>

        <label className="full-width">
          Remarks
          <textarea
            rows="2"
            placeholder="e.g. dispatched to main line..."
            value={stockRemarks}
            onChange={(e) => setStockRemarks(e.target.value)}
          />
        </label>

        <button className="btn primary" type="submit">
          Add Stock
        </button>
      </form>

      <div className="panel">
        <h3>Current Stock Balance</h3>
        <div className="stock-grid" style={{ marginTop: '10px' }}>
          {['PFI A00', 'AFD', 'BFN & DFN', 'MP'].map((v) => {
            const bal = Math.max(0, getStockBalance(v));
            return (
              <div key={v} className="stock-card">
                <div className="variant">{v}</div>
                <div className="engine">{bal} eng</div>
                <div className="piston">{bal * 4} pistons</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="table-head">
          <h3>Stock Transactions ({stockList.length})</h3>
          <button
            className="btn danger"
            type="button"
            onClick={() => {
              if (window.confirm('Clear all stored stock transaction logs?')) {
                setStockList([]);
              }
            }}
          >
            Clear Manual Stock Data
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Variant</th>
                <th>Type</th>
                <th>Source</th>
                <th>Pistons</th>
                <th>Engines</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stockList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No stock transactions logged.
                  </td>
                </tr>
              ) : (
                stockList.map((stk) => (
                  <tr key={stk.id}>
                    <td>{stk.date}</td>
                    <td>{stk.variant}</td>
                    <td style={{ fontWeight: 'bold', color: stk.type === 'OUT' ? '#b42318' : '#167a3f' }}>
                      {stk.type}
                    </td>
                    <td>{stk.source}</td>
                    <td>{stk.pistons}</td>
                    <td>{stk.engines}</td>
                    <td>{stk.remarks}</td>
                    <td>
                      <button
                        className="btn danger small"
                        type="button"
                        onClick={() => setStockList(stockList.filter((s) => s.id !== stk.id))}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}