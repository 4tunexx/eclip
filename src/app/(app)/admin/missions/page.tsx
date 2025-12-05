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

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  isDaily: boolean;
  objectiveValue: number;
  rewardXp: number;
  rewardCoins: string;
  isActive: boolean;
}

export default function MissionsAdmin() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Mission>>({
    category: 'PLATFORM',
    isDaily: false,
    objectiveValue: 1,
    rewardXp: 100,
    rewardCoins: '0',
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  async function fetchMissions() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/missions');
      if (!res.ok) throw new Error('Failed to fetch missions');
      const data = await res.json();
      setMissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.description) {
        setError('Title and description are required');
        return;
      }

      const url = editingId ? `/api/admin/missions/${editingId}` : '/api/admin/missions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save mission');

      await fetchMissions();
      setFormData({
        category: 'PLATFORM',
        isDaily: false,
        objectiveValue: 1,
        rewardXp: 100,
        rewardCoins: '0',
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      const res = await fetch(`/api/admin/missions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete mission');
      await fetchMissions();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleEdit(mission: Mission) {
    setFormData(mission);
    setEditingId(mission.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Missions Management</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Create'} Mission</h2>

        <Input
          placeholder="Title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <Select
          value={formData.category}
          onValueChange={(val) => setFormData({ ...formData, category: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="PLATFORM">Platform</SelectItem>
            <SelectItem value="INGAME">In-Game</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Objective Value"
          type="number"
          value={formData.objectiveValue || 1}
          onChange={(e) => setFormData({ ...formData, objectiveValue: parseInt(e.target.value) })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Reward XP"
          type="number"
          value={formData.rewardXp || 100}
          onChange={(e) => setFormData({ ...formData, rewardXp: parseInt(e.target.value) })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Reward Coins"
          type="number"
          value={formData.rewardCoins || '0'}
          onChange={(e) => setFormData({ ...formData, rewardCoins: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Mission
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: 'PLATFORM',
                  isDaily: false,
                  objectiveValue: 1,
                  rewardXp: 100,
                  rewardCoins: '0',
                });
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 bg-gray-800">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Objective</TableHead>
              <TableHead>XP Reward</TableHead>
              <TableHead>Coin Reward</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission.id} className="border-gray-800">
                <TableCell className="font-medium">{mission.title}</TableCell>
                <TableCell>
                  <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">
                    {mission.category}
                  </span>
                </TableCell>
                <TableCell>{mission.objectiveValue}</TableCell>
                <TableCell>{mission.rewardXp}</TableCell>
                <TableCell>{mission.rewardCoins}</TableCell>
                <TableCell>{mission.isActive ? '✅' : '❌'}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={() => handleEdit(mission)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(mission.id)}
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
    </div>
  );
}
