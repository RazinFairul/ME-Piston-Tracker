import React, { useState } from 'react';

export default function PartOrdering({
  orderList = [],
  setOrderList,
  spareList = [],
  setSpareList,
  outputList = [],
}) {
  const [orderVariant, setOrderVariant] = useState('PFI A00');
  const [orderOpening, setOrderOpening] = useState('0');
  const [orderReceipt, setOrderReceipt] = useState('0');
  const [orderReorder, setOrderReorder] = useState('0');
  const [orderLead, setOrderLead] = useState('0');

  const [sparePart, setSparePart] = useState('Circlip Pusher');
  const [sparePosition, setSparePosition] = useState('STN2010-3M Left');

  const totalOutputPistons = outputList.reduce((acc, curr) => acc + Number(curr.pistons || 0), 0);

  const handleAddOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      id: Date.now(),
      variant: orderVariant,
      opening: parseInt(orderOpening, 10) || 0,
      receipt: parseInt(orderReceipt, 10) || 0,
      reorder: parseInt(orderReorder, 10) || 0,
      lead: parseInt(orderLead, 10) || 0,
    };
    setOrderList((prev) => [newOrder, ...prev]);
    alert('Part settings saved in storage!');
  };

  const handleAddSpare = (e) => {
    e.preventDefault();
    const newSpare = {
      id: Date.now(),
      part: sparePart,
      position: sparePosition,
      date: new Date().toLocaleString('en-GB'),
    };
    setSpareList((prev) => [newSpare, ...prev]);
    alert('Spare replacement log saved!');
  };

  return (
    <section id="ordering" className="tab-content active">
      <div className="section-head">
        <div>
          <h2>Part Ordering</h2>
          <p>Track supplier receipts and part-set consumption against piston production.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleAddOrder}>
        <label>
          Variant
          <select value={orderVariant} onChange={(e) => setOrderVariant(e.target.value)}>
            <option>PFI A00</option>
            <option>AFD</option>
            <option>BFN &amp; DFN</option>
            <option>MP</option>
          </select>
        </label>

        <label>
          Opening Part Stock (sets)
          <input
            type="number"
            min="0"
            value={orderOpening}
            onChange={(e) => setOrderOpening(e.target.value)}
          />
        </label>

        <label>
          Supplier Receipt (sets)
          <input
            type="number"
            min="0"
            value={orderReceipt}
            onChange={(e) => setOrderReceipt(e.target.value)}
          />
        </label>

        <label>
          Reorder Point (sets)
          <input
            type="number"
            min="0"
            value={orderReorder}
            onChange={(e) => setOrderReorder(e.target.value)}
          />
        </label>

        <label>
          Supplier Lead Time (days)
          <input
            type="number"
            min="0"
            value={orderLead}
            onChange={(e) => setOrderLead(e.target.value)}
          />
        </label>

        <div className="full-width">
          <button className="btn primary" type="submit">
            Save Part Setting
          </button>
        </div>
      </form>

      <div className="panel">
        <h3>Part Stock Tracking</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variant</th>
                <th>Initial Stock</th>
                <th>Receipts</th>
                <th>Consumed (Pistons)</th>
                <th>Remaining</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No part configurations added yet.
                  </td>
                </tr>
              ) : (
                orderList.map((ord) => {
                  const consumed = outputList
                    .filter((o) => o.variant === ord.variant)
                    .reduce((acc, curr) => acc + Number(curr.pistons || 0), 0);
                  const remaining = ord.opening + ord.receipt - consumed;
                  return (
                    <tr key={ord.id}>
                      <td>{ord.variant}</td>
                      <td>{ord.opening}</td>
                      <td>{ord.receipt}</td>
                      <td>{consumed}</td>
                      <td style={{ fontWeight: 'bold', color: remaining <= ord.reorder ? '#b42318' : '#167a3f' }}>
                        {remaining}
                      </td>
                      <td>
                        <button
                          className="btn danger small"
                          type="button"
                          onClick={() => setOrderList(orderList.filter((x) => x.id !== ord.id))}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel spare-lifetime-panel">
        <div className="dashboard-title">
          <div>
            <h3>Spare Part Lifetime</h3>
            <p className="small-note">Track piston output between replacements.</p>
          </div>
        </div>

        <form className="form-grid spare-form" onSubmit={handleAddSpare}>
          <label>
            Spare Part
            <select value={sparePart} onChange={(e) => setSparePart(e.target.value)}>
              <option>Circlip Pusher</option>
              <option>Compress Head Socket</option>
            </select>
          </label>

          <label>
            Position
            <select value={sparePosition} onChange={(e) => setSparePosition(e.target.value)}>
              <option>STN2010-3M Left</option>
              <option>STN2010-3M Right</option>
              <option>STN2010-4M Left</option>
              <option>STN2010-4M Right</option>
            </select>
          </label>

          <div className="form-actions full-width">
            <button className="btn primary" type="submit">
              Save Lifetime Record
            </button>
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Spare Part</th>
                <th>Position</th>
                <th>Last Replacement</th>
                <th>Pistons Since Replacement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {spareList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="small-note" style={{ textAlign: 'center', padding: '16px' }}>
                    No spare part logs saved.
                  </td>
                </tr>
              ) : (
                spareList.map((sp) => (
                  <tr key={sp.id}>
                    <td>{sp.part}</td>
                    <td>{sp.position}</td>
                    <td>{sp.date}</td>
                    <td>
                      <b>{totalOutputPistons}</b>
                    </td>
                    <td>
                      <button
                        className="btn danger small"
                        type="button"
                        onClick={() => setSpareList(spareList.filter((x) => x.id !== sp.id))}
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