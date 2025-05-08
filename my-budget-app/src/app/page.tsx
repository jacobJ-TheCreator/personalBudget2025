'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Misc'];

type Expense = {
  name: string;
  amount: number;
  category: string;
};

type BudgetLimit = {
  [category: string]: number;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f'];

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [limits, setLimits] = useState<BudgetLimit>({});

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('budget-data') || '[]');
    const savedLimits = JSON.parse(localStorage.getItem('budget-limits') || '{}');
    setExpenses(savedExpenses);
    setLimits(savedLimits);
  }, []);

  useEffect(() => {
    localStorage.setItem('budget-data', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget-limits', JSON.stringify(limits));
  }, [limits]);

  const addExpense = () => {
    if (!name || !amount) return;
    setExpenses([...expenses, {
      name,
      amount: parseFloat(amount),
      category,
    }]);
    setName('');
    setAmount('');
    setCategory(categories[0]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateLimit = (cat: string, value: string) => {
    setLimits({
      ...limits,
      [cat]: parseFloat(value) || 0
    });
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = categories.map((cat) => {
    const spent = expenses.filter(e => e.category === cat)
                          .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, spent, limit: limits[cat] || 0 };
  });

  const pieData = categoryTotals
    .filter(d => d.spent > 0)
    .map(d => ({ name: d.name, value: d.spent }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-8">
        <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-2">
          <span role="img" aria-label="money">💰</span> Budget Tracker
        </h1>

        {/* Add Expense */}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Expense name"
            className="border border-slate-300 bg-white p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="border border-slate-300 bg-white p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="border border-slate-300 bg-white p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={addExpense}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Monthly Limits */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">📊 Monthly Limits</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2">
                <label className="w-24 text-slate-700">{cat}</label>
                <input
                  type="number"
                  className="border border-slate-300 bg-white p-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                  placeholder="Limit"
                  value={limits[cat] || ''}
                  onChange={(e) => updateLimit(cat, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">🧾 Expenses</h2>
          <ul className="divide-y">
            {expenses.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-2">
                <div className="text-slate-700">
                  <strong>{item.name}</strong> — ${item.amount.toFixed(2)} [{item.category}]
                </div>
                <button
                  onClick={() => removeExpense(index)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="text-right font-bold text-lg text-slate-800">
          Total: ${total.toFixed(2)}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">📈 Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">📊 Spent vs Limit</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryTotals}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spent" fill="#8884d8" name="Spent" />
                <Bar dataKey="limit" fill="#82ca9d" name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
