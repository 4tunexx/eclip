'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ESRTier {
  id: string;
  tier: string;
  division: number;
  minEsr: number;
  maxEsr: number;
  label: string;
}

export default function ESRRanksAdmin() {
  const [tiers, setTiers] = useState<ESRTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ESRTier>>({
    tier: 'Beginner',
    division: 1,
    minEsr: 0,
    maxEsr: 500,
  });

  const TIER_NAMES = [
    'Beginner',
    'Rookie',
    'Pro',
    'Ace',
    'Legend',
  ] as const;

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/esr-tiers');
      if (!res.ok) throw new Error('Failed to fetch ESR tiers');
      const data = await res.json();
      setTiers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (
        !formData.tier ||
        formData.division === undefined ||
        formData.minEsr === undefined ||
        formData.maxEsr === undefined
      ) {
        setError('All fields are required');
        return;
      }

      const url = editingId ? `/api/admin/esr-tiers/${editingId}` : '/api/admin/esr-tiers';
      const method = editingId ? 'PUT' : 'POST';

      const esrData = {
        ...formData,
        label: `${formData.tier} ${formData.division === 1 ? 'I' : formData.division === 2 ? 'II' : 'III'}`,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(esrData),
      });

      if (!res.ok) throw new Error('Failed to save ESR tier');

      await fetchTiers();
      setFormData({
        tier: 'Beginner',
        division: 1,
        minEsr: 0,
        maxEsr: 500,
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      const res = await fetch(`/api/admin/esr-tiers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tier');
      await fetchTiers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleEdit(tier: ESRTier) {
    setFormData(tier);
    setEditingId(tier.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ESR Ranks & Tiers</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Create'} ESR Tier</h2>

        <Select
          value={formData.tier}
          onValueChange={(val) => setFormData({ ...formData, tier: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            {TIER_NAMES.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(formData.division || 1)}
          onValueChange={(val) => setFormData({ ...formData, division: parseInt(val) })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Division I</SelectItem>
            <SelectItem value="2">Division II</SelectItem>
            <SelectItem value="3">Division III</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Minimum ESR"
          type="number"
          value={formData.minEsr || 0}
          onChange={(e) => setFormData({ ...formData, minEsr: parseInt(e.target.value) || 0 })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Maximum ESR"
          type="number"
          value={formData.maxEsr || 500}
          onChange={(e) => setFormData({ ...formData, maxEsr: parseInt(e.target.value) || 500 })}
          className="bg-gray-800 border-gray-700"
        />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Tier
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  tier: 'Beginner',
                  division: 1,
                  minEsr: 0,
                  maxEsr: 500,
                });
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 border border-blue-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">📋 ESR Tier Structure</h3>
        <ul className="text-sm space-y-1 text-blue-100">
          <li>• <strong>Beginner:</strong> 0-900 ESR (3 divisions)</li>
          <li>• <strong>Rookie:</strong> 900-1300 ESR (3 divisions)</li>
          <li>• <strong>Pro:</strong> 1300-1900 ESR (3 divisions)</li>
          <li>• <strong>Ace:</strong> 1900-2200 ESR (3 divisions)</li>
          <li>• <strong>Legend:</strong> 2200+ ESR (3 divisions)</li>
        </ul>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 bg-gray-800">
              <TableHead>Tier</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Min ESR</TableHead>
              <TableHead>Max ESR</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.id} className="border-gray-800">
                <TableCell className="font-semibold">{tier.tier}</TableCell>
                <TableCell>
                  <span className="bg-cyan-900 text-cyan-200 px-2 py-1 rounded text-sm">
                    {tier.division === 1 ? 'I' : tier.division === 2 ? 'II' : 'III'}
                  </span>
                </TableCell>
                <TableCell className="font-mono font-semibold">{tier.minEsr}</TableCell>
                <TableCell className="font-mono font-semibold">{tier.maxEsr}</TableCell>
                <TableCell className="bg-gray-800 px-2 py-1 rounded text-yellow-300">
                  {tier.label}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={() => handleEdit(tier)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(tier.id)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tier Progression Guide */}
      <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">🎮 Progression Guide</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-green-400">Standard Progression</div>
            <ul className="text-gray-300 space-y-1 mt-2">
              <li>• Win: +25 ESR</li>
              <li>• Loss: -15 ESR</li>
              <li>• Consecutive Wins: +5 bonus per win</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-400">Tier Requirements</div>
            <ul className="text-gray-300 space-y-1 mt-2">
              <li>• 15 tiers total (5 ranks × 3 divisions)</li>
              <li>• Each division ~250-400 ESR range</li>
              <li>• Legend tier is 2200+ ESR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
