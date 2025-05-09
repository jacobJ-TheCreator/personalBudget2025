'use client';

import { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type CleaningEntry = {
  date: string;
  rate: number;
};

export default function InvoicePage() {
  const [entries, setEntries] = useState<CleaningEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cleaning-invoice');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cleaning-invoice', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!selectedDate || !amount) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const newEntry = {
      date: localDate.toISOString(),
      rate: parseFloat(amount),
    };
    setEntries([...entries, newEntry]);
    setSelectedDate('');
    setAmount('');
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const filteredEntries = selectedMonth
    ? entries.filter((entry) => {
        const d = new Date(entry.date);
        const [y, m] = selectedMonth.split('-').map(Number);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      })
    : entries;

  const grouped = [];
  for (let i = 0; i < filteredEntries.length; i += 4) {
    grouped.push(filteredEntries.slice(i, i + 4));
  }

  const downloadPDF = async (invoiceNumber: number) => {
    const element = document.getElementById(`invoice-${invoiceNumber}`);
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`invoice-${invoiceNumber}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 p-6 text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧾 Office Cleaning Invoice</h1>
          <a href="/" className="text-blue-600 hover:underline text-sm">← Back to Budget</a>
        </div>

        {/* Add Cleaning */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">Add Cleaning:</label>
            <input
              type="date"
              className="border border-black p-2 rounded text-black"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              className="border border-black p-2 rounded text-black w-32"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={addEntry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label className="font-medium">Filter by Month:</label>
            <input
              type="month"
              className="border border-black p-2 rounded text-black"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <button
              onClick={() => setSelectedMonth('')}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Invoice Groups */}
        {grouped.map((group, index) => {
          const total = group.reduce((sum, e) => sum + e.rate, 0);
          return (
            <div key={index} className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Invoice #{index + 1}</h2>
                <button
                  onClick={() => downloadPDF(index + 1)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download PDF
                </button>
              </div>

              <div
                id={`invoice-${index + 1}`}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  padding: '16px',
                  borderRadius: '8px',
                  fontFamily: 'sans-serif',
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {group.map((item, i) => {
                    const d = new Date(item.date);
                    return (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span>{d.toDateString()}</span>
                        <span>${item.rate.toFixed(2)}</span>
                        <button
                          onClick={() => removeEntry(entries.indexOf(item))}
                          style={{
                            color: 'red',
                            fontSize: '0.875rem',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '8px' }}>
                  Total: ${total.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
